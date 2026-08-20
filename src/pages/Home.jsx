import { useState } from 'react'

const RISK_LEVELS = [
  { level: 'Very Low', color: '#16a34a', bg: '#dcfce7', label: 'Aman', score: '0–20' },
  { level: 'Low', color: '#65a30d', bg: '#ecfccb', label: 'Rendah', score: '21–40' },
  { level: 'Moderate', color: '#ca8a04', bg: '#fef9c3', label: 'Waspada', score: '41–60' },
  { level: 'High', color: '#ea580c', bg: '#ffedd5', label: 'Tinggi', score: '61–80' },
  { level: 'Critical', color: '#dc2626', bg: '#fee2e2', label: 'Kritis', score: '81–100' },
]

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    title: 'Deteksi Lokasi',
    desc: 'Gunakan GPS, cari nama daerah, atau pilih secara manual di peta.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 5 5-9" />
      </svg>
    ),
    title: 'Risiko Banjir',
    desc: 'Probabilitas dan tingkat risiko banjir dalam hitungan detik.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: 'Peringatan Dini',
    desc: 'Notifikasi saat risiko melewati batas ambang yang ditentukan.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: 'Tindakan Rekomendasi',
    desc: 'Langkah nyata yang harus dilakukan berdasarkan tingkat risiko.',
  },
]

const STEPS = [
  { n: '01', title: 'Pilih Lokasi', desc: 'Masukkan lokasi Anda melalui GPS atau pencarian.' },
  { n: '02', title: 'Lihat Risiko', desc: 'Sistem menampilkan probabilitas dan tingkat risiko banjir.' },
  { n: '03', title: 'Ambil Tindakan', desc: 'Ikuti rekomendasi dan pantau informasi resmi.' },
]

