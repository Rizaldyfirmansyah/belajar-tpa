import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExplanationBoxProps {
  explanation: string
  isCorrect: boolean
  correctAnswer: string
  className?: string
}

export default function ExplanationBox({ explanation, isCorrect, correctAnswer, className }: ExplanationBoxProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 mt-4 animate-slide-up',
        isCorrect
          ? 'bg-green-50 border-green-200'
          : 'bg-amber-50 border-amber-200'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isCorrect ? 'bg-green-100' : 'bg-amber-100'
        )}>
          <Lightbulb size={16} className={isCorrect ? 'text-green-600' : 'text-amber-600'} />
        </div>
        <div>
          {!isCorrect && (
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Jawaban benar: <span className="font-bold">{correctAnswer}</span>
            </p>
          )}
          {isCorrect && (
            <p className="text-sm font-semibold text-green-800 mb-1">Benar!</p>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  )
}
