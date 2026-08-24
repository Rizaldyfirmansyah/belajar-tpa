'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap, BookOpen, ClipboardList, BarChart2, Brain,
  Clock, Target, Award, Users, Building2, TrendingUp, CheckCircle, ArrowRight,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  ink:        '#0A0F20',
  navy:       '#0D1430',
  navy2:      '#111B40',
  navyLine:   'rgba(255,255,255,0.10)',
  blue:       '#2C53EA',
  blue600:    '#2042C8',
  blueSoft:   '#5B7BFF',
  blue100:    '#EAF0FF',
  green:      '#18BD73',
  greenSoft:  '#4FE0A0',
  green50:    '#E8F8F0',
  cream:      '#F5F4EF',
  cream2:     '#FBFAF7',
  line:       '#E7E4DC',
  inkText:    '#0E1626',
  bodyText:   '#444E5E',
  muted:      '#707A8A',
  onDark:     '#EAEEF8',
  onDarkSoft: '#A4ADC4',
  onDarkMute: '#6E7794',
} as const

const ss = '0 1px 2px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.05)'
const sm = '0 8px 30px rgba(13,20,48,.08), 0 2px 8px rgba(13,20,48,.05)'
const sb = '0 18px 40px rgba(44,83,234,.30)'

const W = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }

