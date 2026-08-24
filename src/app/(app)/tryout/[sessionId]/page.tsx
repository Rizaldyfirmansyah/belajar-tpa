'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { useTryoutStore } from '@/stores/tryout.store'
import { TRYOUT_TOPIC_ORDER, TOPICS } from '@/lib/constants'
import Timer from '@/components/tryout/Timer'
import QuestionNav from '@/components/tryout/QuestionNav'
import SubtestTransition from '@/components/tryout/SubtestTransition'
import QuestionCard from '@/components/question/QuestionCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { useState } from 'react'

export default function TryoutSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [completing, setCompleting] = useState(false)

  const {
    questions,
    currentTopicIndex,
    currentQuestionIndex,
    answers,
    timeRemaining,
    status,
    nextTopicName,
    setAnswer,
    setTimeRemaining,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    completeTopic,
    startNextTopic,
    completeSession,
  } = useTryoutStore()

  const topicId = TRYOUT_TOPIC_ORDER[currentTopicIndex]
  const topicConfig = TOPICS.find(t => t.id === topicId)
  const topicQuestions = questions[topicId] || []
  const currentQuestion = topicQuestions[currentQuestionIndex]

  const answeredIds = new Set(
    topicQuestions.filter(q => answers[q.id]).map(q => q.id)
  )

  const subtestVariant = topicConfig?.subtest as 'verbal' | 'numerik' | 'penalaran' | undefined

  const isLastTopic = currentTopicIndex >= TRYOUT_TOPIC_ORDER.length - 1

  useEffect(() => {
    // Redirect if no session loaded
    if (!questions || Object.keys(questions).length === 0) {
      router.replace('/tryout')
    }
  }, [questions, router])

  const handleTimerExpire = useCallback(() => {
    completeTopic()
  }, [completeTopic])

  const handleTimerTick = useCallback((time: number) => {
    setTimeRemaining(time)
  }, [setTimeRemaining])

  async function handleAnswer(questionId: string, answer: string) {
    setAnswer(questionId, answer)
    await fetch(`/api/tryout/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer, timeSpentSec: 0 }),
    })
  }

  async function handleCompleteSession() {
    setCompleting(true)
    await fetch(`/api/tryout/${sessionId}/complete`, { method: 'POST' })
    completeSession()
    router.push(`/tryout/${sessionId}/hasil`)
  }

  async function handleContinueAfterTransition() {
    if (isLastTopic && status === 'transitioning') {
      await handleCompleteSession()
      return
    }
    startNextTopic()
  }

  if (status === 'completed') {
    router.push(`/tryout/${sessionId}/hasil`)
    return null
  }

  if (status === 'transitioning') {
    return (
      <SubtestTransition
        nextTopicName={nextTopicName}
        onContinue={handleContinueAfterTransition}
        isLastTopic={isLastTopic}
      />
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        Memuat soal...
      </div>
    )
  }

  const totalTopics = TRYOUT_TOPIC_ORDER.length
  const overallProgress = ((currentTopicIndex * 100 + ((currentQuestionIndex + 1) / topicQuestions.length) * 100) / totalTopics).toFixed(0)

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Header bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 sticky top-16 lg:top-2 z-20 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {topicConfig && subtestVariant && (
            <Badge variant={subtestVariant}>{topicConfig.label}</Badge>
          )}
          <span className="text-xs text-gray-500 hidden sm:block">
            Topik {currentTopicIndex + 1}/{TRYOUT_TOPIC_ORDER.length}
          </span>
        </div>

        <Timer
          timeRemaining={timeRemaining}
          onTick={handleTimerTick}
          onExpire={handleTimerExpire}
        />

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setConfirmComplete(true)}
        >
          Selesaikan Topik
        </Button>
      </div>

      {/* Progress strip */}
      <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={topicQuestions.length}
        selectedAnswer={answers[currentQuestion.id]}
        showExplanation={false}
        isTryoutMode={true}
        onAnswer={handleAnswer}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft size={16} />
          Prev
        </Button>

        <div className="flex-1 mx-4 overflow-x-auto scrollbar-thin">
          <QuestionNav
            total={topicQuestions.length}
            currentIndex={currentQuestionIndex}
            answeredIds={answeredIds}
            questionIds={topicQuestions.map(q => q.id)}
            onNavigate={goToQuestion}
          />
        </div>

        <Button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === topicQuestions.length - 1}
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Confirm modal */}
      <Modal
        open={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        title="Selesaikan Topik?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Perhatian</p>
              <p>
                Kamu baru menjawab{' '}
                <span className="font-bold">{answeredIds.size}/{topicQuestions.length}</span> soal pada topik ini.
                Soal yang belum dijawab tidak akan dinilai.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setConfirmComplete(false)}
            >
              Kembali
            </Button>
            <Button
              fullWidth
              loading={completing}
              onClick={async () => {
                setConfirmComplete(false)
                completeTopic()
              }}
            >
              Selesaikan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
