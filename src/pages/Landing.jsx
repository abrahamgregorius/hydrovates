import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Helpers ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

// ─── Rainfall Canvas ────────────────────────────────────────────────────────
function RainfallCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const drops = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: Math.random() * 60 + 30,
      speed: Math.random() * 3 + 2,
      opacity: Math.random() * 0.4 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drops.forEach(d => {
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - 6, d.y + d.len)
        const grad = ctx.createLinearGradient(d.x, d.y, d.x - 6, d.y + d.len)
        grad.addColorStop(0, `rgba(0, 212, 255, ${d.opacity})`)
        grad.addColorStop(1, 'rgba(0, 212, 255, 0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.stroke()
        d.y += d.speed
        if (d.y > canvas.height) {
          d.y = -d.len
          d.x = Math.random() * canvas.width
        }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}

// ─── Animated Section Wrapper ───────────────────────────────────────────────
function Reveal({ children, className = '', once = true }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(2, 8, 23, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 text-white no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Early Risk</span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {['How It Works', 'Technology', 'Risk Map', 'About'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[14px] text-white/60 hover:text-white no-underline transition-colors duration-150"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="#check-risk"
            className="text-[14px] text-white/70 hover:text-white no-underline transition-colors duration-150 hidden sm:block"
          >
            Sign In
          </a>
          <a
            href="#check-risk"
            className="text-[14px] font-semibold text-[#020817] no-underline px-4 py-2 rounded-lg transition-all duration-150 hover:opacity-90"
            style={{ background: '#00d4ff' }}
          >
            Check Flood Risk
          </a>
        </div>
      </div>
    </header>
  )
}

// ─── Risk Dashboard Visualization ───────────────────────────────────────────
function RiskDashboardViz() {
  return (
    <div
      className="relative w-full max-w-[420px] rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 100%)',
        border: '1px solid rgba(0,212,255,0.2)',
        boxShadow: '0 0 60px rgba(0,212,255,0.12), 0 25px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* Animated radar sweep */}
      <div className="absolute top-0 right-0 w-40 h-40 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,212,255,0.3) 30deg, transparent 60deg)',
            animation: 'radar-sweep 4s linear infinite',
            transformOrigin: 'top right',
          }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <span className="text-[10px] text-white/40 font-mono">Jakarta · LIVE</span>
      </div>

      {/* Map area */}
      <div className="relative h-44 overflow-hidden">
        {/* Topographic lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="mapGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#0369a1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={`h${i}`} x1="0" y1={i * 36} x2="400" y2={i * 36} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <line key={`v${i}`} x1={i * 57} y1="0" x2={i * 57} y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          {/* Risk zones */}
          <ellipse cx="200" cy="90" rx="130" ry="70" fill="url(#mapGrad)" />
          <ellipse cx="200" cy="90" rx="80" ry="45" fill="rgba(239,68,68,0.12)" />
          <ellipse cx="200" cy="90" rx="40" ry="25" fill="rgba(239,68,68,0.2)" />
          {/* Location marker */}
          <circle cx="200" cy="90" r="6" fill="#00d4ff" style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }} />
          <circle cx="200" cy="90" r="6" fill="none" stroke="#00d4ff" strokeWidth="1.5" style={{ animation: 'pulse-ring 2s ease-out infinite', transformOrigin: 'center' }} />
          {/* Radar rings */}
          <circle cx="200" cy="90" r="20" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
          <circle cx="200" cy="90" r="35" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
        </svg>

        {/* Risk badge overlay */}
        <div className="absolute top-3 left-3 bg-[rgba(239,68,68,0.9)] rounded-lg px-2.5 py-1 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white tracking-wide">HIGH RISK</span>
        </div>
      </div>

      {/* Data panel */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-[22px] font-bold text-white leading-none mb-1">82<span className="text-[12px] text-white/50 ml-0.5">%</span></div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Probability</div>
        </div>
        <div className="text-center" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[22px] font-bold text-[#00d4ff] leading-none mb-1">74<span className="text-[12px] text-white/50 ml-0.5">mm</span></div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Rainfall</div>
        </div>
        <div className="text-center">
          <div className="text-[22px] font-bold text-white leading-none mb-1">6<span className="text-[12px] text-white/50 ml-0.5">h</span></div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Window</div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
        <span className="text-[10px] text-white/40">Heavy rainfall expected in next 6h</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          <span className="text-[10px] text-white/50">AI Confidence: 94%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Trust Strip ─────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  'AI Prediction', 'Weather Intelligence', 'Historical Flood Data', 'Low-Bandwidth', 'Community Ready',
]

function TrustStrip() {
  return (
    <section className="relative" style={{ background: 'rgba(0,212,255,0.04)', borderTop: '1px solid rgba(0,212,255,0.1)', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <p className="text-[13px] text-white/50 tracking-wide whitespace-nowrap m-0">
          Built to make early warning accessible.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          {TRUST_ITEMS.map(item => (
            <div key={item} className="flex items-center gap-1.5 text-[12px] text-white/70">
              <svg className="w-3 h-3 text-[#00d4ff] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Problem Section ─────────────────────────────────────────────────────────
function ProblemSection() {
  const steps = [
    { label: 'Raw Data', color: '#64748b' },
    { label: 'Weather Data', color: '#0ea5e9' },
    { label: 'AI Risk Prediction', color: '#00d4ff' },
    { label: 'Simple Warning', color: '#f59e0b' },
    { label: 'Human Action', color: '#22c55e' },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: '#020817' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-4">The Problem</p>
          <h2 className="text-[clamp(28px,5vw,48px)] font-semibold text-white leading-[1.1] tracking-tight mb-6">
            Floods don't wait for<br />perfect information.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] text-white/50 leading-relaxed max-w-xl mb-12">
            Communities often receive fragmented weather information, generic warnings, 
            or alerts that are difficult for ordinary people to interpret — when it's already too late.
          </p>
        </Reveal>

        {/* Flow visualization */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 sm:gap-0 sm:grid sm:grid-cols-5 sm:gap-2">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 sm:flex-col sm:gap-2">
                <div
                  className="flex-1 sm:flex-none w-full sm:w-auto rounded-xl px-4 py-3 text-center text-[13px] font-medium"
                  style={{ background: `${step.color}18`, border: `1px solid ${step.color}40`, color: step.color }}
                >
                  {step.label}
                </div>
                {i < steps.length - 1 && (
                  <svg className="w-4 h-4 text-white/20 shrink-0 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Product Experience ──────────────────────────────────────────────────────
function ProductSection() {
  return (
    <section id="technology" className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #020817 0%, #0a1628 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <Reveal>
            <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-4">The Product</p>
            <h2 className="text-[clamp(28px,5vw,48px)] font-semibold text-white leading-[1.1] tracking-tight mb-6">
              One glance.<br />One decision.
            </h2>
            <p className="text-[16px] text-white/50 leading-relaxed mb-8">
              Instantly understand your flood risk. No technical jargon, no complicated dashboards — 
              just clear, actionable information when you need it most.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Risk Level', value: 'HIGH', valueColor: '#ef4444' },
                { label: 'Probability', value: '82%', valueColor: '#00d4ff' },
                { label: 'Rainfall', value: '74 mm', valueColor: '#0ea5e9' },
                { label: 'Time Window', value: '6 hours', valueColor: '#f59e0b' },
              ].map(({ label, value, valueColor }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-[20px] font-bold" style={{ color: valueColor }}>{value}</div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[14px] text-white/40 italic">
              Recommended action: Prepare for possible flooding.
            </p>
          </Reveal>

          {/* Right — product mockup */}
          <Reveal>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#0a1628', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 80px rgba(0,212,255,0.08)' }}
            >
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                  <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                ))}
                <div className="flex-1 mx-3 h-5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Map */}
              <div className="relative h-48 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <defs>
                    <radialGradient id="prodMap" cx="55%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="500" height="200" fill="#061020"/>
                  {[...Array(6)].map((_, i) => (
                    <line key={`ph${i}`} x1="0" y1={i * 33} x2="500" y2={i * 33} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <line key={`pv${i}`} x1={i * 71} y1="0" x2={i * 71} y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                  ))}
                  <ellipse cx="270" cy="100" rx="150" ry="80" fill="url(#prodMap)"/>
                  <ellipse cx="270" cy="100" rx="90" ry="50" fill="rgba(239,68,68,0.1)"/>
                  <ellipse cx="270" cy="100" rx="45" ry="28" fill="rgba(239,68,68,0.2)"/>
                  <circle cx="270" cy="100" r="5" fill="#00d4ff" style={{filter:'drop-shadow(0 0 6px #00d4ff)'}}/>
                  <circle cx="270" cy="100" r="5" fill="none" stroke="#00d4ff" strokeWidth="1.5" style={{animation:'pulse-ring 2.5s ease-out infinite', transformOrigin:'270px 100px'}}/>
                </svg>
                <div className="absolute top-3 left-3 bg-[rgba(239,68,68,0.9)] rounded-lg px-2 py-1 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                  <span className="text-[10px] font-bold text-white">HIGH RISK</span>
                </div>
              </div>

              {/* Data */}
              <div className="px-4 py-3 grid grid-cols-3 gap-3" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                {[
                  { v: '82%', l: 'Probability', c: '#00d4ff' },
                  { v: '74mm', l: 'Rainfall', c: '#0ea5e9' },
                  { v: '6h', l: 'Forecast', c: '#f59e0b' },
                ].map(({ v, l, c }) => (
                  <div key={l} className="text-center">
                    <div className="text-[18px] font-bold" style={{color:c}}>{v}</div>
                    <div className="text-[10px] text-white/40">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ─── AI Pipeline ──────────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { label: 'Weather\nForecast', icon: 'M3 15a4 4 0 0 0 4 4h9a5 5 0 1 0-.2-9.6 4.9 4.9 0 0 0-2.3-4A5 5 0 0 0 2 9a5 5 0 0 0 5 5h5a4 4 0 0 0 4-4' },
  { label: 'Historical\nFlood Data', icon: 'M3 3v18h18M7 16l4-8 4 5 5-9' },
  { label: 'Geographic\nContext', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' },
  { label: 'Machine\nLearning', icon: 'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13' },
  { label: 'Flood Risk\nScore', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { label: 'Actionable\nWarning', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
]

function AIPipeline() {
  return (
    <section className="py-24 px-6" style={{ background: '#0a1628', borderTop: '1px solid rgba(0,212,255,0.07)', borderBottom: '1px solid rgba(0,212,255,0.07)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-4 text-center">The Technology</p>
          <h2 className="text-[clamp(28px,5vw,48px)] font-semibold text-white leading-[1.1] tracking-tight mb-4 text-center">
            From weather signals<br />to early action.
          </h2>
          <p className="text-[16px] text-white/50 leading-relaxed text-center max-w-xl mx-auto mb-16">
            Our ensemble of Random Forest and XGBoost models processes real-time weather 
            and historical data to generate precise flood risk predictions.
          </p>
        </Reveal>

        <Reveal>
          <div className="flex overflow-x-auto gap-3 pb-4 -mx-6 px-6 snap-x snap-mandatory lg:overflow-hidden lg:justify-center">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 snap-center lg:snap-none">
                <div
                  className="flex-shrink-0 w-28 sm:w-32 rounded-xl p-4 text-center"
                  style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
                >
                  <div className="w-9 h-9 rounded-lg mx-auto mb-2.5 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.12)' }}>
                    <svg className="w-4 h-4 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={step.icon}/>
                    </svg>
                  </div>
                  <div className="text-[11px] text-white/70 leading-tight whitespace-pre-line">{step.label}</div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <svg className="w-4 h-4 text-[#00d4ff]/30 shrink-0 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Why It Matters ──────────────────────────────────────────────────────────
function WhyItMatters() {
  return (
    <section className="py-24 px-6" style={{ background: '#020817' }}>
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <div className="inline-block mb-8">
            <div
              className="text-[clamp(64px,12vw,120px)] font-bold text-transparent leading-none tracking-tighter"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 50%, #0369a1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              6 HOURS
            </div>
          </div>
          <h2 className="text-[clamp(22px,4vw,36px)] font-semibold text-white leading-snug tracking-tight mb-6">
            can change the outcome of a flood event.
          </h2>
          <p className="text-[16px] text-white/50 leading-relaxed max-w-lg mx-auto mb-14">
            Earlier awareness means better preparation, faster evacuation, and fewer disruptions 
            — when every hour matters.
          </p>
        </Reveal>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {[
            { label: 'Earlier awareness', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
            { label: 'Better preparation', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
            { label: 'Faster evacuation', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
            { label: 'Reduced disruption', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
          ].map(({ label, icon }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="rounded-xl p-5 text-center"
              style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}
            >
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <svg className="w-5 h-5 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={icon}/>
                </svg>
              </div>
              <div className="text-[13px] text-white/70 font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Accessibility / Low-Bandwidth ───────────────────────────────────────────
function AccessibilitySection() {
  return (
    <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #020817 0%, #071225 100%)', borderTop: '1px solid rgba(0,212,255,0.06)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-4">Differentiator</p>
            <h2 className="text-[clamp(26px,4vw,42px)] font-semibold text-white leading-[1.15] tracking-tight mb-6">
              Early warning should not require expensive infrastructure.
            </h2>
            <p className="text-[16px] text-white/50 leading-relaxed mb-8">
              Built to work on low-end smartphones, weak internet connections, and tight budgets. 
              No physical sensors required everywhere — just open data and intelligent processing.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Low-cost', 'Low-bandwidth', 'Lightweight', 'Mobile-first', 'Open Data'].map(tag => (
                <span key={tag} className="text-[12px] text-[#00d4ff] px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal>
            {/* Device + network visualization */}
            <div className="relative flex items-center justify-center">
              {/* Central phone */}
              <div
                className="relative z-10 w-36 h-72 rounded-[24px] overflow-hidden"
                style={{ background: '#0a1628', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 40px rgba(0,212,255,0.15)' }}
              >
                <div className="h-6 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="w-10 h-1.5 rounded-full bg-white/10"/>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <div className="text-[8px] text-[#00d4ff] font-semibold tracking-wider uppercase">Flood Risk</div>
                  <div className="text-[22px] font-bold text-white">HIGH</div>
                  <div className="text-[8px] text-white/50">Jakarta Selatan</div>
                  <div className="mt-2 rounded-lg p-2" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div className="text-[8px] text-[#ef4444] mb-0.5">Probability</div>
                    <div className="text-[14px] font-bold text-white">82%</div>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                    <div className="text-[8px] text-[#0ea5e9] mb-0.5">Rainfall</div>
                    <div className="text-[14px] font-bold text-white">74 mm</div>
                  </div>
                </div>
              </div>

              {/* Signal nodes */}
              {[
                { x: -60, y: -40, label: 'Weather API' },
                { x: 60, y: -30, label: 'Historical Data' },
                { x: -50, y: 50, label: 'Prediction Model' },
                { x: 55, y: 45, label: 'Alert System' },
              ].map(({ x, y, label }) => (
                <div
                  key={label}
                  className="absolute z-0 flex flex-col items-center gap-1"
                  style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: '#00d4ff', opacity: 0.7, animation: 'float 3s ease-in-out infinite' }}/>
                  </div>
                  <span className="text-[9px] text-white/40 whitespace-nowrap">{label}</span>
                </div>
              ))}

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                {[1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="150" y1="150"
                    x2={[90, 210, 100, 200][i-1]}
                    y2={[110, 120, 200, 195][i-1]}
                    stroke="rgba(0,212,255,0.15)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ─── Community Section ───────────────────────────────────────────────────────
function CommunitySection() {
  const personas = [
    {
      title: 'Households',
      subtitle: '"Know when to prepare."',
      desc: 'Get clear, actionable alerts before flooding reaches your home. No technical knowledge required.',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      accent: '#00d4ff',
    },
    {
      title: 'Communities',
      subtitle: '"Coordinate before conditions worsen."',
      desc: 'Share early warnings across neighborhoods. Help vulnerable neighbors prepare in time.',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      accent: '#0ea5e9',
    },
    {
      title: 'Local Authorities',
      subtitle: '"See emerging risk and prioritize response."',
      desc: 'Monitor flood risk across your jurisdiction. Make data-driven decisions on resource allocation.',
      icon: 'M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      accent: '#0369a1',
    },
  ]

  return (
    <section className="py-24 px-6" style={{ background: '#071225', borderTop: '1px solid rgba(0,212,255,0.06)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-4 text-center">For Everyone</p>
          <h2 className="text-[clamp(26px,4vw,42px)] font-semibold text-white leading-[1.15] tracking-tight mb-4 text-center">
            Built for the whole community.
          </h2>
          <p className="text-[16px] text-white/50 leading-relaxed text-center max-w-xl mx-auto mb-14">
            Whether you're an individual, a neighborhood group, or a government agency — 
            Early Risk gives you the information you need to act early.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {personas.map((p, i) => (
            <Reveal key={p.title}>
              <div
                className="rounded-2xl p-6 h-full"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}30` }}>
                  <svg className="w-6 h-6" style={{ color: p.accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={p.icon}/>
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold text-white mb-0.5">{p.title}</h3>
                <p className="text-[13px] mb-4" style={{ color: p.accent }}>{p.subtitle}</p>
                <p className="text-[14px] text-white/50 leading-relaxed m-0">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Live Risk Map Teaser ────────────────────────────────────────────────────
function LiveMapTeaser() {
  return (
    <section id="risk-map" className="py-24 px-6" style={{ background: '#020817' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-4 text-center">Risk Map</p>
          <h2 className="text-[clamp(26px,4vw,42px)] font-semibold text-white leading-[1.15] tracking-tight mb-4 text-center">
            See risk before it reaches<br />your doorstep.
          </h2>
          <p className="text-[16px] text-white/50 text-center max-w-xl mx-auto mb-12">
            An interactive map showing flood-risk zones, rainfall cells, and live risk levels 
            across your region — updated continuously.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: '#061020', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 60px rgba(0,212,255,0.08)' }}
          >
            {/* Map SVG */}
            <div className="relative h-72 sm:h-96 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 800 350" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                  <radialGradient id="mapGrad2" cx="45%" cy="50%" r="45%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="riskGrad1" cx="30%" cy="40%" r="35%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="riskGrad2" cx="65%" cy="55%" r="30%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                {/* Base */}
                <rect width="800" height="350" fill="#061020"/>
                {/* Grid */}
                {[...Array(8)].map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i*44} x2="800" y2={i*44} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                ))}
                {[...Array(10)].map((_, i) => (
                  <line key={`v${i}`} x1={i*80} y1="0" x2={i*80} y2="350" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                ))}
                {/* Risk zones */}
                <ellipse cx="240" cy="160" rx="180" ry="120" fill="url(#riskGrad1)"/>
                <ellipse cx="520" cy="200" rx="140" ry="90" fill="url(#riskGrad2)"/>
                <ellipse cx="400" cy="175" rx="250" ry="150" fill="url(#mapGrad2)"/>
                {/* Location markers */}
                {[
                  { cx: 240, cy: 160, r: 7, label: 'Jakarta Selatan', risk: 'HIGH' },
                  { cx: 520, cy: 200, r: 7, label: 'Surabaya Utara', risk: 'MODERATE' },
                  { cx: 380, cy: 120, r: 5, label: 'Bandung', risk: 'LOW' },
                  { cx: 600, cy: 140, r: 5, label: 'Semarang', risk: 'LOW' },
                ].map(({ cx, cy, r, label, risk }) => (
                  <g key={label}>
                    <circle cx={cx} cy={cy} r={r} fill={risk === 'HIGH' ? '#ef4444' : risk === 'MODERATE' ? '#f59e0b' : '#22c55e'} style={{filter:'drop-shadow(0 0 4px currentColor)'}}/>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                    <text x={cx + r + 4} y={cy + 4} fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Poppins, sans-serif">{label}</text>
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-white/60">
                {[['#ef4444', 'HIGH'], ['#f59e0b', 'MODERATE'], ['#22c55e', 'LOW']].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: c }}/>
                    {l}
                  </div>
                ))}
              </div>

              {/* Time control */}
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
                <svg className="w-3.5 h-3.5 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="text-[12px] text-white font-medium">Next 6 hours</span>
                <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Final CTA ───────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      id="check-risk"
      className="relative py-28 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020817 0%, #0a1628 50%, #020817 100%)' }}
    >
      {/* Rainfall bg */}
      <RainfallCanvas />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.12) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <Reveal>
          <h2 className="text-[clamp(28px,5vw,52px)] font-semibold text-white leading-[1.1] tracking-tight mb-6">
            Prepare before the warning<br />becomes an emergency.
          </h2>
          <p className="text-[16px] text-white/50 leading-relaxed mb-10">
            Turn complex environmental data into decisions people can understand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="flex items-center gap-2 text-[15px] font-semibold text-[#020817] no-underline px-8 py-4 rounded-xl transition-all duration-150 hover:opacity-90 hover:scale-[1.02]"
              style={{ background: '#00d4ff', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}
            >
              Check Your Flood Risk
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-[15px] font-medium text-white/70 no-underline px-8 py-4 rounded-xl transition-all duration-150 hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Explore the Technology
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-16 px-6" style={{ background: '#01050f', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-[15px]">Early Risk</span>
            </div>
            <p className="text-[13px] text-white/40 leading-relaxed m-0">
              AI-powered flood intelligence<br />for safer, more prepared communities.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: 'Product',
              links: ['How It Works', 'Technology', 'Risk Map', 'About'],
            },
            {
              title: 'Resources',
              links: ['Documentation', 'Research', 'API', 'GitHub'],
            },
            {
              title: 'Project',
              links: ['About', 'Blog', 'Contact', 'Privacy'],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/30 mb-4">{title}</h4>
              <ul className="space-y-2.5 list-none m-0 p-0">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-white/50 no-underline hover:text-white transition-colors duration-150">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[12px] text-white/30 m-0">
            © 2026 Early Risk — ISIF Competition Project
          </p>
          <p className="text-[12px] text-white/30 m-0 italic">
            Built for safer, more prepared communities.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div style={{ background: '#020817', minHeight: '100vh' }}>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #020817 0%, #030d2e 50%, #020817 100%)' }}
        >
          <RainfallCanvas />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
            aria-hidden="true"
          />

          {/* Glow orb */}
          <div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span
                  className="inline-block text-[11px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-6 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}
                >
                  AI-Powered Flood Early Warning
                </span>
              </motion.div>

              <motion.h1
                className="text-[clamp(40px,7vw,80px)] font-semibold text-white leading-[1.05] tracking-[-2px] mb-6"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Know the Risk.<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #00d4ff, #0ea5e9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Before the Water Rises.
                </span>
              </motion.h1>

              <motion.p
                className="text-[clamp(15px,2vw,18px)] text-white/50 leading-relaxed mb-10 max-w-lg"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                AI-powered flood risk prediction that turns weather and environmental data 
                into clear, actionable early warnings for everyone.
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <a
                  href="#check-risk"
                  className="flex items-center gap-2 text-[15px] font-semibold text-[#020817] no-underline px-7 py-3.5 rounded-xl transition-all duration-150 hover:opacity-90"
                  style={{ background: '#00d4ff', boxShadow: '0 0 40px rgba(0,212,255,0.35)' }}
                >
                  Check Flood Risk
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 text-[15px] font-medium text-white/70 no-underline px-7 py-3.5 rounded-xl transition-all duration-150 hover:text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  See How It Works
                </a>
              </motion.div>
            </div>

            {/* Right: Risk Dashboard */}
            <motion.div
              className="flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <RiskDashboardViz />
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <span className="text-[10px] text-white/30 uppercase tracking-widest">Scroll</span>
            <motion.div
              className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-1 h-2 rounded-full bg-white/40" />
            </motion.div>
          </motion.div>
        </section>

        <TrustStrip />
        <ProblemSection />
        <ProductSection />
        <AIPipeline />
        <WhyItMatters />
        <AccessibilitySection />
        <CommunitySection />
        <LiveMapTeaser />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
