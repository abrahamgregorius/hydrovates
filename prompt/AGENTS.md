````markdown
# AGENTS.md

## Project Overview

**Project:** Early Risk Predictive AI Assistant for Flood Mitigation

This project is a low-cost, AI-powered flood early warning system designed for communities in flood-prone areas. It uses open environmental and historical flood data instead of relying on expensive physical sensor infrastructure.

The system predicts flood probability and severity using an ensemble machine learning approach and exposes the results through a lightweight Progressive Web Application (PWA).

## Product Goal

Build a reliable, accessible, and lightweight system that answers:

> "Is my area at risk of flooding, how severe could it be, and what should I do?"

The application should prioritize:

- Early warning
- Simplicity
- Accessibility
- Low bandwidth usage
- Explainable predictions
- Geographic relevance
- Reliability

This is a decision-support and early-warning system, not a replacement for official disaster-management authorities.

---

# Architecture

```text
                        ┌──────────────────┐
                        │   Open-Meteo API │
                        └────────┬─────────┘
                                 │
                                 ▼
┌──────────────────┐      ┌───────────────┐
│ Historical Flood │─────▶│ Data Pipeline │
│      Data        │      └───────┬───────┘
└──────────────────┘              │
                                  ▼
                         ┌─────────────────┐
                         │ Feature         │
                         │ Engineering     │
                         └────────┬────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │ ML Prediction Service  │
                     │                        │
                     │ Random Forest          │
                     │ + XGBoost              │
                     └────────────┬───────────┘
                                  │
                                  ▼
                           ┌────────────┐
                           │ Supabase   │
                           │ PostgreSQL │
                           └─────┬──────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │ React + Vite │
                         │     PWA      │
                         └──────┬───────┘
                                │
                                ▼
                             Citizen
```
````

---

# Technology Stack

## Frontend

- React
- JSX
- Vite
- PWA
- Responsive CSS
- Map library compatible with project requirements

## Backend

- Supabase
- PostgreSQL
- Supabase Auth if authentication is required
- Supabase Edge Functions where appropriate

## Machine Learning

- Python
- pandas
- NumPy
- scikit-learn
- XGBoost
- FastAPI for serving the prediction model

## External Data

Primary weather source:

- Open-Meteo API

Potential additional datasets:

- Government historical flood records
- Geographic/elevation datasets
- River and watershed data
- Land-use data

---

# Repository Structure

Use a modular structure similar to:

```text
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── package.json
│
├── ml/
│   ├── data/
│   ├── notebooks/
│   ├── src/
│   │   ├── preprocessing/
│   │   ├── features/
│   │   ├── models/
│   │   ├── evaluation/
│   │   └── inference/
│   ├── tests/
│   └── requirements.txt
│
├── api/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── core/
│   └── requirements.txt
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── docs/
│
├── .env.example
├── AGENTS.md
└── README.md
```

Adapt the structure if the repository already has an established architecture. Do not unnecessarily reorganize an existing codebase.

---

# Core Product Features

## 1. Location Detection

Users must be able to:

- Use current GPS location
- Search for a location
- Select a location manually

The selected location becomes the basis for risk prediction.

Do not assume GPS permission will always be available.

Provide a fallback manual location selection.

---

## 2. Flood Risk Dashboard

The dashboard should clearly display:

- Location
- Current risk level
- Risk score
- Flood probability
- Prediction timestamp
- Forecast period
- Main contributing factors
- Recommended action

Example:

```text
JAKARTA SELATAN

HIGH RISK

78%
Flood Probability

Updated 10 minutes ago

Main factors:
• Heavy rainfall forecast
• Recent rainfall accumulation
• Historical flood frequency

Recommended:
Prepare essential belongings and
monitor official evacuation information.
```

The risk level must be immediately understandable without technical knowledge.

---

# Risk Classification

Use the following initial thresholds:

|  Score | Level    |
| -----: | -------- |
|   0–20 | Very Low |
|  21–40 | Low      |
|  41–60 | Moderate |
|  61–80 | High     |
| 81–100 | Critical |

These are initial product thresholds.

They must not be treated as scientifically validated thresholds.

The ML/data team should calibrate them based on validation results.

Keep thresholds configurable rather than hard-coded throughout the UI.

---

# Machine Learning

## Prediction Target

The system should produce:

```text
flood_probability
risk_score
risk_level
severity
```

Example:

```json
{
    "flood_probability": 0.82,
    "risk_score": 82,
    "risk_level": "critical",
    "severity": "severe"
}
```

## Models

The baseline ensemble consists of:

1. Random Forest
2. XGBoost

Do not assume that combining two models automatically improves performance.

Always compare:

