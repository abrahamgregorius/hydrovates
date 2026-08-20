# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Early Risk Predictive AI Assistant for Flood Mitigation

**Product Type:** AI-powered Flood Early Warning Progressive Web Application (PWA)

**Target Users:**

* Masyarakat di wilayah rawan banjir
* Pemerintah daerah / BPBD
* Relawan kebencanaan
* Komunitas lokal

### Product Vision

Membangun sistem peringatan dini banjir yang **murah, ringan, mudah diakses, dan mudah dipahami**, dengan memanfaatkan data terbuka dan machine learning tanpa ketergantungan pada jaringan sensor fisik yang mahal.

---

# 2. Problem Statement

Masyarakat di wilayah rawan banjir sering kali menerima informasi ketika kondisi sudah memburuk. Sistem monitoring konvensional juga dapat membutuhkan sensor fisik, infrastruktur komunikasi, dan biaya pemeliharaan yang tinggi.

Masalah utama yang ingin diselesaikan:

* Tidak semua wilayah memiliki sistem peringatan dini banjir.
* Informasi banjir sering bersifat reaktif.
* Data cuaca dan historis banjir belum selalu diterjemahkan menjadi informasi risiko yang mudah dipahami masyarakat.
* Infrastruktur sensor fisik sulit diterapkan secara luas karena biaya dan pemeliharaan.
* Masyarakat membutuhkan informasi yang sederhana: **"Apakah daerah saya berisiko banjir, seberapa besar risikonya, dan apa yang harus saya lakukan?"**

---

# 3. Product Goals

### Primary Goals

1. Memprediksi risiko banjir sebelum kejadian berdasarkan data yang tersedia.
2. Memberikan **risk score** dan **severity level** yang mudah dipahami.
3. Memberikan peringatan dini kepada pengguna.
4. Menyediakan informasi berbasis lokasi.
5. Mengurangi ketergantungan terhadap sensor fisik.
6. Menyediakan sistem yang dapat diakses melalui browser tanpa instalasi aplikasi.

### Success Metrics

| Metric                            |                    Target |
| --------------------------------- | ------------------------: |
| Prediction accuracy               |                    ≥ 80%* |
| Recall untuk kejadian banjir      |                    ≥ 80%* |
| PWA load time                     |                 < 3 detik |
| Prediction generation             |                < 10 detik |
| Mobile accessibility              |                      90%+ |
| User dapat memahami status risiko | ≥ 90% pada usability test |

*Target akhir harus disesuaikan setelah eksperimen model dan karakteristik dataset.

---

# 4. Target User

## Persona 1 — Resident

Masyarakat yang tinggal di daerah rawan banjir.

**Needs:**

* Mengetahui apakah wilayahnya berisiko.
* Mendapat peringatan lebih awal.
* Mengetahui tindakan yang harus dilakukan.

**Technical skill:** Rendah.

---

## Persona 2 — Local Disaster Officer

Petugas BPBD atau pemerintah daerah.

**Needs:**

* Melihat wilayah dengan risiko tinggi.
* Memantau perubahan risiko.
* Mendapatkan data pendukung untuk pengambilan keputusan.

**Technical skill:** Menengah.

---

## Persona 3 — Community / Volunteer

Relawan atau komunitas kebencanaan.

**Needs:**

* Memantau wilayah tertentu.
* Membagikan peringatan kepada masyarakat.
* Melihat histori kejadian.

---

# 5. Core Product Flow

```text
Open Data
   ↓
Data Collection
   ↓
Data Cleaning & Preprocessing
   ↓
Feature Engineering
   ↓
Random Forest + XGBoost
   ↓
Flood Risk Prediction
   ↓
Risk Score + Severity
   ↓
PWA
   ↓
User Alert
   ↓
Recommended Action
```

---

# 6. Data Sources

Sistem menggunakan data terbuka sebanyak mungkin untuk menjaga biaya operasional tetap rendah.

### 6.1 Weather Data

Source:

**Open-Meteo API**

Potential variables:

* Rainfall / precipitation
* Temperature
* Humidity
* Wind speed
* Atmospheric pressure
* Weather condition
* Forecast precipitation

---

### 6.2 Historical Flood Data

Data kejadian banjir dari sumber pemerintah atau open data.

Potential variables:

* Location
* Date
* Flood occurrence
* Flood severity
* Flood depth
* Duration
* Affected area

---