const JOURNEY = [
  { cx: 143, cy: 490, label: 'Latihan TPA',      sub: 'Mulai dari sini',      color: C.blueSoft, right: false },
  { cx: 238, cy: 330, label: 'Lolos Seleksi',    sub: 'Skor di atas passing', color: C.blueSoft, right: true  },
  { cx: 345, cy: 165, label: 'Diterima S2/LPDP', sub: 'Impian jadi nyata',    color: C.greenSoft,right: false },
  { cx: 298, cy: 50,  label: 'Karir Berkembang', sub: 'Buka peluang baru',    color: C.greenSoft,right: true  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [score, setScore] = useState(540)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const target = 692
    let cur = 540
    let raf: number
    const tick = () => {
      cur += Math.ceil((target - cur) / 8)
      setScore(cur >= target ? target : cur)
      if (cur < target) raf = requestAnimationFrame(tick)
    }
    const t = setTimeout(() => { raf = requestAnimationFrame(tick) }, 350)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rv'))
    els.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in') })
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    )
    els.forEach(el => obs.observe(el))
    const fs = setTimeout(() => els.forEach(el => el.classList.add('in')), 2500)
    return () => { obs.disconnect(); clearTimeout(fs) }
  }, [])

  return (
    <div style={{ background: C.cream, fontFamily: "'Plus Jakarta Sans',sans-serif", color: C.bodyText, overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box} a{text-decoration:none}
        .rv{opacity:0;transform:translateY(26px);transition:opacity .6s ease,transform .6s ease}
        .rv.in{opacity:1;transform:translateY(0)}
        .rv.in[data-d="100"]{transition-delay:.1s}
        .rv.in[data-d="150"]{transition-delay:.15s}
        .rv.in[data-d="200"]{transition-delay:.2s}
        .rv.in[data-d="300"]{transition-delay:.3s}
        .rv.in[data-d="400"]{transition-delay:.4s}
        .ch{transition:transform .25s ease,box-shadow .25s ease}
        .ch:hover{transform:translateY(-4px);box-shadow:0 8px 30px rgba(13,20,48,.08),0 2px 8px rgba(13,20,48,.05)}
        .bh{transition:transform .2s ease,background .2s ease,color .2s ease}
        .bh:hover{transform:translateY(-2px)}
        .ah svg{transition:transform .2s ease}
        .ah:hover svg{transform:translateX(4px)}
        .pfeat:hover{margin-top:-16px;box-shadow:0 28px 60px rgba(44,83,234,.40)}
        .pfeat{transition:margin-top .25s ease,box-shadow .25s ease}
        @media(max-width:1024px){.hg{grid-template-columns:1fr!important}.hr{display:none!important}}
        @media(max-width:768px){
          .sp{padding:64px 0!important}
          .g3{grid-template-columns:1fr!important}
          .g2{grid-template-columns:1fr!important}
          .g4s{grid-template-columns:repeat(2,1fr)!important;border-radius:14px!important}
          .g4s>div{border-right:none!important;border-bottom:1px solid #E7E4DC}
          .g4s>div:last-child{border-bottom:none!important}
          .hs{grid-template-columns:repeat(2,1fr)!important}
          .tg{grid-template-columns:repeat(2,1fr)!important}
          .fg{grid-template-columns:1fr 1fr!important}
          .pg{grid-template-columns:1fr!important}
          .ip{padding:0 20px!important}
          .nl{display:none!important}
          .h1{font-size:clamp(32px,8vw,64px)!important}
        }
      ` }} />

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 76,
        background: scrolled ? 'rgba(247,246,242,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.line}` : '1px solid transparent',
        transition: 'background .3s,border-color .3s',
      }}>
        <div style={{ ...W, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="ip">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(150deg,#5B7BFF,#2C53EA)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GraduationCap size={21} color="white" />
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: scrolled ? C.inkText : C.onDark, transition: 'color .3s' }}>Belajar TPA</span>
          </Link>
          <nav className="nl" style={{ display: 'flex', gap: 38 }}>
            {[['#fitur','Fitur'],['#cara-kerja','Cara Kerja'],['#harga','Harga']].map(([h,l]) => (
              <a key={h} href={h} style={{ fontSize: 15, fontWeight: 600, color: scrolled ? C.bodyText : C.onDarkSoft, transition: 'color .3s' }}>{l}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: 15, fontWeight: 600, color: scrolled ? C.bodyText : C.onDarkSoft, transition: 'color .3s' }}>Masuk</Link>
            <Link href="/register" className="bh" style={{ background: C.blue, color: 'white', fontSize: 15, fontWeight: 600, padding: '9px 20px', borderRadius: 10 }}>Daftar Gratis</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(180deg,${C.ink},${C.navy} 60%,${C.ink})`, padding: '70px 0 0', position: 'relative', overflow: 'hidden' }}>
        {/* BG glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(44,83,234,.35) 0%,transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(24,189,115,.2) 0%,transparent 65%)' }} />
          {[[12,8],[25,22],[38,15],[52,5],[67,18],[80,12],[92,25],[8,45],[18,68],[32,55],[48,72],[62,38],[75,60],[88,48],[5,85],[20,92],[35,78],[55,88],[70,75],[85,82],[95,70]].map(([x,y],i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: i%3===0?2:1.5, height: i%3===0?2:1.5, borderRadius: '50%', background: 'rgba(255,255,255,0.55)' }} />
          ))}
        </div>

        <div style={{ ...W, position: 'relative', zIndex: 1 }} className="ip">
          <div className="hg" style={{ display: 'grid', gridTemplateColumns: '1.04fr 0.96fr', gap: 56, alignItems: 'center', paddingBottom: 100 }}>

            {/* Left copy */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.navyLine}`, borderRadius: 100, padding: '7px 16px', marginBottom: 28 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenSoft, boxShadow: `0 0 8px ${C.greenSoft}`, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.onDarkSoft, letterSpacing: '0.05em' }}>Platform Latihan TPA Terlengkap</span>
              </div>

              <h1 className="h1" style={{ fontSize: 'clamp(40px,5.2vw,64px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.04, color: C.onDark, margin: '0 0 20px' }}>
                Kuasai TPA, buka{' '}
                <span style={{ color: C.greenSoft }}>peluang</span>{' '}
                yang selama ini kamu kejar.
              </h1>

              <p style={{ fontSize: 19, lineHeight: 1.6, color: C.onDarkSoft, margin: '0 0 24px', maxWidth: 480 }}>
                Latihan soal terstruktur untuk seleksi S2, beasiswa LPDP, rekrutmen BUMN, ASN, dan berbagai ujian yang mensyaratkan kemampuan potensi akademik.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {['Seleksi S2/S3','Beasiswa LPDP','Rekrutmen BUMN','CPNS/ASN','Beasiswa BPI','Seleksi Korporat'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.navyLine}`, color: C.onDarkSoft, fontSize: 13.5, fontWeight: 600, borderRadius: 9, padding: '7px 14px' }}>{t}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
                <Link href="/register" className="bh ah" style={{ background: C.blue, color: 'white', fontWeight: 700, fontSize: 16, padding: '14px 26px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: sb }}>
                  Mulai Gratis Sekarang <ArrowRight size={18} />
                </Link>
                <a href="#harga" className="bh" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.navyLine}`, color: C.onDark, fontWeight: 600, fontSize: 16, padding: '14px 26px', borderRadius: 12 }}>
                  Lihat Harga
                </a>
              </div>

              <div className="hs" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[{v:'250',l:'Soal/Sesi'},{v:'12',l:'Topik'},{v:'3 Jam',l:'Simulasi'},{v:'AI',l:'Analisis'}].map(({v,l}) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.navyLine}`, borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.onDark, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 12, color: C.onDarkMute, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: journey visual */}
            <div className="hr" style={{ position: 'relative', height: 540 }}>
              {/* Score card */}
              <div style={{ position: 'absolute', top: 38, left: -8, width: 196, zIndex: 10, background: 'rgba(17,27,64,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: `1px solid ${C.navyLine}`, borderRadius: 18, padding: '18px 20px' }}>
                <div style={{ fontSize: 12, color: C.onDarkMute, marginBottom: 6 }}>Skor Terakhir</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: C.onDark, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.greenSoft, marginTop: 6 }}>+47 poin</div>
                <div style={{ marginTop: 10, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${(score/800)*100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg,${C.blue},${C.greenSoft})`, transition: 'width .1s' }} />
                </div>
              </div>

              <svg viewBox="0 0 500 540" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="jp" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={C.blueSoft} />
                    <stop offset="55%" stopColor={C.blueSoft} />
                    <stop offset="100%" stopColor={C.greenSoft} />
                  </linearGradient>
                </defs>
                <path d="M143 490 C150 420,195 370,238 330 C281 290,385 215,345 165 C305 115,268 72,298 50"
                  stroke="url(#jp)" strokeWidth="2.5" fill="none" strokeDasharray="2 9" strokeLinecap="round" />
                {JOURNEY.map(({ cx, cy, label, sub, color, right }) => {
                  const tx = right ? cx - 26 : cx + 26
                  const anchor = right ? 'end' : 'start'
                  return (
                    <g key={label}>
                      <circle cx={cx} cy={cy} r={15} fill={color} opacity={0.12} />
                      <circle cx={cx} cy={cy} r={9}  fill={color} opacity={0.18} />
                      <circle cx={cx} cy={cy} r={5}  fill="none" stroke={color} strokeWidth={1.5} />
                      <circle cx={cx} cy={cy} r={2.5} fill={color} />
                      <text x={tx} y={cy-4}  fill={C.onDark}     fontSize="11"  fontWeight="700" textAnchor={anchor as 'start'|'end'} style={{fontFamily:'inherit'}}>{label}</text>
                      <text x={tx} y={cy+9}  fill={C.onDarkMute} fontSize="9.5" textAnchor={anchor as 'start'|'end'} style={{fontFamily:'inherit'}}>{sub}</text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Wave out */}
        <div style={{ position: 'relative', height: 70, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
            <path d="M0 70 L0 38 C360 -8,1080 -8,1440 38 L1440 70 Z" fill={C.cream} />
          </svg>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ background: C.cream, borderBottom: `1px solid ${C.line}`, padding: '60px 0' }}>
        <div style={W} className="ip">
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', margin: '0 0 32px' }}>DIPAKAI UNTUK PERSIAPAN BERBAGAI SELEKSI</p>
          <div className="tg" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>
            {[
              { Icon: Building2,    label: 'Seleksi S2/S3',   sub: 'PTN & PTS' },
              { Icon: Award,        label: 'Beasiswa LPDP',   sub: 'Dalam & Luar Negeri' },
              { Icon: Users,        label: 'Rekrutmen BUMN',  sub: 'FHCI & Mandiri' },
              { Icon: Target,       label: 'CPNS / ASN',      sub: 'SKB & SKD' },
              { Icon: GraduationCap,label: 'Beasiswa BPI',    sub: 'Kemendikbud' },
              { Icon: TrendingUp,   label: 'Seleksi Korporat',sub: 'BUMN & Swasta' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="ch" style={{ background: 'white', border: `1px solid ${C.line}`, borderRadius: 14, padding: '20px 14px', textAlign: 'center', boxShadow: ss }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: C.blue100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Icon size={21} color={C.blue} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.inkText, lineHeight: 1.3 }}>{label}</div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="fitur" className="sp" style={{ background: C.cream2, padding: '100px 0' }}>
        <div style={W} className="ip">
          <div className="rv" style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', margin: '0 0 12px' }}>MASALAHNYA BUKAN PINTAR ATAU TIDAK</p>
            <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: C.inkText, margin: '0 0 16px' }}>Kenapa banyak orang gagal di tes TPA?</h2>
            <p style={{ fontSize: 18, color: C.bodyText, maxWidth: 540, margin: '0 auto' }}>TPA menguji kecepatan dan kebiasaan berpikir. Hampir selalu, masalahnya ada di cara persiapan.</p>
          </div>
          <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {[
              { Icon: Clock,    bg: '#FFF3DC', ic: '#D98A1A', title: 'Waktu sangat sempit',         body: '250 soal dalam 180 menit — rata-rata hanya 43 detik per soal. Tanpa latihan, sebagian besar orang tidak sempat menyelesaikan semuanya.' },
              { Icon: Target,   bg: '#FDE6E6', ic: '#D64545', title: 'Tidak tahu kelemahan sendiri', body: 'Belajar semua topik sama rata tidak efisien. Padahal tiap orang punya titik lemah berbeda — verbal, numerik, atau penalaran.' },
              { Icon: BookOpen, bg: '#ECE9FD', ic: '#6B5BD6', title: 'Latihan tidak terstruktur',    body: 'Buku TPA generik tidak mensimulasikan kondisi ujian nyata. Kamu butuh latihan yang mirip persis dengan format aslinya.' },
            ].map(({ Icon, bg, ic, title, body }, i) => (
              <div key={title} className="ch rv" data-d={String(i*100)} style={{ background: 'white', border: `1px solid ${C.line}`, borderRadius: 18, padding: '34px 30px', boxShadow: ss }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={22} color={ic} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: C.inkText, margin: '0 0 12px' }}>{title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: C.bodyText, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="sp" style={{ background: C.cream, padding: '100px 0' }}>
        <div style={W} className="ip">
          <div className="rv" style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', margin: '0 0 12px' }}>FITUR</p>
            <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: C.inkText, margin: '0 0 16px' }}>Semua yang kamu butuhkan, dalam satu platform</h2>
            <p style={{ fontSize: 18, color: C.bodyText, maxWidth: 540, margin: '0 auto' }}>Bukan sekadar kumpulan soal. Sistem belajar lengkap yang membantu kamu berlatih lebih cerdas, bukan lebih lama.</p>
          </div>
          <div className="g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 22 }}>
            {[
              { Icon: BookOpen,     bg: C.blue100, ic: C.blue,  title: 'Drill soal per topik',    desc: 'Latihan terfokus per topik dengan bank soal besar yang selalu diacak.', bullets: ['Bank soal besar selalu diacak','Pembahasan langsung setelah menjawab','Progres dan akurasi terlacak per topik'] },
              { Icon: ClipboardList,bg: C.green50, ic: C.green, title: 'Simulasi try out penuh',  desc: 'Simulasi ujian lengkap dengan kondisi dan format yang mirip ujian aslinya.', bullets: ['250 soal dari semua topik','Timer 15 menit per subtes','Skor terstandarisasi 200–800'] },
              { Icon: Brain,        bg: C.blue100, ic: C.blue,  title: 'Analisis AI personal',    desc: 'AI menganalisis performa kamu secara mendalam untuk panduan belajar yang tepat.', bullets: ['Ringkasan otomatis pasca try out','Analisis menyeluruh on-demand','Identifikasi topik prioritas latihan'] },
              { Icon: BarChart2,    bg: C.green50, ic: C.green, title: 'Dashboard progres',       desc: 'Pantau perkembangan belajar kamu dari waktu ke waktu dengan visualisasi lengkap.', bullets: ['Grafik tren skor antar try out','Akurasi & kecepatan per topik','Streak & konsistensi belajar'] },
            ].map(({ Icon, bg, ic, title, desc, bullets }, i) => (
              <div key={title} className="ch rv" data-d={String((i%2)*100)} style={{ background: 'white', border: `1px solid ${C.line}`, borderRadius: 26, padding: 40, boxShadow: ss }}>
                <div style={{ width: 56, height: 56, borderRadius: 15, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <Icon size={26} color={ic} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: C.inkText, margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: 15, color: C.bodyText, lineHeight: 1.6, margin: '0 0 20px' }}>{desc}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: C.bodyText }}>
                      <CheckCircle size={17} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA (dark) ── */}
      <section id="cara-kerja" style={{ background: C.navy, position: 'relative' }}>
        <div style={{ position: 'relative', height: 70, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
            <path d="M0 0 L0 32 C360 76,1080 76,1440 32 L1440 0 Z" fill={C.cream} />
          </svg>
        </div>
        <div style={{ padding: '80px 0 100px' }}>
          <div style={W} className="ip">
            <div className="rv" style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.blueSoft, letterSpacing: '0.14em', margin: '0 0 12px' }}>CARA KERJA</p>
              <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: C.onDark, margin: 0 }}>Tiga langkah menuju skor impianmu</h2>
            </div>
            <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 32, left: '16.7%', right: '16.7%', height: 1, background: 'rgba(255,255,255,0.07)' }} />
              {[
                { n:'01', Icon: GraduationCap, title: 'Daftar & kenali posisimu',       body: 'Buat akun gratis. Ikuti try out pertama untuk tahu skor awal dan topik mana yang paling perlu ditingkatkan.' },
                { n:'02', Icon: BookOpen,       title: 'Drill topik lemahmu',            body: 'Gunakan modul belajar untuk latihan terfokus di topik yang skornya rendah. Ulangi sampai akurasi meningkat.' },
                { n:'03', Icon: BarChart2,      title: 'Try out rutin & pantau progres', body: 'Ikuti try out berkala, baca analisis AI, dan lihat tren peningkatan skor kamu di dashboard.' },
              ].map(({ n, Icon, title, body }, i) => (
                <div key={n} className="rv" data-d={String(i*150)} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg,${C.blueSoft},${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Icon size={26} color="white" />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.blueSoft, letterSpacing: '0.14em', margin: '0 0 10px' }}>LANGKAH {n}</p>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: C.onDark, margin: '0 0 12px' }}>{title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: C.onDarkSoft, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', height: 70, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
            <path d="M0 70 L0 38 C360 -8,1080 -8,1440 38 L1440 70 Z" fill={C.cream2} />
          </svg>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="sp" style={{ background: C.cream2, padding: '100px 0' }}>
        <div style={W} className="ip">
          <div className="rv" style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', margin: '0 0 12px' }}>HASIL NYATA</p>
            <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: C.inkText, margin: 0 }}>Dipercaya para pejuang seleksi</h2>
          </div>
          {/* Stats band */}
          <div className="g4s rv" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.line}`, marginBottom: 48, background: 'white' }}>
            {[
              { v:'10.000+', l:'Pejuang TPA terdaftar',    c: C.blue  },
              { v:'+128',    l:'Rata-rata kenaikan skor',  c: C.green },
              { v:'87%',     l:'Merasa lebih siap ujian',  c: C.blue  },
              { v:'4,9/5',   l:'Rating rata-rata pengguna',c: C.blue  },
            ].map(({ v, l, c }, i) => (
              <div key={l} style={{ padding: '32px 20px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${C.line}` : 'none' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: c, lineHeight: 1, marginBottom: 6 }}>{v}</div>
                <div style={{ fontSize: 14, color: C.bodyText }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Testimonials */}
          <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {[
              { q:'Setelah latihan rutin di sini 2 bulan, skor TPA gua naik dari 520 ke 680. Langsung lolos seleksi S2 UI yang sudah gua impikan.', n:'Rizky A.',  r:'Diterima S2 Ilmu Komputer UI' },
              { q:'Fitur analisis AI-nya keren banget. Gua tahu persis topik mana yang harus diprioritaskan. Akhirnya berhasil dapat beasiswa LPDP!',n:'Sari M.',   r:'Awardee LPDP 2025' },
              { q:'Try out-nya mirip banget sama ujian aslinya. Pas ujian hari H ngerasa udah familiar sama format soalnya. Rekomended banget!',    n:'Dimas P.',  r:'Lolos Rekrutmen BUMN 2025' },
            ].map(({ q, n, r }, i) => (
              <div key={n} className="ch rv" data-d={String(i*100)} style={{ background: 'white', border: `1px solid ${C.line}`, borderRadius: 18, padding: 30, boxShadow: ss }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[0,1,2,3,4].map(j => <span key={j} style={{ color: '#F59E0B', fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: C.bodyText, fontStyle: 'italic', margin: '0 0 20px' }}>&ldquo;{q}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg,${C.blue100},${C.blue})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: C.blue }}>{n.charAt(0)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.inkText }}>{n}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="harga" className="sp" style={{ background: C.cream, padding: '100px 0' }}>
        <div style={W} className="ip">
          <div className="rv" style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', margin: '0 0 12px' }}>HARGA</p>
            <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: C.inkText, margin: 0 }}>Transparan, tanpa biaya tersembunyi</h2>
          </div>
          <div className="pg" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'start' }}>
            {/* Gratis */}
            <div className="ch rv" style={{ background: 'white', border: `1px solid ${C.line}`, borderRadius: 18, padding: 36, boxShadow: ss }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.inkText, margin: '0 0 6px' }}>Gratis</h3>
              <div style={{ fontSize: 34, fontWeight: 800, color: C.inkText, marginBottom: 4 }}>Rp0</div>
              <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px' }}>selamanya</p>
              <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Drill soal maks 10/hari','1× Try Out/bulan','Hasil skor basic'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 15, color: C.bodyText, alignItems: 'flex-start' }}>
                    <CheckCircle size={17} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="bh" style={{ display: 'block', textAlign: 'center', border: `1.5px solid ${C.line}`, color: C.bodyText, fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12 }}>Mulai Gratis</Link>
            </div>

            {/* Pro (featured) */}
            <div className="pfeat rv" style={{ background: `linear-gradient(180deg,${C.blue},${C.blue600})`, borderRadius: 18, padding: 36, boxShadow: sb, marginTop: -12, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: C.green, color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>PALING POPULER</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Pro</h3>
              <div style={{ fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 4 }}>Rp49.000</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 28px' }}>per bulan</p>
              <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Drill soal tanpa batas','Try Out tidak terbatas','Analisis AI personal','Dashboard progres lengkap','Pembahasan detail semua soal','Akses semua 12 topik'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'rgba(255,255,255,0.88)', alignItems: 'flex-start' }}>
                    <CheckCircle size={17} color={C.greenSoft} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="bh" style={{ display: 'block', textAlign: 'center', background: 'white', color: C.blue, fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 12 }}>Mulai Pro</Link>
            </div>

            {/* Pro Tahunan */}
            <div className="ch rv" data-d="100" style={{ background: 'white', border: `1px solid ${C.line}`, borderRadius: 18, padding: 36, boxShadow: ss, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -14, left: 24, background: C.green, color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', padding: '5px 14px', borderRadius: 100 }}>Hemat ~33%</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.inkText, margin: '0 0 6px' }}>Pro Tahunan</h3>
              <div style={{ fontSize: 34, fontWeight: 800, color: C.inkText, marginBottom: 4 }}>Rp399.000</div>
              <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px' }}>per tahun</p>
              <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Semua fitur Pro','Harga lebih hemat 33%','Prioritas fitur baru','Support lebih cepat'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 15, color: C.bodyText, alignItems: 'flex-start' }}>
                    <CheckCircle size={17} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="bh" style={{ display: 'block', textAlign: 'center', border: `1.5px solid ${C.line}`, color: C.bodyText, fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12 }}>Mulai Pro Tahunan</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA (dark) ── */}
      <section style={{ background: C.navy, position: 'relative' }}>
        <div style={{ position: 'relative', height: 70, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
            <path d="M0 0 L0 32 C360 76,1080 76,1440 32 L1440 0 Z" fill={C.cream} />
          </svg>
        </div>
        <div style={{ padding: '80px 0 100px', textAlign: 'center' }}>
          <div style={W} className="ip">
            <div className="rv">
              <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: C.onDark, margin: '0 0 16px' }}>Mulai persiapanmu hari ini</h2>
              <p style={{ fontSize: 18, color: C.onDarkSoft, margin: '0 0 36px' }}>Daftar gratis sekarang. Tidak butuh kartu kredit. Mulai latihan dalam hitungan menit.</p>
              <Link href="/register" className="bh ah" style={{ background: 'white', color: C.blue, fontWeight: 700, fontSize: 17, padding: '16px 36px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                Daftar Gratis Sekarang <ArrowRight size={18} />
              </Link>
              <p style={{ marginTop: 20, fontSize: 14, color: C.onDarkMute }}>Gabung bersama ribuan pejuang seleksi lainnya.</p>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', height: 70, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
            <path d="M0 70 L0 38 C360 -8,1080 -8,1440 38 L1440 70 Z" fill={C.ink} />
          </svg>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.ink, padding: '64px 0 40px' }}>
        <div style={W} className="ip">
          <div className="fg" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(150deg,#5B7BFF,#2C53EA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={18} color="white" />
                </div>
                <span style={{ fontSize: 17, fontWeight: 800, color: C.onDark }}>Belajar TPA</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: C.onDarkMute, maxWidth: 260, margin: 0 }}>Platform latihan TPA terlengkap untuk persiapan seleksi S2, beasiswa LPDP, BUMN, ASN, dan lebih banyak lagi.</p>
            </div>
            {[
              { title: 'Produk',     links: [['Modul Belajar','/belajar'],['Try Out','/tryout'],['Dashboard','/dashboard'],['Bookmark','/bookmark']] },
              { title: 'Persiapan', links: [['Seleksi S2','#'],['Beasiswa LPDP','#'],['Rekrutmen BUMN','#'],['CPNS / ASN','#']] },
              { title: 'Perusahaan',links: [['Tentang Kami','#'],['Blog','#'],['Kontak','#'],['Kebijakan Privasi','#']] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.onDark, letterSpacing: '0.08em', margin: '0 0 16px' }}>{title}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(([label, href]) => (
                    <li key={label}><Link href={href} style={{ fontSize: 14, color: C.onDarkMute }}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 24 }}>
            <p style={{ fontSize: 13, color: C.onDarkMute, margin: 0 }}>© 2026 Belajar TPA. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
