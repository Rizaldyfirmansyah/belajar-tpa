'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Flame, ArrowRight, BookOpen, Sparkles } from 'lucide-react'
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
  if (days === 0) return 'Tesmu hari ini. Semoga lancar.'
  if (days === 1) return 'Besok tesmu. Malam ini istirahat cukup, ya.'
  if (days <= 13) return `${days} hari lagi tes.`
  if (days <= 60) return `${Math.round(days / 7)} minggu lagi tes.`
  return `${Math.round(days / 30)} bulan lagi tes.`
}

/**
 * Baris kedua dipilih berdasarkan konteks, bukan acak murni — supaya
 * pesannya selalu relevan. Variasi acak hanya dipakai saat tidak ada
 * konteks khusus, biar tidak membosankan kalau dibuka tiap hari.
 */
function subline(m: DashboardMetrics, days: number | null): string {
  if (days !== null && days >= 0 && days <= 30) return countdownText(days)
  if (m.totalSessions === 0) return 'Belum ada try out. Coba satu dulu buat tahu posisi skormu.'
  if (m.currentStreak >= 3) return `Streak ${m.currentStreak} hari. Sayang kalau putus hari ini.`
  if (m.lastScore && m.lastScore >= m.targetScore) {
    return `Skor terakhirmu ${m.lastScore}, sudah lewat target. Naikkan targetnya?`
  }
  if (m.lastScore) return `Tinggal ${m.targetScore - m.lastScore} poin lagi menuju target.`
  const pool = [
    'Mau belajar apa hari ini?',
    'Siap latihan sebentar?',
    'Lanjut dari yang kemarin, yuk.',
    'Satu sesi singkat hari ini sudah cukup.',
  ]
  return pool[new Date().getDate() % pool.length]
}

/** Cincin progres skor terakhir terhadap target. */
function ScoreRing({ score, target }: { score?: number; target: number }) {
  const pct = score ? Math.min(score / target, 1) : 0
  const r = 52
  const circumference = 2 * Math.PI * r
  return (
    <div className="relative w-[136px] h-[136px] flex-shrink-0">
      <svg viewBox="0 0 136 136" className="w-full h-full -rotate-90">
        <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="11" />
        <circle
          cx="68" cy="68" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5B7BFF" />
            <stop offset="100%" stopColor="#4FE0A0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] leading-none font-heading font-bold text-white">
          {score ?? '—'}
        </span>
        <span className="text-[11px] text-white/55 mt-1.5">dari {target}</span>
      </div>
    </div>
  )
}

export default function DashboardHero({ metrics: m }: { metrics: DashboardMetrics }) {
  // Jam diambil dari perangkat user, dihitung setelah mount supaya tidak
  // bentrok dengan render server yang zona waktunya bisa berbeda.
  const [hour, setHour] = useState<number | null>(null)
  useEffect(() => setHour(new Date().getHours()), [])

  const days = m.testDate ? daysUntil(m.testDate) : null
  const firstName = m.userName.split(' ')[0]
  const urgent = days !== null && days >= 0 && days <= 7

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8 sm:py-8"
      style={{ background: 'linear-gradient(135deg,#0D1430 0%,#111B40 55%,#0A0F20 100%)' }}
    >
      {/* Glow dekoratif — sama bahasa visualnya dengan hero landing page */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-24 -right-16 w-[380px] h-[380px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(44,83,234,.45) 0%,transparent 65%)' }}
        />
        <div
          className="absolute -bottom-28 left-1/3 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(24,189,115,.22) 0%,transparent 65%)' }}
        />
        {[[8, 22], [22, 68], [40, 18], [58, 80], [73, 35], [88, 62], [95, 20]].map(([x, y], i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/50"
            style={{ left: `${x}%`, top: `${y}%`, width: i % 2 ? 2 : 3, height: i % 2 ? 2 : 3 }}
          />
        ))}
      </div>

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-7">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {days !== null && days >= 0 && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-semibold ${
                  urgent ? 'bg-amber-400 text-amber-950' : 'bg-white/10 text-white/80 border border-white/15'
                }`}
              >
                <CalendarDays size={12} />
                {days === 0 ? 'Tes hari ini' : `H-${days}`}
              </span>
            )}
            {m.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/15">
                <Flame size={12} className="text-amber-400" />
                {m.currentStreak} hari
              </span>
            )}
            {m.testDate === null && (
              <Link
                href="/onboarding?edit=1"
                className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-semibold border border-dashed border-white/25 text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                Atur tanggal tes <ArrowRight size={11} />
              </Link>
            )}
          </div>

          <h1 className="text-[26px] sm:text-[32px] leading-tight font-heading font-bold text-white">
            {hour === null ? `Halo, ${firstName}` : `${salutation(hour)}, ${firstName}`}
          </h1>
          <p className="text-white/65 mt-2 text-[15px] leading-relaxed max-w-md">
            {subline(m, days)}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-6">
            <Link
              href="/tryout"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-ink text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              <Sparkles size={16} className="text-blue-600" />
              Mulai Try Out
            </Link>
            <Link
              href="/belajar"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              <BookOpen size={16} />
              Latihan Soal
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-5 lg:flex-col lg:items-end">
          <ScoreRing score={m.lastScore} target={m.targetScore} />
          <div className="lg:text-right">
            <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
              Skor Terakhir
            </p>
            {m.lastScoreDiff !== undefined && m.lastScoreDiff !== 0 ? (
              <p
                className={`text-sm font-semibold mt-1 ${
                  m.lastScoreDiff > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {m.lastScoreDiff > 0 ? '+' : ''}
                {m.lastScoreDiff} dari sesi lalu
              </p>
            ) : (
              <p className="text-sm text-white/50 mt-1">
                {m.totalSessions === 0 ? 'Belum ada try out' : 'Sesi pertama'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
