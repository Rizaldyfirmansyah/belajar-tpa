'use client'

import { useCallback } from 'react'
import { Bookmark, BookmarkCheck, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTopicConfig } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import VisualQuestion from '@/components/visual/VisualQuestion'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  questionNumber?: number
  totalQuestions?: number
  selectedAnswer?: string
  showExplanation?: boolean
  isBookmarked?: boolean
  isTryoutMode?: boolean
  onAnswer?: (questionId: string, answer: string) => void
  onBookmark?: (questionId: string, bookmarked: boolean) => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showExplanation = false,
  isBookmarked = false,
  isTryoutMode = false,
  onAnswer,
  onBookmark,
}: QuestionCardProps) {
  const topicConfig = getTopicConfig(question.topic)
  const subtestVariant = question.subtest as 'verbal' | 'numerik' | 'penalaran'

  const handleSelect = useCallback((opt: string) => {
    if (isTryoutMode && selectedAnswer) return
    onAnswer?.(question.id, opt)
  }, [isTryoutMode, selectedAnswer, onAnswer, question.id])

  const canShowResult = showExplanation && !!selectedAnswer
  const isCorrect = selectedAnswer === question.answer

  if (question.question_type === 'visual' && question.visual_data) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {questionNumber !== undefined && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={subtestVariant}>{topicConfig?.label}</Badge>
              <span className="text-xs text-gray-400">
                {questionNumber}{totalQuestions ? `/${totalQuestions}` : ''}
              </span>
            </div>
            {onBookmark && (
              <button
                onClick={() => onBookmark(question.id, !isBookmarked)}
                className="text-gray-300 hover:text-amber-400 transition-colors"
              >
                {isBookmarked ? <BookmarkCheck size={18} className="text-amber-400" /> : <Bookmark size={18} />}
              </button>
            )}
          </div>
        )}
        <VisualQuestion
          visualData={question.visual_data!}
          selectedAnswer={selectedAnswer}
          correctAnswer={canShowResult ? question.answer : undefined}
          showAnswer={canShowResult}
          onSelect={(opt: string) => handleSelect(opt)}
        />
      </div>
    )
  }

  const hasQuestion = !!question.question
  const hasQuestionImage = !!question.image_url
  const options = question.options as Record<string, string> | undefined

  if (!hasQuestion && !hasQuestionImage && !options) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={subtestVariant}>{topicConfig?.label}</Badge>
          {questionNumber !== undefined && (
            <span className="text-xs text-gray-400">
              Soal {questionNumber}{totalQuestions ? ` dari ${totalQuestions}` : ''}
            </span>
          )}
          {canShowResult && (
            isCorrect
              ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={13} /> Benar</span>
              : <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><XCircle size={13} /> Salah</span>
          )}
        </div>
        {onBookmark && (
          <button
            onClick={() => onBookmark(question.id, !isBookmarked)}
            className="flex-shrink-0 text-gray-300 hover:text-amber-400 transition-colors"
          >
            {isBookmarked ? <BookmarkCheck size={18} className="text-amber-400" /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      {/* Question text + image */}
      <div className="mb-5 space-y-3">
        {question.question && (
          <p className="text-sm text-gray-800 leading-relaxed">{question.question}</p>
        )}
        {question.image_url && (
          <img
            src={question.image_url}
            alt="Gambar soal"
            className="max-w-full max-h-64 rounded-lg border border-gray-200 object-contain"
          />
        )}
      </div>

      {/* Options */}
      {options && (
        <div className="space-y-2.5">
          {OPTION_LABELS.map(label => {
            const text = options[label]
            const imgUrl = question.options_images?.[label]
            if (!text && !imgUrl) return null

            const isSelected = selectedAnswer === label
            const isRight = question.answer === label

            let optionClass = 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            if (isSelected && !canShowResult) {
              optionClass = 'border-blue-500 bg-blue-50 text-blue-800'
            } else if (canShowResult) {
              if (isRight) {
                optionClass = 'border-green-500 bg-green-50 text-green-800'
              } else if (isSelected && !isRight) {
                optionClass = 'border-red-400 bg-red-50 text-red-800'
              } else {
                optionClass = 'border-gray-100 bg-gray-50 text-gray-400'
              }
            }

            return (
              <button
                key={label}
                onClick={() => handleSelect(label)}
                disabled={canShowResult || (isTryoutMode && !!selectedAnswer && !isSelected)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg border text-left text-sm transition-all duration-100',
                  optionClass,
                  !canShowResult && !(isTryoutMode && selectedAnswer) ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <span className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold mt-0.5',
                  isSelected && !canShowResult ? 'border-blue-500 bg-blue-500 text-white' : '',
                  canShowResult && isRight ? 'border-green-500 bg-green-500 text-white' : '',
                  canShowResult && isSelected && !isRight ? 'border-red-400 bg-red-400 text-white' : '',
                  !isSelected || (canShowResult && !isRight && !isSelected) ? 'border-current' : ''
                )}>
                  {label}
                </span>
                <div className="space-y-2 min-w-0 flex-1">
                  {text && <span className="leading-relaxed block">{text}</span>}
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt={`Pilihan ${label}`}
                      className="max-h-32 rounded border border-current/20 object-contain"
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Explanation */}
      {canShowResult && (question.explanation || question.explanation_image_url) && (
        <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-blue-700">Pembahasan</p>
          {question.explanation && (
            <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
          )}
          {question.explanation_image_url && (
            <img
              src={question.explanation_image_url}
              alt="Gambar pembahasan"
              className="max-w-full max-h-48 rounded-lg border border-blue-200 object-contain"
            />
          )}
        </div>
      )}
    </div>
  )
}