- Random Forest
- XGBoost
- Ensemble

using the same validation methodology.

---

# Important ML Principle

Flood prediction is a time-dependent prediction problem.

Do not randomly split temporal observations when doing so would cause future information to leak into the training set.

Prefer:

- Time-based train/validation/test splits
- Rolling validation where appropriate

Avoid:

```python
train_test_split(random_state=42)
```

for temporal evaluation unless there is a strong justification.

---

# Data Leakage

Prevent leakage at every stage.

Do not allow:

- Future rainfall data
- Future flood labels
- Post-event measurements
- Information unavailable at prediction time

to enter the feature set.

Every feature must answer:

> "Would this information actually be available when the warning is generated?"

If not, it cannot be used.

---

# Feature Engineering

Potential features include:

## Weather

- Current precipitation
- Precipitation in previous 1h
- Precipitation in previous 3h
- Precipitation in previous 6h
- Precipitation in previous 12h
- Precipitation in previous 24h
- Forecast precipitation
- Temperature
- Humidity
- Wind speed
- Atmospheric pressure

## Geographic

Where available:

- Elevation
- Distance to river
- Land use
- Watershed characteristics
- Drainage characteristics

## Historical

- Historical flood frequency
- Previous flood occurrence
- Historical severity
- Seasonal patterns

Feature availability must be verified before implementation.

Do not fabricate datasets.

---

# Model Evaluation

Minimum metrics:

- Precision
- Recall
- F1-score
- ROC-AUC
- Confusion matrix

For early warning, prioritize recall for actual flood events because false negatives can be particularly dangerous.

However, avoid optimizing recall blindly.

Excessive false positives can cause:

- Alert fatigue
- Loss of user trust
- Unnecessary evacuations
- Reduced credibility

The final model should balance recall and precision according to the actual deployment context.

---

# Explainability

Every prediction should provide understandable contributing factors.

Example:

```text
Why is the risk HIGH?

1. Heavy rainfall expected in the next 6 hours.
2. Significant rainfall accumulated during the last 24 hours.
3. The selected area has frequent historical flood events.
```

Do not expose raw model probabilities as if they were certainty.

Use language such as:

> "The model estimates an 82% flood risk."

Never:

> "There is an 82% certainty that a flood will happen."

---

# Safety Requirements

Because this application concerns disaster preparedness, the UI must clearly distinguish between:

### Prediction

Generated by the AI model.

### Official Warning

Issued by authorized disaster-management authorities.

The system must never imply that its prediction overrides official instructions.

Use messaging such as:

> "This prediction is generated by an AI model. Follow official instructions from local disaster-management authorities."

---

# PWA Requirements

The application should:

- Be mobile-first
- Work on modern mobile browsers
- Be installable as a PWA
- Cache essential static resources
- Minimize network usage
- Provide useful information under weak connectivity

Do not claim that predictions can work completely offline unless the required prediction model and data are actually available offline.

Offline mode should primarily support:

- Previously loaded risk information
- Cached map/data
- Application shell
- Last known prediction

Clearly show when displayed data is stale.

---

# UI/UX Principles

The primary user may have low technical literacy.

Prioritize:

1. Risk level
2. Location
3. What is happening
4. Why the risk changed
5. What the user should do

Avoid overwhelming users with:

- ML terminology
- Feature vectors
- Raw API data
- Model internals
- Excessive charts

Technical information may exist in an advanced/details section.

---

# Accessibility

The application should:

- Use readable typography
- Maintain sufficient contrast
- Avoid relying exclusively on color
- Use text labels alongside risk indicators
- Support keyboard navigation where applicable
- Provide clear error states
- Work on smaller mobile screens

Do not communicate:

```text
RED = danger
```

without also displaying:

```text
CRITICAL RISK
```

---

# API Design

Example prediction endpoint:

```http
POST /api/predict
```

Request:

```json
{
    "latitude": -6.2,
    "longitude": 106.8,
    "forecast_hours": 24
}
```

Response:

```json
{
    "location": {
        "latitude": -6.2,
        "longitude": 106.8
    },
    "prediction": {
        "probability": 0.78,
        "risk_score": 78,
        "risk_level": "high",
        "severity": "moderate"
    },
    "factors": [
        "Heavy rainfall forecast",
        "High 24-hour rainfall accumulation",
        "Historical flood frequency"
    ],
    "generated_at": "2026-08-19T09:00:00Z"
}
```

Use consistent API response schemas.

Do not expose internal ML implementation details unnecessarily to the frontend.

---

# Database Principles

Supabase/PostgreSQL should store structured information such as:

- Locations
- Historical flood events
- Weather observations
- Predictions
- Risk levels
- Model versions
- Alert events