### 6.3 Geographic Data

Untuk meningkatkan kualitas prediksi:

* Elevation
* River proximity
* Land use
* Drainage characteristics
* Watershed information

Data geografis bersifat **optional untuk MVP**, tetapi direkomendasikan untuk model production.

---

# 7. AI / Machine Learning System

## 7.1 Prediction Objective

Model menghasilkan:

```text
Flood Probability
+
Flood Severity
+
Risk Level
```

Contoh:

```text
Flood Probability: 82%

Risk Level: HIGH

Expected Severity: Moderate–Severe
```

---

## 7.2 Machine Learning Models

### Random Forest

Digunakan sebagai salah satu model ensemble karena:

* Robust terhadap noise.
* Dapat menangani nonlinear relationships.
* Relatif mudah diinterpretasikan.
* Tidak membutuhkan preprocessing yang terlalu kompleks.

### XGBoost

Digunakan untuk:

* Menangkap hubungan kompleks antarvariabel.
* Meningkatkan predictive performance.
* Menangani feature importance secara efektif.

### Ensemble

Output kedua model digabungkan untuk menghasilkan prediksi akhir.

Contoh:

```text
Random Forest      → 78%
XGBoost            → 86%

Ensemble Score     → 82%
```

---

# 8. Risk Classification

Risk score dikonversikan menjadi kategori sederhana.

|  Score | Risk     | Meaning              |
| -----: | -------- | -------------------- |
|   0–20 | Very Low | Kondisi relatif aman |
|  21–40 | Low      | Risiko rendah        |
|  41–60 | Moderate | Perlu waspada        |
|  61–80 | High     | Risiko tinggi        |
| 81–100 | Critical | Risiko sangat tinggi |

Threshold dapat dikalibrasi berdasarkan hasil validasi model.

---

# 9. Core Features

## F1 — Location Detection

User dapat:

* Menggunakan GPS.
* Memilih lokasi secara manual.
* Mencari lokasi berdasarkan nama.

Output:

```text
Your Location

Jakarta Selatan

Current Risk:
HIGH
```

---

## F2 — Flood Risk Dashboard

Dashboard utama menampilkan:

* Current risk level
* Risk score
* Probability
* Forecast
* Last updated
* Location
* Recommended action

Contoh:

```text
┌──────────────────────────────┐
│ FLOOD RISK                   │
│                              │
│ HIGH                         │
│ 78% probability              │
│                              │
│ Rainfall increasing          │
│                              │
│ Updated 10 minutes ago       │
└──────────────────────────────┘
```

---

## F3 — Early Warning

Sistem memberikan peringatan ketika risiko melewati threshold.

Contoh:

**HIGH RISK**

> Risiko banjir meningkat dalam beberapa jam ke depan berdasarkan pola curah hujan dan kondisi historis wilayah.

---

## F4 — Risk Forecast

Menampilkan perubahan risiko berdasarkan waktu.

Contoh:

```text
NOW       → MODERATE
+3 HOURS  → HIGH
+6 HOURS  → HIGH
+12 HOURS → CRITICAL
```

---

## F5 — Recommended Action

Sistem menerjemahkan prediction menjadi tindakan.

### Low

> Tetap pantau kondisi cuaca.

### Moderate

> Simpan barang penting di tempat yang lebih tinggi.

### High

> Bersiap untuk evakuasi dan pantau informasi resmi.

### Critical

> Segera ikuti arahan evakuasi dari otoritas setempat.

**Catatan:** Sistem tidak menggantikan instruksi resmi BPBD/pemerintah.

---

## F6 — Interactive Risk Map

Map menampilkan:

* User location
* Risk zones
* Flood-prone areas
* Rivers
* High-risk locations

Contoh:

```text
          ┌─────────────────┐
          │   HIGH RISK     │
          │       ●         │
          │                 │
          │  MODERATE       │
          │        ●        │
          │                 │
          └─────────────────┘
```

---

## F7 — Historical Flood Information

User dapat melihat:

* Historical flood events
* Frequency
* Severity
* Location
* Date

Tujuannya memberikan konteks mengapa suatu wilayah memiliki risk score tertentu.

---

# 10. PWA Requirements

## Technology Stack

### Frontend

* React
* Vite
* PWA
* Responsive design

### Backend

* Supabase
* PostgreSQL
* REST APIs

### ML Service

Prototype dapat menggunakan:

