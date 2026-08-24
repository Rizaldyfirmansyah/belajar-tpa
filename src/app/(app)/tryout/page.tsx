'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Play, Eye, CheckCircle, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import type { TryoutSession } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { isPassing, getScoreColor } from '@/lib/scoring'
import { useTryoutStore } from '@/stores/tryout.store'

export default function TryoutListPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<TryoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const clearSession = useTryoutStore(s => s.clearSession)
  const initSession = useTryoutStore(s => s.initSession)

  useEffect(() => {
    fetch('/api/tryout/history')
      .then(r => r.json())
      .then(j => setSessions(j.data || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleStart() {
    setStarting(true)
    clearSession()

    const res = await fetch('/api/tryout/start', { method: 'POST' })
    const json = await res.json()

    if (json.error) {
      alert('Gagal memulai try out. Pastikan bank soal sudah terisi.')
      setStarting(false)
      return
    }

    const { sessionId, questions } = json.data
    initSession(sessionId, questions)
    router.push(`/tryout/${sessionId}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Try Out</h1>
          <p className="text-gray-500 text-sm mt-1">Simulasi ujian TPA — 250 soal, 180 menit</p>
        </div>
        <Button onClick={handleStart} loading={starting} size="lg">
          <Play size={18} />
          Mulai Try Out Baru
        </Button>
      </div>

      {/* Info card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Soal', value: '250' },
          { label: 'Durasi', value: '180 menit' },
          { label: 'Topik', value: '12 topik' },
          { label: 'Target Skor', value: '≥ 475' },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center py-4 px-3">
            <p className="text-xl font-bold font-heading text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* History */}
      <div>
        <h2 className="section-title mb-4">Riwayat Try Out</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="Belum ada try out"
              description="Mulai try out pertamamu sekarang!"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => {
              const passing = session.score_final ? isPassing(session.score_final) : false
              const isInProgress = session.status === 'in_progress'

              return (
                <Card key={session.id} padding={false}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">#{session.attempt_number}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          {isInProgress ? (
                            <Badge variant="warning">Sedang Berlangsung</Badge>
                          ) : passing ? (
                            <Badge variant="success">Lulus</Badge>
                          ) : (
                            <Badge variant="danger">Belum Lulus</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(session.started_at)}
                          {session.duration_seconds && ` · ${Math.round(session.duration_seconds / 60)} menit`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-8">
                      {session.score_final && (
                        <div className="text-center">
                          <p className={`text-2xl font-bold font-heading ${getScoreColor(session.score_final)}`}>
                            {session.score_final}
                          </p>
                          <p className="text-xs text-gray-400">Skor Final</p>
                        </div>
                      )}

                      {!isInProgress && session.score_verbal && (
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">{session.score_verbal}</p>
                            <p className="text-xs text-gray-400">Verbal</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-emerald-600">{session.score_numerik}</p>
                            <p className="text-xs text-gray-400">Numerik</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-violet-600">{session.score_penalaran}</p>
                            <p className="text-xs text-gray-400">Penalaran</p>
                          </div>
                        </div>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/tryout/${session.id}/hasil`)}
                        disabled={isInProgress}
                      >
                        <Eye size={14} />
                        Lihat Hasil
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