export default function Home() {
  const [location, setLocation] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [demoRisk] = useState('Moderate')

  const activeRisk = RISK_LEVELS.find(r => r.level === demoRisk) || RISK_LEVELS[2]

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#16171d] border-b border-[#e5e4e7] dark:border-[#2e303a] backdrop-blur-md">
        <div className="max-w-[1126px] mx-auto px-6 h-[60px] flex items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-[#08060d] dark:text-[#f3f4f6] no-underline font-semibold text-[17px] tracking-tight">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            Hydrovates
          </a>

          {/* Nav links */}
          <nav className="flex items-center gap-7" aria-label="Main navigation">
            <a href="#fitur" className="text-[#6b6375] dark:text-[#9ca3af] no-underline text-[15px] hover:text-[#08060d] dark:hover:text-[#f3f4f6] transition-colors duration-150 hidden sm:block">Fitur</a>
            <a href="#cara" className="text-[#6b6375] dark:text-[#9ca3af] no-underline text-[15px] hover:text-[#08060d] dark:hover:text-[#f3f4f6] transition-colors duration-150 hidden sm:block">Cara Kerja</a>
            <a href="#risiko" className="bg-[#0369a1] text-white no-underline text-[15px] font-medium px-4 py-[7px] rounded-lg hover:opacity-85 transition-opacity duration-150">
              Cek Risiko
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="bg-gradient-to-b from-[#e0f2fe] to-white dark:from-[#0c4a6e] dark:to-[#16171d] pt-16 pb-0 text-center"
        aria-label="Hero"
      >
        <div className="max-w-[600px] mx-auto px-6 flex flex-col items-center">

          <span className="inline-block bg-[#0369a1] text-white text-[12px] font-semibold tracking-[1px] uppercase px-3 py-1 rounded-full mb-5">
            Sistem Peringatan Dini Banjir
          </span>

          <h1 className="text-[clamp(32px,6vw,56px)] font-heading font-semibold leading-[1.1] tracking-[-1.5px] text-[#08060d] dark:text-[#f3f4f6] mb-4">
            Apakah daerah Anda<br />
            <span className="text-[#0369a1]">berisiko banjir?</span>
          </h1>

          <p className="text-[clamp(15px,2.5vw,17px)] text-[#6b6375] dark:text-[#9ca3af] leading-relaxed mb-8">
            Ketahui risiko banjir sebelum air naik.<br />
            Ringan, cepat, dan dapat diakses langsung dari browser.
          </p>

          {/* Location card */}
          <div className="w-full max-w-[480px] bg-white dark:bg-[#1f2028] border border-[#e5e4e7] dark:border-[#2e303a] rounded-2xl p-4 shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px,rgba(0,0,0,0.05)_0_4px_6px_-2px] flex flex-col gap-3">
            {/* Input row */}
            <div className="flex items-center gap-2.5 bg-[#f4f3ec] dark:bg-[#1f2028] border border-[#e5e4e7] dark:border-[#2e303a] rounded-xl px-3 py-1 focus-within:border-[#0369a1] transition-colors duration-150">
              <svg className="w-4 h-4 text-[#6b6375] dark:text-[#9ca3af] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="flex-1 bg-transparent text-[15px] text-[#08060d] dark:text-[#f3f4f6] placeholder-[#6b6375] dark:placeholder-[#9ca3af] outline-none min-w-0 py-2"
                placeholder="Cari nama daerah…"
                value={location}
                onChange={e => setLocation(e.target.value)}
                aria-label="Cari lokasi"
              />
              <button
                type="button"
                className="text-[#0369a1] p-1 rounded-lg hover:bg-[#e0f2fe] dark:hover:bg-[#0c4a6e] transition-colors duration-150 cursor-pointer"
                aria-label="Gunakan lokasi GPS"
                onClick={() => setSearchOpen(s => !s)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </button>
            </div>

            {/* Suggestions dropdown */}
            {searchOpen && (
              <ul className="border-t border-[#e5e4e7] dark:border-[#2e303a] pt-1 pb-1 list-none m-0 p-0">
                {['Jakarta Selatan', 'Surabaya Pusat', 'Bandung', 'Semarang', 'Makassar'].map(city => (
                  <li key={city}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 bg-transparent border-none text-[#08060d] dark:text-[#f3f4f6] text-[14px] text-left px-3 py-2 rounded-lg hover:bg-[#e0f2fe] dark:hover:bg-[#0c4a6e] cursor-pointer transition-colors duration-100"
                      onClick={() => { setLocation(city); setSearchOpen(false) }}
                    >
                      <svg className="w-4 h-4 text-[#0369a1] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA button */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-[#0369a1] text-white border-none rounded-xl py-3.5 px-6 text-[15px] font-semibold cursor-pointer hover:opacity-85 transition-opacity duration-150 tracking-wide"
              onClick={() => { }}
            >
              Cek Risiko
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Privacy note */}
          <p className="flex items-center gap-1.5 text-[12px] text-[#6b6375] dark:text-[#9ca3af] mt-3">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Data lokasi hanya digunakan untuk menghasilkan prediksi risiko.
          </p>
        </div>

        {/* Wave divider */}
        <div className="mt-12 leading-none">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-[clamp(40px,6vw,72px)] block">
            <path d="M0,40 C240,90 480,0 720,40 C960,90 1200,0 1440,40 L1440,72 L0,72 Z" fill="currentColor" className="text-white dark:text-[#16171d]" />
          </svg>
        </div>
      </section>

      {/* ── Risk band ── */}
      <section
        id="risiko"
        className="py-6 px-6 border-t border-b border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d]"
        aria-label="Tingkat risiko"
      >
        <div className="max-w-[1126px] mx-auto flex flex-wrap gap-2 items-center justify-center">
          {RISK_LEVELS.map(({ level, color, bg, label, score }) => {
            const isActive = level === demoRisk
            return (
              <div
                key={level}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-transform duration-150"
                style={{
                  color,
                  backgroundColor: bg,
                  borderColor: color,
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 0 3px color-mix(in srgb, ${color} 25%, transparent)` : 'none',
                }}
                aria-label={`Risiko ${level}: ${label}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{label}</span>
                <span className="opacity-60 text-[11px]">{score}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="fitur" className="py-[clamp(48px,8vw,96px)] px-6 bg-white dark:bg-[#16171d]" aria-label="Fitur">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-[12px] font-semibold tracking-[1.5px] uppercase text-[#0369a1] mb-2.5">Fitur Utama</p>
          <h2 className="text-[clamp(24px,4vw,36px)] font-heading font-semibold tracking-[-0.8px] leading-[1.15] text-[#08060d] dark:text-[#f3f4f6] mb-12">
            Semua yang Anda butuhkan<br />untuk tetap waspada
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 text-left">
            {FEATURES.map(({ icon, title, desc }) => (
              <article
                key={title}
                className="bg-[#f4f3ec] dark:bg-[#1f2028] border border-[#e5e4e7] dark:border-[#2e303a] rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-150 hover:border-[#7dd3fc] hover:shadow-[0_4px_20px_rgba(3,105,161,0.08)]"
              >
                <div className="w-11 h-11 bg-[#e0f2fe] dark:bg-[#0c4a6e] rounded-xl flex items-center justify-center text-[#0369a1]">
                  {icon}
                </div>
                <h3 className="text-[16px] font-semibold text-[#08060d] dark:text-[#f3f4f6] m-0">{title}</h3>
                <p className="text-[14px] text-[#6b6375] dark:text-[#9ca3af] leading-relaxed m-0">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="cara"
        className="py-[clamp(48px,8vw,96px)] px-6 bg-[#f4f3ec] dark:bg-[#1f2028] border-t border-b border-[#e5e4e7] dark:border-[#2e303a]"
        aria-label="Cara kerja"
      >
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-[12px] font-semibold tracking-[1.5px] uppercase text-[#0369a1] mb-2.5">Cara Kerja</p>
          <h2 className="text-[clamp(24px,4vw,36px)] font-heading font-semibold tracking-[-0.8px] leading-[1.15] text-[#08060d] dark:text-[#f3f4f6] mb-10">
            Tiga langkah sederhana
          </h2>

          <div className="flex flex-col">
            {STEPS.map(({ n, title, desc }, i) => (
              <div key={n} className="flex items-center gap-5 py-6 border-b border-[#e5e4e7] dark:border-[#2e303a] last:border-b-0">
                <div className="text-[28px] font-bold text-[#7dd3fc] font-heading w-11 shrink-0 text-center tabular-nums">
                  {n}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-[16px] font-semibold text-[#08060d] dark:text-[#f3f4f6] mb-1">{title}</h3>
                  <p className="text-[14px] text-[#6b6375] dark:text-[#9ca3af] leading-relaxed m-0">{desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="text-[20px] text-[#e5e4e7] dark:text-[#2e303a] shrink-0 hidden sm:block">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-[clamp(48px,8vw,96px)] px-6 bg-gradient-to-br from-[#0369a1] to-[#0c4a6e] text-center" aria-label="Mulai">
        <div className="max-w-[500px] mx-auto flex flex-col items-center gap-4">
          <h2 className="text-[clamp(26px,5vw,40px)] font-heading font-semibold text-white tracking-[-1px] leading-[1.1] m-0">
            Siaga sebelum air naik.
          </h2>
          <p className="text-[16px] text-white/75 m-0">
            Gunakan sekarang, tanpa instalasi.
          </p>
          <button
            type="button"
            className="flex items-center gap-2 bg-white text-[#0369a1] border-none rounded-xl py-3.5 px-7 text-[16px] font-bold cursor-pointer mt-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:[-translate-y(0.5px)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-150"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Mulai Sekarang
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 bg-white dark:bg-[#16171d] border-t border-[#e5e4e7] dark:border-[#2e303a]">
        <div className="max-w-[700px] mx-auto flex flex-col gap-3 text-center">
          <p className="text-[13px] text-[#6b6375] dark:text-[#9ca3af] leading-relaxed p-4 bg-[#fef9c3] dark:bg-[#1f2028] border border-[#ca8a04] dark:border-[#2e303a] rounded-xl m-0">
            <strong className="text-[#ca8a04] dark:text-[#ca8a04]">Catatan penting:</strong>{' '}
            Prediksi ini dihasilkan oleh model AI. Selalu ikuti instruksi resmi dari BNPB, BPBD, atau otoritas kebencanaan setempat. Sistem ini bukan pengganti peringatan resmi.
          </p>
          <p className="text-[12px] text-[#6b6375] dark:text-[#9ca3af] opacity-50 m-0">
            © 2026 Hydrovates
          </p>
        </div>
      </footer>

    </div>
  )
}
