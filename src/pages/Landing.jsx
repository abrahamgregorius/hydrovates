import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── Helpers ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
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

    const drops = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: Math.random() * 50 + 25,
      speed: Math.random() * 3 + 2,
      opacity: Math.random() * 0.35 + 0.08,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drops.forEach(d => {
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - 5, d.y + d.len)
        const grad = ctx.createLinearGradient(d.x, d.y, d.x - 5, d.y + d.len)
        grad.addColorStop(0, `rgba(0, 212, 255, ${d.opacity})`)
        grad.addColorStop(1, 'rgba(0, 212, 255, 0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 0.8
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
  const inView = useInView(ref, { once, margin: '-60px' })
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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled || menuOpen ? 'rgba(2, 8, 23, 0.92)' : 'transparent',
          backdropFilter: (scrolled || menuOpen) ? 'blur(24px)' : 'none',
          borderBottom: (scrolled || menuOpen) ? '1px solid rgba(255,255,255,0.07)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-white no-underline z-50 relative">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Hydrovates</span>
          </a>

          {/* Desktop nav */}
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

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleCheckRisk}
              className="text-[14px] font-semibold text-[#020817] no-underline px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-150"
              style={{ background: '#00d4ff' }}
            >
              Check Flood Risk
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-transparent border-none cursor-pointer"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className="block w-5 h-0.5 bg-white rounded-full transition-all duration-300"
              style={{
                transform: menuOpen ? 'translateY(4px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 bg-white rounded-full transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-0.5 bg-white rounded-full transition-all duration-300"
              style={{
                transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div
        className="fixed inset-0 z-40 flex flex-col pt-14 px-6 pb-8 transition-all duration-300"
        style={{
          background: 'rgba(2, 8, 23, 0.97)',
          backdropFilter: 'blur(24px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        <nav className="flex flex-col gap-1 mt-8" aria-label="Mobile navigation">
          {['How It Works', 'Technology', 'Risk Map', 'About'].map((link, i) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[20px] font-medium text-white/80 no-underline py-3 border-b border-white/5 transition-colors duration-150 hover:text-white"
              style={{ transitionDelay: `${i * 40}ms` }}
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => { setMenuOpen(false); handleCheckRisk() }}
            className="flex items-center justify-center gap-2 text-[16px] font-semibold text-[#020817] no-underline px-6 py-4 rounded-xl w-full"
            style={{ background: '#00d4ff' }}
          >
            Check Flood Risk
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Risk Dashboard Visualization ───────────────────────────────────────────
function RiskDashboardViz({ compact = false }) {
  const h = compact ? 120 : 160
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0a1628 0%, #0f2044 100%)',
        border: '1px solid rgba(0,212,255,0.18)',
        boxShadow: '0 0 50px rgba(0,212,255,0.1), 0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Radar sweep */}
      <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden" aria-hidden="true">
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,212,255,0.25) 30deg, transparent 60deg)',
            animation: 'radar-sweep 4s linear infinite',
            transformOrigin: 'top right',
          }}
        />
      </div>

      {/* Window bar */}
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-1.5">
          {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
            <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <span className="text-[9px] text-white/40 font-mono">Jakarta · LIVE</span>
      </div>

      {/* Map */}
      <div className="relative overflow-hidden" style={{ height: h }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="mapGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="400" height="120" fill="#061020"/>
          {[0,1,2,3].map(i => (
            <line key={`h${i}`} x1="0" y1={i*30} x2="400" y2={i*30} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          ))}
          {[0,1,2,3,4,5].map(i => (
            <line key={`v${i}`} x1={i*67} y1="0" x2={i*67} y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          ))}
          <ellipse cx="200" cy="60" rx="130" ry="55" fill="url(#mapGrad)"/>
          <ellipse cx="200" cy="60" rx="75" ry="38" fill="rgba(239,68,68,0.1)"/>
          <ellipse cx="200" cy="60" rx="38" ry="22" fill="rgba(239,68,68,0.2)"/>
          <circle cx="200" cy="60" r="5" fill="#00d4ff" style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }}/>
          <circle cx="200" cy="60" r="5" fill="none" stroke="#00d4ff" strokeWidth="1.5" style={{ animation: 'pulse-ring 2s ease-out infinite', transformOrigin: '200px 60px' }}/>
          <circle cx="200" cy="60" r="18" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1"/>
          <circle cx="200" cy="60" r="30" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1"/>
        </svg>

        {/* Risk badge */}
        <div className="absolute top-2 left-2 bg-[rgba(239,68,68,0.9)] rounded-lg px-2 py-1 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
          <span className="text-[9px] font-bold text-white tracking-wide">HIGH RISK</span>
        </div>
      </div>

      {/* Data panel */}
      <div className="px-3 py-2.5 grid grid-cols-3 gap-2">
        {[
          { v: '82', u: '%',  l: 'Probability', c: '#ffffff' },
          { v: '74', u: 'mm', l: 'Rainfall',    c: '#00d4ff' },
          { v: '6',  u: 'h',  l: 'Window',      c: '#f59e0b' },
        ].map(({ v, u, l, c }) => (
          <div key={l} className="text-center">
            <div className="text-[18px] font-bold leading-none mb-0.5" style={{ color: c }}>
              {v}<span className="text-[11px] text-white/40 ml-0.5">{u}</span>
            </div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider">{l}</div>
          </div>
        ))}
      </div>

      {/* Bottom strip */}
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}
      >
        <span className="text-[9px] text-white/40">Heavy rainfall in next 6h</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"/>
          <span className="text-[9px] text-white/50">AI: 94%</span>
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
    <section
      className="relative"
      style={{ background: 'rgba(0,212,255,0.04)', borderTop: '1px solid rgba(0,212,255,0.1)', borderBottom: '1px solid rgba(0,212,255,0.1)' }}
    >
      <div className="max-w-5xl mx-auto px-5 py-4 flex flex-col items-center gap-3">
        <p className="text-[12px] text-white/45 tracking-wide m-0">
          Built to make early warning accessible.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {TRUST_ITEMS.map(item => (
            <div key={item} className="flex items-center gap-1.5 text-[11px] text-white/60">
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
    { label: 'Raw Data',           color: '#64748b' },
    { label: 'Weather Data',       color: '#0ea5e9' },
    { label: 'AI Prediction',      color: '#00d4ff' },
    { label: 'Simple Warning',     color: '#f59e0b' },
    { label: 'Human Action',       color: '#22c55e' },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-5" style={{ background: '#020817' }}>
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-3">The Problem</p>
          <h2 className="text-[clamp(24px,6vw,44px)] font-semibold text-white leading-[1.1] tracking-tight mb-5">
            Floods don't wait for<br />perfect information.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[15px] text-white/45 leading-relaxed mb-10">
            Communities often receive fragmented weather information, generic warnings, 
            or alerts that are difficult for ordinary people to interpret — when it's already too late.
          </p>
        </Reveal>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <Reveal>
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-5 px-5 sm:overflow-visible sm:grid sm:grid-cols-5 sm:gap-2 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {steps.map((step, i) => (
              <div key={step.label} className="snap-center sm:snap-none flex-shrink-0 sm:flex-shrink">
                <div
                  className="w-full sm:w-auto rounded-xl px-4 py-3 text-center text-[12px] font-medium whitespace-nowrap"
                  style={{ background: `${step.color}18`, border: `1px solid ${step.color}40`, color: step.color }}
                >
                  {step.label}
                </div>
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
    <section id="technology" className="py-16 md:py-24 px-5" style={{ background: 'linear-gradient(180deg, #020817 0%, #0a1628 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* Left — copy first on mobile, right on desktop */}
          <div className="order-2 lg:order-1">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-3">The Product</p>
              <h2 className="text-[clamp(24px,6vw,44px)] font-semibold text-white leading-[1.1] tracking-tight mb-5">
                One glance.<br />One decision.
              </h2>
              <p className="text-[15px] text-white/45 leading-relaxed mb-6">
                Instantly understand your flood risk. No technical jargon, 
                no complicated dashboards — just clear, actionable information.
              </p>
            </Reveal>
            <Reveal>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Risk Level',   value: 'HIGH',    c: '#ef4444' },
                  { label: 'Probability',   value: '82%',     c: '#00d4ff' },
                  { label: 'Rainfall',     value: '74 mm',   c: '#0ea5e9' },
                  { label: 'Time Window',  value: '6 hours', c: '#f59e0b' },
                ].map(({ label, value, c }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-[18px] font-bold" style={{ color: c }}>{value}</div>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-white/35 italic">
                Recommended action: Prepare for possible flooding.
              </p>
            </Reveal>
          </div>

          {/* Right — mockup, below on mobile */}
          <div className="order-1 lg:order-2">
            <Reveal>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#0a1628', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 60px rgba(0,212,255,0.07)' }}
              >
                {/* Window bar */}
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['#ef4444','#f59e0b','#22c55e'].map(c => (
                    <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }}/>
                  ))}
                  <div className="flex-1 mx-2 h-4 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }}/>
                </div>
                {/* Map */}
                <div className="relative h-40 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <defs>
                      <radialGradient id="prodMap" cx="55%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                    <rect width="500" height="160" fill="#061020"/>
                    {[0,1,2,3,4].map(i => (
                      <line key={`ph${i}`} x1="0" y1={i*32} x2="500" y2={i*32} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                    ))}
                    {[0,1,2,3,4,5,6].map(i => (
                      <line key={`pv${i}`} x1={i*72} y1="0" x2={i*72} y2="160" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                    ))}
                    <ellipse cx="270" cy="80" rx="150" ry="70" fill="url(#prodMap)"/>
                    <ellipse cx="270" cy="80" rx="85" ry="45" fill="rgba(239,68,68,0.1)"/>
                    <ellipse cx="270" cy="80" rx="42" ry="25" fill="rgba(239,68,68,0.2)"/>
                    <circle cx="270" cy="80" r="5" fill="#00d4ff" style={{filter:'drop-shadow(0 0 6px #00d4ff)'}}/>
                    <circle cx="270" cy="80" r="5" fill="none" stroke="#00d4ff" strokeWidth="1.5" style={{animation:'pulse-ring 2.5s ease-out infinite', transformOrigin:'270px 80px'}}/>
                  </svg>
                  <div className="absolute top-2 left-2 bg-[rgba(239,68,68,0.9)] rounded-lg px-2 py-1 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                    <span className="text-[9px] font-bold text-white">HIGH RISK</span>
                  </div>
                </div>
                {/* Data */}
                <div className="px-3 py-2.5 grid grid-cols-3 gap-2" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                  {[
                    { v: '82%',  l: 'Probability', c: '#00d4ff' },
                    { v: '74mm', l: 'Rainfall',    c: '#0ea5e9' },
                    { v: '6h',   l: 'Forecast',   c: '#f59e0b' },
                  ].map(({ v, l, c }) => (
                    <div key={l} className="text-center">
                      <div className="text-[16px] font-bold" style={{color:c}}>{v}</div>
                      <div className="text-[9px] text-white/40">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── AI Pipeline ──────────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { label: 'Weather\nForecast',  icon: 'M3 15a4 4 0 0 0 4 4h9a5 5 0 1 0-.2-9.6 4.9 4.9 0 0 0-2.3-4A5 5 0 0 0 2 9a5 5 0 0 0 5 5h5a4 4 0 0 0 4-4' },
  { label: 'Historical\nFlood Data', icon: 'M3 3v18h18M7 16l4-8 4 5 5-9' },
  { label: 'Geographic\nContext', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' },
  { label: 'Machine\nLearning', icon: 'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2' },
  { label: 'Flood Risk\nScore', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { label: 'Actionable\nWarning', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
]

function AIPipeline() {
  return (
    <section
      className="py-16 md:py-24 px-5"
      style={{ background: '#0a1628', borderTop: '1px solid rgba(0,212,255,0.07)', borderBottom: '1px solid rgba(0,212,255,0.07)' }}
    >
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-3 text-center">The Technology</p>
          <h2 className="text-[clamp(24px,6vw,44px)] font-semibold text-white leading-[1.1] tracking-tight mb-3 text-center">
            From weather signals<br />to early action.
          </h2>
          <p className="text-[15px] text-white/45 leading-relaxed text-center max-w-lg mx-auto mb-10">
            Our ensemble of Random Forest and XGBoost models processes real-time weather 
            and historical data to generate precise flood risk predictions.
          </p>
        </Reveal>

        <Reveal>
          {/* Horizontal scroll on mobile, wrap on desktop */}
          <div className="flex overflow-x-auto gap-3 pb-3 -mx-5 px-5 lg:overflow-visible lg:flex-wrap lg:justify-center lg:mx-0 lg:px-0 snap-x snap-mandatory">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="snap-center lg:snap-none flex-shrink-0">
                <div
                  className="w-[120px] lg:w-[128px] rounded-xl p-3.5 text-center"
                  style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.14)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ background: 'rgba(0,212,255,0.12)' }}
                  >
                    <svg className="w-4 h-4 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={step.icon}/>
                    </svg>
                  </div>
                  <div className="text-[10px] text-white/65 leading-tight whitespace-pre-line">{step.label}</div>
                </div>
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
    <section className="py-16 md:py-24 px-5" style={{ background: '#020817' }}>
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <div
            className="text-[clamp(56px,15vw,110px)] font-bold text-transparent leading-none tracking-tighter mb-3"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 50%, #0369a1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            6 HOURS
          </div>
          <h2 className="text-[clamp(18px,4vw,32px)] font-semibold text-white leading-snug tracking-tight mb-4">
            can change the outcome<br />of a flood event.
          </h2>
          <p className="text-[15px] text-white/45 leading-relaxed max-w-md mx-auto mb-12">
            Earlier awareness means better preparation, faster evacuation, and fewer disruptions 
            — when every hour matters.
          </p>
        </Reveal>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {[
            { label: 'Earlier awareness',      icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
            { label: 'Better preparation',    icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
            { label: 'Faster evacuation',     icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
            { label: 'Reduced disruption',    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
          ].map(({ label, icon }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}
            >
              <div
                className="w-9 h-9 rounded-xl mx-auto mb-2.5 flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)' }}
              >
                <svg className="w-4 h-4 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={icon}/>
                </svg>
              </div>
              <div className="text-[12px] text-white/65 font-medium">{label}</div>
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
    <section
      className="py-16 md:py-24 px-5"
      style={{ background: 'linear-gradient(180deg, #020817 0%, #071225 100%)', borderTop: '1px solid rgba(0,212,255,0.06)' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          <div>
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-3">Differentiator</p>
              <h2 className="text-[clamp(22px,4.5vw,38px)] font-semibold text-white leading-[1.15] tracking-tight mb-5">
                Early warning should not require expensive infrastructure.
              </h2>
              <p className="text-[15px] text-white/45 leading-relaxed mb-6">
                Built to work on low-end smartphones, weak internet connections, and tight budgets. 
                No physical sensors required — just open data and intelligent processing.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Low-cost', 'Low-bandwidth', 'Lightweight', 'Mobile-first', 'Open Data'].map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] text-[#00d4ff] px-3 py-1 rounded-full"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="flex items-center justify-center">
            <Reveal>
              {/* Phone + network viz */}
              <div className="relative">
                <div
                  className="relative z-10 w-32 h-64 rounded-[22px] overflow-hidden"
                  style={{ background: '#0a1628', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 30px rgba(0,212,255,0.12)' }}
                >
                  <div className="h-5 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="w-10 h-1 rounded-full bg-white/10"/>
                  </div>
                  <div className="p-3 flex flex-col gap-2.5">
                    <div className="text-[7px] text-[#00d4ff] font-semibold tracking-widest uppercase">Flood Risk</div>
                    <div className="text-[22px] font-bold text-white leading-none">HIGH</div>
                    <div className="text-[7px] text-white/45">Jakarta Selatan</div>
                    <div className="rounded-lg p-2 mt-1" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <div className="text-[7px] text-[#ef4444] mb-0.5">Probability</div>
                      <div className="text-[13px] font-bold text-white">82%</div>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
                      <div className="text-[7px] text-[#0ea5e9] mb-0.5">Rainfall</div>
                      <div className="text-[13px] font-bold text-white">74 mm</div>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <div className="text-[7px] text-[#f59e0b] mb-0.5">Window</div>
                      <div className="text-[13px] font-bold text-white">6 hours</div>
                    </div>
                  </div>
                </div>

                {/* Signal nodes */}
                {/* {[
                  { x: -48, y: -30, label: 'Weather API' },
                  { x: 48,  y: -20, label: 'Historical Data' },
                  { x: -40, y: 30,  label: 'Prediction' },
                  { x: 44,  y: 28,  label: 'Alerts' },
                ].map(({ x, y, label }) => (
                  <div
                    key={label}
                    className="absolute z-0 flex flex-col items-center gap-1"
                    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#00d4ff', opacity: 0.7, animation: 'float 3s ease-in-out infinite' }}
                      />
                    </div>
                    <span className="text-[8px] text-white/35 whitespace-nowrap">{label}</span>
                  </div>
                ))} */}

                {/* Connecting lines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  viewBox="0 0 260 260"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  {[1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1="130" y1="130"
                      x2={[82, 178, 90, 174][i-1]}
                      y2={[100, 110, 160, 158][i-1]}
                      stroke="rgba(0,212,255,0.12)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  ))}
                </svg>
              </div>
            </Reveal>
          </div>
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
    <section
      className="py-16 md:py-24 px-5"
      style={{ background: '#071225', borderTop: '1px solid rgba(0,212,255,0.06)' }}
    >
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-3 text-center">For Everyone</p>
          <h2 className="text-[clamp(22px,4.5vw,38px)] font-semibold text-white leading-[1.15] tracking-tight mb-3 text-center">
            Built for the whole community.
          </h2>
          <p className="text-[15px] text-white/45 leading-relaxed text-center max-w-lg mx-auto mb-10">
            Whether you're an individual, a neighborhood group, or a government agency — 
            Hydrovates gives you the information you need to act early.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {personas.map(p => (
            <Reveal key={p.title}>
              <div
                className="rounded-2xl p-5 h-full"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}28` }}
                >
                  <svg className="w-5 h-5" style={{ color: p.accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={p.icon}/>
                  </svg>
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-0.5">{p.title}</h3>
                <p className="text-[12px] mb-3" style={{ color: p.accent }}>{p.subtitle}</p>
                <p className="text-[13px] text-white/45 leading-relaxed m-0">{p.desc}</p>
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
    <section id="risk-map" className="py-16 md:py-24 px-5" style={{ background: '#020817' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#00d4ff] mb-3 text-center">Risk Map</p>
          <h2 className="text-[clamp(22px,4.5vw,38px)] font-semibold text-white leading-[1.15] tracking-tight mb-3 text-center">
            See risk before it reaches<br />your doorstep.
          </h2>
          <p className="text-[15px] text-white/45 text-center max-w-lg mx-auto mb-10">
            An interactive map showing flood-risk zones, rainfall cells, and live risk levels 
            across your region — updated continuously.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: '#061020', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 50px rgba(0,212,255,0.07)' }}
          >
            <div className="relative h-56 xs:h-72 sm:h-80 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 800 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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
                <rect width="800" height="280" fill="#061020"/>
                {[...Array(7)].map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i*40} x2="800" y2={i*40} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                ))}
                {[...Array(9)].map((_, i) => (
                  <line key={`v${i}`} x1={i*89} y1="0" x2={i*89} y2="280" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                ))}
                <ellipse cx="240" cy="130" rx="160" ry="100" fill="url(#riskGrad1)"/>
                <ellipse cx="540" cy="160" rx="120" ry="75" fill="url(#riskGrad2)"/>
                <ellipse cx="400" cy="140" rx="220" ry="130" fill="url(#mapGrad2)"/>
                {[
                  { cx: 240, cy: 130, r: 7, label: 'Jakarta Selatan', risk: 'HIGH' },
                  { cx: 540, cy: 160, r: 6, label: 'Surabaya Utara', risk: 'MODERATE' },
                  { cx: 380, cy: 100, r: 5, label: 'Bandung',        risk: 'LOW' },
                  { cx: 600, cy: 115, r: 5, label: 'Semarang',      risk: 'LOW' },
                ].map(({ cx, cy, r, label, risk }) => (
                  <g key={label}>
                    <circle cx={cx} cy={cy} r={r} fill={risk === 'HIGH' ? '#ef4444' : risk === 'MODERATE' ? '#f59e0b' : '#22c55e'} style={{filter:'drop-shadow(0 0 4px currentColor)'}}/>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                    <text x={cx + r + 4} y={cy + 4} fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Poppins, sans-serif">{label}</text>
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-white/55">
                {[['#ef4444','HIGH'],['#f59e0b','MODERATE'],['#22c55e','LOW']].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }}/>
                    {l}
                  </div>
                ))}
              </div>

              {/* Time control */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
                <svg className="w-3 h-3 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="text-[11px] text-white font-medium">Next 6 hours</span>
                <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      className="relative py-20 md:py-28 px-5 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020817 0%, #0a1628 50%, #020817 100%)' }}
    >
      <RainfallCanvas />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.1) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        <Reveal>
          <h2 className="text-[clamp(24px,6vw,46px)] font-semibold text-white leading-[1.1] tracking-tight mb-4">
            Prepare before the warning<br />becomes an emergency.
          </h2>
          <p className="text-[15px] text-white/45 leading-relaxed mb-8">
            Turn complex environmental data into decisions people can understand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#"
              className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[#020817] no-underline px-7 py-3.5 rounded-xl w-full sm:w-auto transition-all duration-150 hover:opacity-90"
              style={{ background: '#00d4ff', boxShadow: '0 0 24px rgba(0,212,255,0.35)' }}
            >
              Check Your Flood Risk
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 text-[15px] font-medium text-white/65 no-underline px-7 py-3.5 rounded-xl w-full sm:w-auto transition-all duration-150 hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.14)' }}
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
    <footer
      className="py-12 px-5"
      style={{ background: '#01050f', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-[15px]">Hydrovates</span>
            </div>
            <p className="text-[12px] text-white/35 leading-relaxed m-0">
              AI-powered flood intelligence<br />for safer, more prepared communities.
            </p>
          </div>

          {[
            { title: 'Product',    links: ['How It Works', 'Technology', 'Risk Map', 'About'] },
            { title: 'Resources',  links: ['Documentation', 'Research', 'API', 'GitHub'] },
            { title: 'Project',   links: ['About', 'Blog', 'Contact', 'Privacy'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-4">{title}</h4>
              <ul className="space-y-2 list-none m-0 p-0">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-[12px] text-white/45 no-underline hover:text-white transition-colors duration-150">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[11px] text-white/25 m-0">© 2026 Hydrovates — ISIF Competition Project</p>
          <p className="text-[11px] text-white/25 m-0 italic">Built for safer, more prepared communities.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()

  const handleCheckRisk = async () => {
    const { data } = await supabase.auth.getUser()
    navigate(data.user ? '/dashboard' : '/login')
  }

  return (
    <div style={{ background: '#020817', minHeight: '100vh' }}>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden "
          style={{ background: 'linear-gradient(160deg, #020817 0%, #030d2e 50%, #020817 100%)' }}
        >
          <RainfallCanvas />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.7) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
            aria-hidden="true"
          />

          {/* Glow orb */}
          <div
            className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none hidden sm:block"
            style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-5 py-16 w-full">
            {/* Centered single-column on mobile */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Copy — always first in source */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <span
                    className="inline-block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#00d4ff] mb-5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}
                  >
                    AI-Powered Flood Early Warning
                  </span>
                </motion.div>

                <motion.h1
                  className="text-[clamp(34px,8vw,72px)] font-semibold text-white leading-[1.05] tracking-[-1px] lg:tracking-[-2px] mb-5"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  Know the Risk.{' '}
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
                  className="text-[clamp(14px,2.5vw,17px)] text-white/45 leading-relaxed mb-8 max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  AI-powered flood risk prediction that turns weather and environmental data 
                  into clear, actionable early warnings for everyone.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <button
                    onClick={handleCheckRisk}
                    className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[#020817] no-underline px-7 py-3.5 rounded-xl w-full sm:w-auto transition-opacity duration-150 hover:opacity-90"
                    style={{ background: '#00d4ff', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
                  >
                    Check Flood Risk
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                  <a
                    href="#how-it-works"
                    className="flex items-center justify-center gap-2 text-[15px] font-medium text-white/65 no-underline px-7 py-3.5 rounded-xl w-full sm:w-auto transition-colors duration-150 hover:text-white"
                    style={{ border: '1px solid rgba(255,255,255,0.14)' }}
                  >
                    See How It Works
                  </a>
                </motion.div>
              </div>

              {/* Right: Dashboard viz — below on mobile, right on desktop */}
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="w-full max-w-[380px]">
                  <RiskDashboardViz />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator — desktop only */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <span className="text-[9px] text-white/25 uppercase tracking-widest">Scroll</span>
            <motion.div
              className="w-4 h-7 rounded-full border border-white/15 flex justify-center pt-1.5"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-0.5 h-1.5 rounded-full bg-white/30" />
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
