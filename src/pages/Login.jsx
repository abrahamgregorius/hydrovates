import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import supabase from '../lib/supabase'

// ─── Shared auth page layout ──────────────────────────────────────────────────
function AuthPage({ children, title, subtitle }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden"
      style={{ background: '#020817' }}
    >
      {/* Atmospheric background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo / brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <span className="font-semibold text-white text-[18px]">Hydrovates</span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-center mb-5">
            <h1 className="text-[20px] font-semibold text-white leading-[1.15] tracking-tight mb-1">{title}</h1>
            <p className="text-[12px] text-white/40 m-0">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Back to landing */}
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-[12px] text-white/30 no-underline hover:text-white/60 transition-colors duration-150 flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to landing
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Shared input style ───────────────────────────────────────────────────────
function Input({ label, id, type = 'text', error, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'on'}
        className="w-full rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/25 outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${error ? '#ef4444' : focused ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: focused && !error ? '0 0 0 2px rgba(0,212,255,0.1)' : error ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}

// ─── Shared button style ──────────────────────────────────────────────────────
function Button({ children, loading, error, ...props }) {
  return (
    <button
      className="w-full flex items-center cursor-pointer justify-center gap-2 text-[13px] font-semibold text-[#020817] py-2 px-3 rounded-lg transition-all duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      style={{ background: '#00d4ff', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Please wait…
        </>
      ) : children}
    </button>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate('/')
    }
  }

  return (
    <AuthPage
      title="Welcome back"
      subtitle="Sign in to your Hydrovates account"
    >
      <form onSubmit={handleLogin} noValidate>
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-[12px] text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            {error}
          </div>
        )}

        <Button type="submit" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-[12px] text-white/35 mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#00d4ff] no-underline hover:underline font-medium">
          Create one
        </Link>
      </p>
    </AuthPage>
  )
}
