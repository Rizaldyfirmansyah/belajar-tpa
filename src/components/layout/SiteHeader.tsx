'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, ChevronDown } from 'lucide-react'
import { C, W } from '@/lib/theme'
import { LEGAL_DOCS } from '@/lib/legal'

const NAV = [
  ['/#fitur', 'Fitur'],
  ['/#cara-kerja', 'Cara Kerja'],
  ['/#harga', 'Harga'],
] as const

/**
 * Header publik, dipakai landing page dan halaman legal.
 * Background selalu solid — versi sebelumnya transparan saat di puncak,
 * tapi yang ada di belakangnya background krem, bukan hero gelap, jadi
 * teksnya nyaris tidak terbaca. Saat di-scroll hanya bayangannya yang muncul.
 */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const linkColor = C.bodyText

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100, height: 76,
        background: 'rgba(247,246,242,0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.line}`,
        boxShadow: scrolled ? '0 4px 20px rgba(13,20,48,.07)' : 'none',
        transition: 'box-shadow .3s',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .sh-link{transition:color .2s ease}
        .sh-link:hover{color:${C.blue}!important}
        .sh-item{transition:background .15s ease}
        .sh-item:hover{background:${C.cream}}
        .sh-cta{transition:transform .2s ease,background .2s ease}
        .sh-cta:hover{transform:translateY(-2px);background:${C.blue600}}
        @media(max-width:860px){.sh-nav{display:none!important}}
        @media(max-width:768px){.sh-inner{padding:0 20px!important}.sh-login{display:none!important}}
      ` }} />

      <div
        className="sh-inner"
        style={{ ...W, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(150deg,#5B7BFF,#2C53EA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={21} color="white" />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, color: C.inkText }}>
            Belajar TPA
          </span>
        </Link>

        <nav className="sh-nav" style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="sh-link"
              style={{ fontSize: 15, fontWeight: 600, color: linkColor, transition: 'color .3s' }}
            >
              {label}
            </Link>
          ))}

          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="true"
              className="sh-link"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
                color: open ? C.blue : linkColor, transition: 'color .3s',
              }}
            >
              Tentang
              <ChevronDown
                size={15}
                style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}
              />
            </button>

            {open && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 14px)', left: '50%', transform: 'translateX(-50%)',
                  width: 268, padding: 8, background: 'white',
                  border: `1px solid ${C.line}`, borderRadius: 14,
                  boxShadow: '0 12px 34px rgba(13,20,48,.12), 0 2px 8px rgba(13,20,48,.06)',
                }}
              >
                {LEGAL_DOCS.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/legal/${doc.slug}`}
                    onClick={() => setOpen(false)}
                    className="sh-item"
                    style={{ display: 'block', padding: '10px 12px', borderRadius: 9 }}
                  >
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.inkText }}>
                      {doc.title}
                    </span>
                    <span style={{ display: 'block', fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 1.45 }}>
                      {doc.description}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          <Link
            href="/login"
            className="sh-link sh-login"
            style={{ fontSize: 15, fontWeight: 600, color: linkColor, transition: 'color .3s' }}
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="sh-cta"
            style={{
              background: C.blue, color: 'white', fontSize: 15, fontWeight: 600,
              padding: '9px 20px', borderRadius: 10, whiteSpace: 'nowrap',
            }}
          >
            Daftar Gratis
          </Link>
        </div>
      </div>
    </header>
  )
}
