'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Settings } from 'lucide-react'
import { getTopicConfig } from '@/lib/constants'
import type { Question, Topic } from '@/types'
import QuestionCard from '@/components/question/QuestionCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { BookOpen } from 'lucide-react'

export default function DrillPage() {
  const params = useParams()
  const router = useRouter()
  const topic = params.topic as Topic
  const topicConfig = getTopicConfig(topic)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [configOpen, setConfigOpen] = useState(false)
  const [limit, setLimit] = useState(10)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const answeredQuestionIds = useRef<Set<string>>(new Set())

  const subtestVariant = topicConfig?.subtest as 'verbal' | 'numerik' | 'penalaran'

  const fetchQuestions = useCallback(async (count: number) => {
    setLoading(true)
    setAnswers({})
    setCurrentIndex(0)
    answeredQuestionIds.current = new Set()

    const excludeIds = Array.from(answeredQuestionIds.current).join(',')
    const res = await fetch(`/api/drill/questions?topic=${topic}&limit=${count}&exclude=${excludeIds}`)
    const json = await res.json()
    setQuestions(json.data || [])
    setStartTime(Date.now())
    setLoading(false)
  }, [topic])

  useEffect(() => {
    fetchQuestions(limit)
  }, [])

  async function handleAnswer(questionId: string, answer: string) {
    if (answers[questionId]) return

    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    setStartTime(Date.now())

    await fetch('/api/drill/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer, timeSpentSec: timeSpent }),
    })
  }

  async function handleBookmark(questionId: string) {
    const isBookmarked = bookmarks.has(questionId)
    if (isBookmarked) {
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

  const currentQuestion = questions[currentIndex]
  const answered = currentQuestion ? !!answers[currentQuestion.id] : false
  const totalAnswered = Object.keys(answers).length

  if (!topicConfig) {
    return <div className="text-red-500">Topik tidak ditemukan</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={<BookOpen size={28} />}
          title="Soal belum tersedia"
          description="Bank soal untuk topik ini belum ada. Jalankan seed script terlebih dahulu."
          action={{ label: 'Kembali', onClick: () => router.back() }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/belajar')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div className="flex items-center gap-2">
          <Badge variant={subtestVariant}>{topicConfig.label}</Badge>
          <button
            onClick={() => setConfigOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress sesi ini</span>
          <span>{totalAnswered}/{questions.length} dijawab</span>
        </div>
        <ProgressBar
          value={totalAnswered}
          max={questions.length}
          color={subtestVariant === 'verbal' ? 'blue' : subtestVariant === 'numerik' ? 'emerald' : 'violet'}
        />
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        selectedAnswer={answers[currentQuestion.id]}
        showExplanation={!!answers[currentQuestion.id]}
        isBookmarked={bookmarks.has(currentQuestion.id)}
        isTryoutMode={false}
        onAnswer={handleAnswer}
        onBookmark={handleBookmark}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={16} />
          Sebelumnya
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentIndex(i => i + 1)}>
            Berikutnya
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => fetchQuestions(limit)}
          >
            Sesi Baru
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-1.5 justify-center pb-4">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
              i === currentIndex
                ? 'bg-blue-600 text-white'
                : answers[q.id]
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Config Modal */}
      <Modal open={configOpen} onClose={() => setConfigOpen(false)} title="Pengaturan Sesi">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Jumlah soal</p>
            <div className="flex gap-2">
              {[10, 20, 30].map(n => (
                <button
                  key={n}
                  onClick={() => setLimit(n)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    limit === n ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {n} soal
                </button>
              ))}
            </div>
          </div>
          <Button
            fullWidth
            onClick={() => {
              setConfigOpen(false)
              fetchQuestions(limit)
            }}
          >
            Mulai Sesi Baru
          </Button>
        </div>
      </Modal>
    </div>
  )
}
