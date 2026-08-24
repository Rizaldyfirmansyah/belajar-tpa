'use client'

import { cn } from '@/lib/utils'
import type { VisualData, ShapeDescriptor } from '@/types'
import ShapeRenderer from './ShapeRenderer'

interface VisualQuestionProps {
  visualData: VisualData
  selectedAnswer?: string
  correctAnswer?: string
  showAnswer?: boolean
  onSelect?: (option: string) => void
  disabled?: boolean
}

function ShapeBox({
  descriptor,
  label,
  size = 'medium',
}: {
  descriptor: ShapeDescriptor
  label?: string
  size?: 'small' | 'medium' | 'large'
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs font-medium text-gray-500">{label}</span>}
      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex items-center justify-center">
        <ShapeRenderer descriptor={descriptor} size={size} />
      </div>
    </div>
  )
}

const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

export default function VisualQuestion({
  visualData,
  selectedAnswer,
  correctAnswer,
  showAnswer = false,
  onSelect,
  disabled = false,
}: VisualQuestionProps) {
  function getOptionStyle(opt: string) {
    if (!showAnswer) {
      return selectedAnswer === opt
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
    }
    if (opt === correctAnswer) return 'border-green-500 bg-green-50'
    if (opt === selectedAnswer && opt !== correctAnswer) return 'border-red-500 bg-red-50'
    return 'border-gray-200 bg-white'
  }

  return (
    <div className="space-y-5">
      {/* Question figures */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        {visualData.type === 'odd_one_out' && visualData.items && (
          <div className="flex flex-wrap gap-3 justify-center">
            {visualData.items.map((item, i) => (
              <ShapeBox
                key={i}
                descriptor={item}
                label={item.id || String.fromCharCode(65 + i)}
                size="medium"
              />
            ))}
          </div>
        )}

        {visualData.type === 'sequence' && visualData.sequence && (
          <div className="flex flex-wrap items-center gap-3 justify-center">
            {visualData.sequence.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <ShapeBox descriptor={item} size="medium" />
                {i < visualData.sequence!.length - 1 && (
                  <span className="text-gray-400 text-lg">→</span>
                )}
              </div>
            ))}
            <span className="text-gray-400 text-lg">→</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 w-14 h-14 flex items-center justify-center">
              <span className="text-gray-400 text-lg font-semibold">?</span>
            </div>
          </div>
        )}

        {visualData.type === 'matrix' && visualData.grid && (
          <div className="flex justify-center">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${visualData.grid[0].length}, auto)` }}
            >
              {visualData.grid.map((row, ri) =>
                row.map((cell, ci) => (
                  <div key={`${ri}-${ci}`}>
                    {cell === null ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 w-14 h-14 flex items-center justify-center">
                        <span className="text-gray-400 text-lg font-semibold">?</span>
                      </div>
                    ) : (
                      <ShapeBox descriptor={cell} size="small" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {visualData.type === 'mirror' && visualData.source && (
          <div className="flex items-center gap-6 justify-center">
            <ShapeBox descriptor={visualData.source} size="large" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-16 bg-gray-400 border-l-2 border-dashed border-gray-400" />
              <span className="text-xs text-gray-400">cermin</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-20 h-20 flex items-center justify-center">
              <span className="text-gray-400 text-lg font-semibold">?</span>
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-5 gap-2">
        {OPTIONS.map(opt => {
          const optDescriptor = visualData.options[opt]
          if (!optDescriptor) return null
          return (
            <button
              key={opt}
              onClick={() => !disabled && onSelect?.(opt)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all duration-150',
                getOptionStyle(opt),
                !disabled && 'cursor-pointer',
                disabled && 'cursor-default'
              )}
            >
              <ShapeRenderer descriptor={optDescriptor} size="small" />
              <span className="text-xs font-semibold text-gray-600">{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
