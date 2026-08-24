'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, RotateCcw, LayoutDashboard, Bookmark, BookmarkCheck, Brain } from 'lucide-react'
import type { TryoutSession, TryoutAnswer, Question, Topic } from '@/types'
import { isPassing, getScoreColor, getAccuracyBgColor } from '@/lib/scoring'
import { TOPICS, getTopicConfig } from '@/lib/constants'
import { formatDateTime, cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import AILoadingCard from '@/components/shared/AILoadingCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ExplanationBox from '@/components/question/ExplanationBox'
import OptionButton from '@/components/question/OptionButton'
import VisualQuestion from '@/components/visual/VisualQuestion'

type AnswerWithQuestion = TryoutAnswer & { questions: Question }
type ReviewFilter = 'all' | 'wrong' | 'correct' | string

export default function HasilPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<TryoutSession | null>(null)
  const [answers, setAnswers] = useState<AnswerWithQuestion[]>([])
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [expandedReview, setExpandedReview] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/tryout/${sessionId}/result`)
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          setSession(j.data.session)
          setAnswers(j.data.answers || [])
        }
      })
      .finally(() => setLoading(false))

    // Fetch bookmarks
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(j => {
        const ids: string[] = (j.data || []).map((b: { question_id: string }) => b.question_id)
        setBookmarks(new Set(ids))
      })
  }, [sessionId])

  async function handleBookmark(questionId: string) {
    if (bookmarks.has(questionId)) {
      setBookmarks(prev => { const s = new Set(prev); s.delete(questionId); return s })
      await fetch(`/api/bookmarks?questionId=${questionId}`, { method: 'DELETE' })
    } else {
      setBookmarks(prev => new Set(Array.from(prev).concat(questionId)))
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-20 text-gray-500">Hasil tidak ditemukan.</div>
    )
  }

  const passing = session.score_final ? isPassing(session.score_final) : false
  const scoreColor = session.score_final ? getScoreColor(session.score_final) : ''

  const topicBreakdown = TOPICS.map(t => {
    const acc = (session.topic_accuracy as Record<string, number>)?.[t.id] ?? 0
    const score = (session.topic_scores as Record<string, number>)?.[t.id] ?? 0
    const topicAnswers = answers.filter(a => a.topic === t.id)
    const correct = topicAnswers.filter(a => a.is_correct).length
    return { ...t, accuracy: acc, score, correct, total: topicAnswers.length }
  }).filter(t => t.total > 0)

  const filteredAnswers = answers.filter(a => {
    if (filter === 'all') return true
    if (filter === 'wrong') return !a.is_correct && a.user_answer
    if (filter === 'correct') return a.is_correct
    return a.topic === filter
  })

  const subtestData = [
    { label: 'Verbal', score: session.score_verbal, color: 'text-blue-600', bg: 'bg-blue-500' },
    { label: 'Numerik', score: session.score_numerik, color: 'text-emerald-600', bg: 'bg-emerald-500' },
    { label: 'Penalaran', score: session.score_penalaran, color: 'text-violet-600', bg: 'bg-violet-500' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Section 1: Main score */}
      <Card>
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            {passing ? (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full">
                <CheckCircle size={18} />
                <span className="font-semibold text-sm">Lulus</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full">
                <XCircle size={18} />
                <span className="font-semibold text-sm">Belum Lulus</span>
              </div>
            )}
          </div>

          <p className={`text-7xl font-bold font-heading mb-1 ${scoreColor}`}>
            {session.score_final}
          </p>
          <p className="text-gray-400 text-sm">Try Out ke-{session.attempt_number} · Target: 475</p>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            {subtestData.map(({ label, score, color, bg }) => (
              <div key={label}>
                <p className={`text-2xl font-bold font-heading ${color}`}>{score ?? '—'}</p>
                <div className="mt-1.5 mb-1">
                  <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${bg} rounded-full`}
                      style={{ width: `${(((score ?? 200) - 200) / 600) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 2: Topic breakdown */}
      <Card>
        <h2 className="section-title mb-4">Breakdown Per Topik</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Topik</th>
                <th className="text-center py-2 text-gray-500 font-medium">Benar/Total</th>
                <th className="text-center py-2 text-gray-500 font-medium">Akurasi</th>
                <th className="text-center py-2 text-gray-500 font-medium">Skor</th>
              </tr>
            </thead>
            <tbody>
              {topicBreakdown.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{t.label}</span>
                      <Badge variant={t.subtest}>{t.subtest}</Badge>
                    </div>
                  </td>
                  <td className="text-center py-2.5 text-gray-600">
                    {t.correct}/{t.total}
                  </td>
                  <td className="text-center py-2.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getAccuracyBgColor(t.accuracy))}>
                      {Math.round(t.accuracy * 100)}%
                    </span>
                  </td>
                  <td className="text-center py-2.5 font-semibold text-gray-700">{t.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 3: AI Summary */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-blue-600" />
          <h2 className="section-title">Analisis AI</h2>
        </div>
        {session.ai_summary ? (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3">
            {session.ai_summary.split('\n\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <AILoadingCard />
        )}
      </Card>

      {/* Section 4: Question review */}
      <div>
        <h2 className="section-title mb-4">Review Soal</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'wrong', label: 'Salah' },
            { key: 'correct', label: 'Benar' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {label}
            </button>
          ))}
          <div className="w-px bg-gray-200" />
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filter === t.id ? 'bg-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredAnswers.map(a => {
            const q = a.questions
            if (!q) return null
            const isExpanded = expandedReview.has(a.question_id)
            const isCorrect = !!a.is_correct

            return (
              <Card key={a.question_id} padding={false}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCorrect ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : a.user_answer ? (
                        <XCircle size={18} className="text-red-500" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant={q.subtest as 'verbal' | 'numerik' | 'penalaran'}>
                          {getTopicConfig(q.topic)?.label}
                        </Badge>
                        {!a.user_answer && (
                          <Badge variant="gray">Tidak dijawab</Badge>
                        )}
                      </div>

                      {q.question_type === 'text' ? (
                        <p className="text-sm text-gray-700 line-clamp-2">{q.question}</p>
                      ) : (
                        <p className="text-sm text-gray-700">{q.visual_data?.question}</p>
                      )}

                      <button
                        onClick={() => {
                          setExpandedReview(prev => {
                            const s = new Set(prev)
                            if (s.has(a.question_id)) s.delete(a.question_id)
                            else s.add(a.question_id)
                            return s
                          })
                        }}
                        className="text-xs text-blue-600 hover:underline mt-1.5"
                      >
                        {isExpanded ? 'Sembunyikan' : 'Lihat detail'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookmark(q.id)}
                      className="text-gray-400 hover:text-amber-500 transition-colors flex-shrink-0"
                    >
                      {bookmarks.has(q.id)
                        ? <BookmarkCheck size={18} className="text-amber-500" />
                        : <Bookmark size={18} />
                      }
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {q.question_type === 'visual' && q.visual_data ? (
                        <VisualQuestion
                          visualData={q.visual_data}
                          selectedAnswer={a.user_answer || undefined}
                          correctAnswer={q.answer || undefined}
                          showAnswer={true}
                          disabled={true}
                        />
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-800 leading-relaxed mb-3">{q.question}</p>
                          {(['A', 'B', 'C', 'D', 'E'] as const).map(opt => {
                            if (!q.options?.[opt]) return null
                            return (
                              <OptionButton
                                key={opt}
                                label={opt}
                                text={q.options[opt]}
                                selected={false}
                                correct={opt === q.answer}
                                wrong={opt === a.user_answer && opt !== q.answer}
                                disabled
                              />
                            )
                          })}
                        </div>
                      )}

                      {(q.explanation || q.visual_data?.explanation) && (
                        <ExplanationBox
                          explanation={(q.explanation || q.visual_data?.explanation) ?? ''}
                          isCorrect={isCorrect}
                          correctAnswer={q.answer || ''}
                        />
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}

          {filteredAnswers.length === 0 && (
            <Card>
              <p className="text-center text-sm text-gray-400 py-8">Tidak ada soal dengan filter ini.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => router.push('/dashboard')}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Button>
        <Button
          fullWidth
          onClick={() => router.push('/tryout')}
        >
          <RotateCcw size={16} />
          Coba Lagi
        </Button>
      </div>
    </div>
  )
}
