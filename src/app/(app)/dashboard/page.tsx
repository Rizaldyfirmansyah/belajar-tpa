'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Brain, Flame, ClipboardCheck, BookOpen, Target, Clock } from 'lucide-react'
import type { DashboardMetrics } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import AILoadingCard from '@/components/shared/AILoadingCard'
import DashboardHero from '@/components/dashboard/DashboardHero'
import StatCard from '@/components/dashboard/StatCard'
import SubtestBreakdown from '@/components/dashboard/SubtestBreakdown'
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart'
import TopicAccuracyChart from '@/components/dashboard/TopicAccuracyChart'
import SpeedChart from '@/components/dashboard/SpeedChart'

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then(r => r.json())
      .then(j => setMetrics(j.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleAiAnalysis() {
    if (aiText) return
    setAiLoading(true)
    const res = await fetch('/api/analytics/ai-analysis')
    const json = await res.json()
    setAiText(json.data?.text || null)
    setAiLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const m = metrics!

  return (
    <div className="space-y-5 animate-fade-in">
      <DashboardHero metrics={m} />

      {/* Statistik ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Try Out"
          value={m.totalSessions}
          note="sesi selesai"
          icon={ClipboardCheck}
          tone="emerald"
        />
        <StatCard
          label="Total Soal"
          value={m.totalQuestions.toLocaleString('id-ID')}
          note="drill + try out"
          icon={BookOpen}
          tone="violet"
        />
        <StatCard
          label="Streak"
          value={m.currentStreak}
          note="hari berturut-turut"
          icon={Flame}
          tone="amber"
        />
        <StatCard
          label="Target Skor"
          value={m.targetScore}
          note={m.lastScore ? `selisih ${Math.max(m.targetScore - m.lastScore, 0)} poin` : 'belum diuji'}
          icon={Target}
          tone="blue"
        />
      </div>

      {/* Kolom utama + side rail: bobotnya sengaja dibedakan supaya
          halaman tidak terbaca sebagai deretan kotak seragam. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-600" />
              <h2 className="section-title">Tren Skor Try Out</h2>
            </div>
            {m.scoreTrend.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <TrendingUp size={24} className="text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-ink">Grafik terisi setelah try out pertama</p>
                <p className="text-xs text-muted mt-1 max-w-xs">
                  Satu sesi penuh sudah cukup untuk tahu posisi skormu sekarang.
                </p>
                <Button size="sm" className="mt-4" onClick={() => router.push('/tryout')}>
                  Mulai Try Out
                </Button>
              </div>
            ) : (
              <ScoreTrendChart data={m.scoreTrend} />
            )}
          </Card>

          <Card>
            <h2 className="section-title mb-4">Akurasi Per Topik</h2>
            <TopicAccuracyChart data={m.topicAccuracy} />
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-violet-600" />
              <h2 className="section-title">Kecepatan Per Topik</h2>
            </div>
            <SpeedChart data={m.topicSpeed} />
          </Card>
        </div>

        <div className="space-y-5">
          <SubtestBreakdown accuracy={m.subtestAccuracy} />

          {/* Analisis AI */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Brain size={16} className="text-violet-600" />
              </div>
              <h2 className="text-sm font-heading font-bold text-ink">Analisis AI</h2>
            </div>

            {!aiText && !aiLoading && (
              <>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Ringkasan mendalam soal progres dan topik mana yang sebaiknya kamu dahulukan.
                </p>
                <Button
                  onClick={handleAiAnalysis}
                  disabled={m.totalSessions === 0}
                  size="sm"
                  fullWidth
                  className="mt-4"
                >
                  {m.totalSessions === 0 ? 'Selesaikan try out dulu' : 'Analisis Sekarang'}
                </Button>
              </>
            )}

            {aiLoading && <div className="mt-3"><AILoadingCard /></div>}

            {aiText && (
              <div className="text-sm text-body leading-relaxed space-y-3 mt-3">
                {aiText.split('\n\n').filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setAiText(null); handleAiAnalysis() }}
                >
                  Analisis ulang
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
