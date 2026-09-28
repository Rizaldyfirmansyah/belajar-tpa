'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Flame, Target, ArrowRight } from 'lucide-react'
import type { DashboardMetrics } from '@/types'

function salutation(hour: number) {
  if (hour >= 4 && hour < 11) return 'Selamat pagi'
  if (hour >= 11 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

/** Sisa hari menuju tes, dihitung pada batas tanggal (bukan selisih jam). */
function daysUntil(dateISO: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateISO + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function countdownText(days: number) {
  if (days < 0) return null
  if (days === 0) return 'Tesmu hari ini. Semoga lancar.'
  if (days === 1) return 'Besok tesmu. Malam ini istirahat cukup, ya.'
  if (days <= 13) return `${days} hari lagi tes.`
  if (days <= 60) return `${Math.round(days / 7)} minggu lagi tes.`
  return `${Math.round(days / 30)} bulan lagi tes.`
}

/**
 * Baris kedua dipilih berdasarkan konteks, bukan acak murni — supaya
 * pesannya selalu relevan. Variasi acak hanya dipakai saat tidak ada
 * konteks khusus, biar tidak terasa membosankan kalau dibuka tiap hari.
 */
function subline(m: DashboardMetrics, days: number | null): string {
  if (days !== null) {
    const text = countdownText(days)
    if (text && days <= 30) return text
  }
  if (m.totalSessions === 0) return 'Belum ada try out. Coba satu dulu buat tahu posisi skormu.'
  if (m.currentStreak >= 3) return `Streak ${m.currentStreak} hari. Sayang kalau putus hari ini.`
  if (m.lastScore && m.lastScore >= m.targetScore) {
    return `Skor terakhirmu ${m.lastScore}, sudah lewat target. Naikkan targetnya?`
  }
  if (m.lastScore) {
    const gap = m.targetScore - m.lastScore
    return `Tinggal ${gap} poin lagi menuju target ${m.targetScore}.`
  }
  const pool = [
    'Mau belajar apa hari ini?',
    'Siap latihan sebentar?',
    'Lanjut dari yang kemarin, yuk.',
    'Satu sesi singkat hari ini sudah cukup.',
  ]
  return pool[new Date().getDate() % pool.length]
}

export default function DashboardGreeting({ metrics }: { metrics: DashboardMetrics }) {
  // Jam diambil dari perangkat user. Dihitung setelah mount supaya tidak
  // bentrok dengan hasil render server (zona waktunya bisa beda).
  const [hour, setHour] = useState<number | null>(null)
  useEffect(() => setHour(new Date().getHours()), [])

  const days = metrics.testDate ? daysUntil(metrics.testDate) : null
  const firstName = metrics.userName.split(' ')[0]
  const urgent = days !== null && days >= 0 && days <= 7

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-heading font-bold text-ink">
          {hour === null ? `Halo, ${firstName}` : `${salutation(hour)}, ${firstName}`}
        </h1>
        <p className="text-body mt-1.5">{subline(metrics, days)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {days !== null && days >= 0 && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold border ${
              urgent
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-surface border-line text-body'
            }`}
          >
            <CalendarDays size={13} />
            {days === 0 ? 'Tes hari ini' : `H-${days}`}
          </span>
        )}

        {metrics.currentStreak > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold bg-surface border border-line text-body">
            <Flame size={13} className="text-amber-500" />
            {metrics.currentStreak} hari
          </span>
        )}

        <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold bg-surface border border-line text-body">
          <Target size={13} className="text-blue-600" />
          Target {metrics.targetScore}
        </span>

        {metrics.testDate === null && (
          <Link
            href="/onboarding?edit=1"
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold border border-dashed border-line text-muted hover:text-blue-700 hover:border-blue-300 transition-colors"
          >
            Atur tanggal tes <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </div>
  )
}