Predictions should include a model/version identifier.

Example:

```text
prediction
├── id
├── latitude
├── longitude
├── probability
├── risk_score
├── risk_level
├── severity
├── model_version
├── generated_at
└── expires_at
```

This enables later analysis of model performance.

---

# Alerts

Alerts should only be generated when predefined conditions are met.

Potential trigger:

```text
risk_score >= configured_threshold
```

Additional logic may include:

- Risk increase
- Persistent high risk
- Critical risk
- Prediction freshness

Avoid repeatedly notifying users for the same unchanged condition.

Implement alert deduplication.

---

# Error Handling

Every external data dependency must have failure handling.

## Weather API unavailable

Display:

> Weather data is temporarily unavailable.

Do not display a fabricated prediction.

## Prediction service unavailable

Display:

> Flood risk prediction is temporarily unavailable.

## Location unavailable

Allow manual location selection.

## Stale prediction

Clearly display:

> Last updated 45 minutes ago.

Never silently present stale data as current.

---

# Security

Never commit:

- API keys
- Supabase service-role keys
- Private credentials
- Production secrets

Use:

```text
.env
```

and provide:

```text
.env.example
```

Only expose browser-safe public variables to the frontend.

---

# Code Quality

## JavaScript / JSX

Prefer explicit types via JSDoc or PropTypes for complex objects.

Avoid:

```javascript
const data = ...
```

unless absolutely necessary.

Prefer:

```javascript
/** @type {{ probability: number, riskScore: number, riskLevel: string, severity: string }} */
const data = ...
```

## Python

Use:

- Type hints
- Small functions
- Reproducible preprocessing
- Explicit configuration
- Unit tests for transformations

Avoid putting the entire ML pipeline inside a notebook.

Notebooks are for experimentation.

Production logic belongs in `ml/src`.

---

# Testing

Minimum test coverage should include:

## Frontend

- Risk classification
- API response handling
- Location handling
- Error states
- Loading states

## Backend

- Prediction endpoint
- Validation
- Error handling
- Threshold logic

## ML

- Data preprocessing
- Feature engineering
- Model inference
- Prediction schema

---

# Development Workflow

Before implementing a feature:

1. Understand the existing architecture.
2. Check whether similar functionality already exists.
3. Identify the data contract.
4. Implement the smallest viable change.
5. Add tests.
6. Run lint/type checks.
7. Run relevant tests.
8. Review for data leakage and safety issues.

Do not rewrite large parts of the project unless necessary.

---

# Git Guidelines

Use clear commit messages.

Preferred:

```text
feat: add flood risk dashboard
feat: integrate Open-Meteo weather data
feat: add XGBoost prediction service
fix: handle stale prediction data
fix: prevent duplicate flood alerts
refactor: extract risk classification logic
test: add prediction endpoint tests
```

Avoid vague commits:

```text
update
fix
changes
final
```

---

# Product Constraints

The project should remain:

- Low-cost
- Lightweight
- Mobile-first
- Accessible
- Explainable
- Data-efficient

Do not introduce expensive infrastructure without a clear requirement.

Do not add physical sensors to the MVP unless explicitly requested.

Do not introduce blockchain, cryptocurrency, or unrelated technologies.

---

# MVP Priority

When deciding between features, use this priority:

```text
1. Prediction reliability
2. Early warning
3. Location relevance
4. User comprehension
5. Performance
6. Accessibility
7. Advanced features
```

A smaller system with reliable predictions is preferable to a large system with unreliable predictions.

---

# Definition of Done

A feature is considered complete when:

- [ ] The feature satisfies its product requirement.
- [ ] Type checking passes.
- [ ] Relevant tests pass.
- [ ] Error states are handled.
- [ ] Loading states are handled.
- [ ] Mobile UI has been considered.
- [ ] No secrets are committed.
- [ ] No data leakage is introduced.
- [ ] Prediction-related claims are appropriately qualified.
- [ ] Documentation is updated where necessary.

---

# Agent Behavior

When working on this repository:

1. Do not fabricate data.
2. Do not fabricate model accuracy.
3. Do not claim the system predicts floods with certainty.
4. Do not introduce unnecessary dependencies.
5. Do not expose secrets.
6. Do not ignore temporal data leakage.
7. Do not replace official disaster warnings with AI predictions.
8. Prefer simple, maintainable implementations.
9. Keep the MVP focused on early flood-risk prediction and warning.
10. Validate assumptions against available data before implementing them.

The goal is not merely to build a visually impressive flood dashboard.

The goal is to build a **credible early-warning product whose predictions, limitations, and recommended actions can be understood and trusted by ordinary users.**

```

```