* Python
* Scikit-learn
* XGBoost
* FastAPI

Architecture:

```text
                 ┌──────────────┐
                 │  Open-Meteo  │
                 └──────┬───────┘
                        │
                        ▼
┌──────────────┐   ┌──────────────┐
│ Flood Data   │──▶│ Data Pipeline│
└──────────────┘   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ ML Prediction│
                   │ RF + XGBoost │
                   └──────┬───────┘
                          │
                          ▼
                    ┌───────────┐
                    │ Supabase  │
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │ React PWA │
                    └─────┬─────┘
                          │
                          ▼
                       Citizen
```

---

# 11. MVP Scope

MVP harus fokus pada kemampuan utama:

### Must Have

* [ ] Location detection
* [ ] Weather data integration
* [ ] Historical flood dataset
* [ ] ML prediction
* [ ] Risk score
* [ ] Risk classification
* [ ] Basic dashboard
* [ ] Risk forecast
* [ ] Early warning
* [ ] Recommended action
* [ ] Responsive PWA
* [ ] Basic map

### Should Have

* [ ] Historical flood visualization
* [ ] Push notification
* [ ] Offline caching
* [ ] Risk map
* [ ] Model explainability

### Could Have

* [ ] Community reports
* [ ] Government dashboard
* [ ] Evacuation route
* [ ] Multi-language support
* [ ] SMS/WhatsApp notification integration

---

# 12. Non-Functional Requirements

### Performance

* Initial page load < 3 seconds.
* Prediction response < 10 seconds.
* Mobile-first architecture.

### Availability

Target uptime:

**≥ 99%**

### Accessibility

* Simple language.
* High readability.
* Clear risk indicators.
* Usable on low-end smartphones.

### Data Efficiency

PWA harus meminimalkan penggunaan data melalui:

* API caching.
* Service worker.
* Lazy loading.
* Compressed assets.

---

# 13. Safety & Reliability

Karena sistem berhubungan dengan mitigasi bencana, prediction tidak boleh diposisikan sebagai kepastian.

UI harus menggunakan bahasa:

> "Predicted flood risk"

bukan:

> "Flood will happen."

Setiap peringatan juga harus menyatakan bahwa informasi resmi dari otoritas kebencanaan tetap menjadi sumber keputusan utama.

---

# 14. Model Evaluation

Model akan dievaluasi menggunakan:

* Accuracy
* Precision
* Recall
* F1-score
* ROC-AUC
* Confusion Matrix

Untuk konteks early warning, **Recall terhadap kejadian banjir** menjadi metrik yang sangat penting karena false negative dapat menyebabkan pengguna tidak menerima peringatan ketika risiko sebenarnya tinggi.

---

# 15. Development Phases

## Phase 1 — Data

* Collect historical flood data.
* Integrate weather API.
* Clean datasets.
* Create unified dataset.

## Phase 2 — ML

* Feature engineering.
* Train Random Forest.
* Train XGBoost.
* Compare performance.
* Build ensemble.
* Validate model.

## Phase 3 — Backend

* Supabase database.
* Prediction API.
* Risk calculation.
* Alert logic.

## Phase 4 — PWA

* Dashboard.
* Location.
* Risk visualization.
* Map.
* Forecast.
* Warning interface.

## Phase 5 — Testing

* Model validation.
* API testing.
* Mobile testing.
* Usability testing.
* Offline testing.

---

# 16. Key User Journey

```text
User opens PWA
       ↓
Location detected
       ↓
System retrieves weather + geographic data
       ↓
ML model calculates flood probability
       ↓
Risk score generated
       ↓
User sees:

"JAKARTA SELATAN
HIGH RISK
78% probability"

       ↓
System explains contributing factors
       ↓
Recommended preparation displayed
       ↓
User receives warning if risk increases
```

---

# 17. Final MVP Definition

MVP dianggap berhasil apabila seorang pengguna di wilayah rawan banjir dapat:

1. Membuka aplikasi tanpa instalasi.
2. Menentukan lokasinya.
3. Melihat tingkat risiko banjir.
4. Melihat probabilitas risiko.
5. Melihat perubahan risiko beberapa jam ke depan.
6. Memahami alasan utama meningkatnya risiko.
7. Mendapatkan rekomendasi tindakan.
8. Menerima peringatan ketika risiko melewati threshold.

**Core value proposition:**

> **"Know your flood risk before the water rises."**