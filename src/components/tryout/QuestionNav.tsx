'use client'

import { cn } from '@/lib/utils'

interface QuestionNavProps {
  total: number
  currentIndex: number
  answeredIds: Set<string>
  questionIds: string[]
  onNavigate: (index: number) => void
}

export default function QuestionNav({
  total,
  currentIndex,
  answeredIds,
  questionIds,
  onNavigate,
}: QuestionNavProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = answeredIds.has(questionIds[i])
        const isCurrent = i === currentIndex

        return (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={cn(
              'w-7 h-7 rounded-md text-xs font-medium transition-all duration-150',
              isCurrent
                ? 'bg-blue-600 text-white shadow-sm'
                : isAnswered
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
