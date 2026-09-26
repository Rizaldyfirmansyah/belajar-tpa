import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight, ChevronRight, Mail, MessageCircle } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import { C, W, shadowSoft } from '@/lib/theme'
import { LEGAL_DOCS, LEGAL_UPDATED, CONTACT, getLegalDoc } from '@/lib/legal'

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getLegalDoc(params.slug)
  if (!doc) return {}
  return { title: `${doc.title} — Belajar TPA`, description: doc.description }
}

// Anchor id dari judul section, supaya daftar isi bisa melompat ke sana.
const anchorOf = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = getLegalDoc(params.slug)
  if (!doc) notFound()

  const others = LEGAL_DOCS.filter((other) => other.slug !== doc.slug)

  return (
    <div style={{ background: C.cream2, minHeight: '100vh' }}>
      <SiteHeader />

      <style dangerouslySetInnerHTML={{ __html: `
        .lg-toc a{transition:color .15s ease,border-color .15s ease}
        .lg-toc a:hover{color:${C.blue}!important;border-color:${C.blue}!important}
        .lg-card{transition:transform .2s ease,box-shadow .2s ease}
        .lg-card:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(13,20,48,.10)}
        .lg-crumb a:hover{color:${C.blue}}
        @media(max-width:980px){
          .lg-grid{grid-template-columns:1fr!important}
          .lg-toc{display:none!important}
        }
        @media(max-width:768px){
          .lg-wrap{padding:0 20px!important}
          .lg-body{padding:28px 22px!important}
          .lg-title{font-size:32px!important}
          .lg-others{grid-template-columns:1fr!important}
        }
      ` }} />

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(180deg,${C.ink},${C.navy})`,
        padding: '56px 0 92px',
      }}>
        <div style={{ ...W }} className="lg-wrap">
          <div
            className="lg-crumb"
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: C.onDarkMute, marginBottom: 20 }}
          >
            <Link href="/" style={{ color: C.onDarkMute, transition: 'color .15s' }}>Beranda</Link>
            <ChevronRight size={14} />
            <span style={{ color: C.onDarkSoft }}>{doc.title}</span>
          </div>

          <h1
            className="lg-title"
            style={{ fontSize: 42, fontWeight: 800, color: C.onDark, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            {doc.title}
          </h1>

          <p style={{ fontSize: 16.5, color: C.onDarkSoft, lineHeight: 1.7, margin: '16px 0 0', maxWidth: 640 }}>
            {doc.intro}
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24,
            padding: '7px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.navyLine}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenSoft }} />
            <span style={{ fontSize: 13, color: C.onDarkSoft }}>Terakhir diperbarui {LEGAL_UPDATED}</span>
          </div>
        </div>
      </section>

      {/* ── KONTEN ── */}
      <section style={{ ...W, marginTop: -56, paddingBottom: 80 }} className="lg-wrap">
        <div className="lg-grid" style={{ display: 'grid', gridTemplateColumns: '236px 1fr', gap: 32, alignItems: 'start' }}>
          {/* Daftar isi */}
          <nav
            className="lg-toc"
            style={{
              position: 'sticky', top: 100,
              background: 'white', border: `1px solid ${C.line}`, borderRadius: 16,
              padding: 20, boxShadow: shadowSoft,
            }}
          >
            <p style={{
              fontSize: 11.5, fontWeight: 700, color: C.muted, letterSpacing: '0.09em',
              textTransform: 'uppercase', margin: '0 0 14px',
            }}>
              Daftar Isi
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {doc.sections.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${anchorOf(section.heading)}`}
                    style={{
                      display: 'block', fontSize: 13.5, lineHeight: 1.5, color: C.bodyText,
                      padding: '7px 0 7px 14px', borderLeft: `2px solid ${C.line}`,
                    }}
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Isi dokumen */}
          <article
            className="lg-body"
            style={{
              background: 'white', border: `1px solid ${C.line}`, borderRadius: 18,
              padding: '40px 44px', boxShadow: shadowSoft,
            }}
          >
            {doc.sections.map((section, i) => (
              <section
                key={section.heading}
                id={anchorOf(section.heading)}
                style={{ scrollMarginTop: 100, marginTop: i === 0 ? 0 : 36 }}
              >
                <h2 style={{
                  fontSize: 19, fontWeight: 700, color: C.inkText, margin: 0,
                  letterSpacing: '-0.01em', lineHeight: 1.35,
                }}>
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} style={{ fontSize: 15.5, lineHeight: 1.8, color: C.bodyText, margin: '14px 0 0' }}>
                    {paragraph}
                  </p>
                ))}

                {section.list && (
                  <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {section.list.map((item) => (
                      <li key={item} style={{ display: 'flex', gap: 12, fontSize: 15.5, lineHeight: 1.75, color: C.bodyText }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%', background: C.blueSoft,
                          flexShrink: 0, marginTop: 10,
                        }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Kontak singkat di akhir dokumen */}
            <div style={{
              marginTop: 40, padding: 22, borderRadius: 14,
              background: C.cream, border: `1px solid ${C.line}`,
            }}>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: C.inkText, margin: 0 }}>
                Masih ada pertanyaan?
              </p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: C.bodyText, margin: '6px 0 14px' }}>
                Hubungi kami, biasanya dibalas dalam satu hari kerja.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <a
                  href={`mailto:${CONTACT.email}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px',
                    background: 'white', border: `1px solid ${C.line}`, borderRadius: 10,
                    fontSize: 14, fontWeight: 600, color: C.inkText,
                  }}
                >
                  <Mail size={15} color={C.blue} />
                  {CONTACT.email}
                </a>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px',
                    background: 'white', border: `1px solid ${C.line}`, borderRadius: 10,
                    fontSize: 14, fontWeight: 600, color: C.inkText,
                  }}
                >
                  <MessageCircle size={15} color={C.green} />
                  WhatsApp
                </a>
              </div>
            </div>
          </article>
        </div>

        {/* Dokumen lain */}
        <div style={{ marginTop: 48 }}>
          <p style={{
            fontSize: 11.5, fontWeight: 700, color: C.muted, letterSpacing: '0.09em',
            textTransform: 'uppercase', margin: '0 0 16px',
          }}>
            Dokumen Lain
          </p>
          <div className="lg-others" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/legal/${other.slug}`}
                className="lg-card"
                style={{
                  display: 'block', background: 'white', border: `1px solid ${C.line}`,
                  borderRadius: 14, padding: 20, boxShadow: shadowSoft,
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 700, color: C.inkText, margin: 0 }}>{other.title}</p>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: C.muted, margin: '6px 0 14px' }}>
                  {other.description}
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: C.blue }}>
                  Baca <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.ink, padding: '32px 0' }}>
        <div
          style={{ ...W, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}
          className="lg-wrap"
        >
          <p style={{ fontSize: 13, color: C.onDarkMute, margin: 0 }}>
            © 2026 Belajar TPA. Semua hak dilindungi.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {LEGAL_DOCS.map((other) => (
              <Link key={other.slug} href={`/legal/${other.slug}`} style={{ fontSize: 13, color: C.onDarkMute }}>
                {other.title}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
