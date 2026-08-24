'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Brain, Flame, ClipboardCheck, BookOpen, Target } from 'lucide-react'
import type { DashboardMetrics } from '@/types'
import { isPassing, getScoreColor } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import AILoadingCard from '@/components/shared/AILoadingCard'
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart'
import SubtestGauge from '@/components/dashboard/SubtestGauge'
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Pantau progress belajar TPA kamu</p>
      </div>

      {/* Row 1: Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Skor Terakhir</p>
              <p className={`text-2xl font-bold font-heading ${m.lastScore ? getScoreColor(m.lastScore) : 'text-gray-400'}`}>
                {m.lastScore ?? '—'}
              </p>
              {m.lastScoreDiff !== undefined && m.lastScoreDiff !== 0 && (
                <p className={`text-xs mt-0.5 ${m.lastScoreDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {m.lastScoreDiff > 0 ? '+' : ''}{m.lastScoreDiff} dari sesi sebelumnya
                </p>
              )}
            </div>
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target size={16} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Try Out</p>
              <p className="text-2xl font-bold font-heading text-gray-900">{m.totalSessions}</p>
              <p className="text-xs text-gray-400 mt-0.5">sesi selesai</p>
            </div>
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck size={16} className="text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Soal</p>
              <p className="text-2xl font-bold font-heading text-gray-900">{m.totalQuestions.toLocaleString('id-ID')}</p>
              <p className="text-xs text-gray-400 mt-0.5">drill + try out</p>
            </div>
            <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-violet-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Streak</p>
              <p className="text-2xl font-bold font-heading text-gray-900">{m.currentStreak}</p>
              <p className="text-xs text-gray-400 mt-0.5">hari berturut-turut</p>
            </div>
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Score trend */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-blue-600" />
          <h2 className="section-title">Tren Skor Try Out</h2>
        </div>
        {m.scoreTrend.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <TrendingUp size={36} className="mb-3 opacity-40" />
            <p className="text-sm">Belum ada data try out</p>
            <Button size="sm" className="mt-4" onClick={() => router.push('/tryout')}>
              Mulai Try Out
            </Button>
          </div>
        ) : (
          <ScoreTrendChart data={m.scoreTrend} />
        )}
      </Card>

      {/* Row 3: Subtest gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SubtestGauge
          label="Verbal"
          accuracy={m.subtestAccuracy.verbal}
          color="#3b82f6"
          subtest="verbal"
        />
        <SubtestGauge
          label="Numerik"
          accuracy={m.subtestAccuracy.numerik}
          color="#10b981"
          subtest="numerik"
        />
        <SubtestGauge
          label="Penalaran"
          accuracy={m.subtestAccuracy.penalaran}
          color="#8b5cf6"
          subtest="penalaran"
        />
      </div>

      {/* Row 4: Topic accuracy */}
      <Card>
        <h2 className="section-title mb-4">Akurasi Per Topik</h2>
        <TopicAccuracyChart data={m.topicAccuracy} />
      </Card>

      {/* Row 5: Speed chart */}
      <Card>
        <h2 className="section-title mb-4">Kecepatan Per Topik</h2>
        <SpeedChart data={m.topicSpeed} />
      </Card>

      {/* Row 6: AI Analysis */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-blue-600" />
          <h2 className="section-title">Analisis Menyeluruh AI</h2>
        </div>

        {!aiText && !aiLoading && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-4">
              Dapatkan analisis mendalam tentang progress dan rekomendasi belajar kamu.
            </p>
            <Button onClick={handleAiAnalysis} disabled={m.totalSessions === 0}>
              <Brain size={16} />
              {m.totalSessions === 0 ? 'Selesaikan try out dulu' : 'Analisis Menyeluruh'}
            </Button>
          </div>
        )}

        {aiLoading && <AILoadingCard />}

        {aiText && (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3">
            {aiText.split('\n\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => { setAiText(null); handleAiAnalysis() }}
            >
              Refresh analisis
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
