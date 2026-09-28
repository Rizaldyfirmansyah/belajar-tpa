'use client'

import type { Subtest } from '@/types'

const SUBTESTS: { key: Subtest; label: string; color: string; soft: string }[] = [
  { key: 'verbal',    label: 'Verbal',    color: '#3b82f6', soft: 'bg-blue-50' },
  { key: 'numerik',   label: 'Numerik',   color: '#10b981', soft: 'bg-emerald-50' },
  { key: 'penalaran', label: 'Penalaran', color: '#8b5cf6', soft: 'bg-violet-50' },
]

function strength(accuracy: number) {
  if (accuracy >= 0.7) return { label: 'Kuat', className: 'text-emerald-600 bg-emerald-50' }
  if (accuracy >= 0.5) return { label: 'Cukup', className: 'text-amber-600 bg-amber-50' }
  return { label: 'Perlu latihan', className: 'text-red-600 bg-red-50' }
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="relative w-[68px] h-[68px] flex-shrink-0">
      <svg viewBox="0 0 68 68" className="w-full h-full -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#EFECE4" strokeWidth="7" />
        <circle
          cx="34" cy="34" r={r} fill="none"
          stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-heading font-bold text-ink">
        {pct}%
      </span>
    </div>
  )
}

export default function SubtestBreakdown({
  accuracy,
}: {
  accuracy: Record<Subtest, number>
}) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-heading font-bold text-ink">Kekuatan per Kemampuan</h2>
      <p className="text-xs text-muted mt-1">Akurasi jawaban benar</p>

      <div className="mt-5 space-y-4">
        {SUBTESTS.map(({ key, label, color }) => {
          const pct = Math.round((accuracy[key] ?? 0) * 100)
          const s = strength(accuracy[key] ?? 0)
          return (
            <div key={key} className="flex items-center gap-4">
              <Ring pct={pct} color={color} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{label}</p>
                <span
                  className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.className}`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
