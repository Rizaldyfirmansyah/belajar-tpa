import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { LEGAL_DOCS, LEGAL_UPDATED, getLegalDoc } from '@/lib/legal'

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getLegalDoc(params.slug)
  if (!doc) return {}
  return { title: `${doc.title} — Belajar TPA`, description: doc.description }
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = getLegalDoc(params.slug)
  if (!doc) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={16} />
          Kembali ke beranda
        </Link>

        <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-heading font-bold text-gray-900">{doc.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Terakhir diperbarui: {LEGAL_UPDATED}</p>
          <p className="text-gray-700 leading-relaxed mt-6">{doc.intro}</p>

          {doc.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-base font-heading font-semibold text-gray-900">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-gray-700 leading-relaxed mt-3">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-3 space-y-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 text-gray-700 leading-relaxed">
                      <span className="text-gray-400 select-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
          {LEGAL_DOCS.filter((other) => other.slug !== doc.slug).map((other) => (
            <Link
              key={other.slug}
              href={`/legal/${other.slug}`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {other.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
