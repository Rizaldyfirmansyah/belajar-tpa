'use client'

import type { LucideIcon } from 'lucide-react'

type Tone = 'blue' | 'emerald' | 'violet' | 'amber'

const TONES: Record<Tone, { chip: string; icon: string; bar: string }> = {
  blue:    { chip: 'bg-blue-50',    icon: 'text-blue-600',    bar: 'bg-blue-500' },
  emerald: { chip: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500' },
  violet:  { chip: 'bg-violet-50',  icon: 'text-violet-600',  bar: 'bg-violet-500' },
  amber:   { chip: 'bg-amber-50',   icon: 'text-amber-600',   bar: 'bg-amber-500' },
}

export default function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  note?: string
  icon: LucideIcon
  tone: Tone
}) {
  const t = TONES[tone]
  return (
    <div className="card p-4 relative overflow-hidden group">
      {/* Aksen tipis di tepi kiri — pembeda antar kartu tanpa menambah bising */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${t.bar} opacity-60`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-2xl font-heading font-bold text-ink mt-1 leading-none">{value}</p>
          {note && <p className="text-[11px] text-muted mt-1.5">{note}</p>}
        </div>
        <div
          className={`w-9 h-9 rounded-xl ${t.chip} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
        >
          <Icon size={16} className={t.icon} />
        </div>
      </div>
    </div>
  )
}
