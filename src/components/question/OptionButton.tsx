'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

interface OptionButtonProps {
  label: string
  text: string
  selected: boolean
  correct?: boolean
  wrong?: boolean
  disabled?: boolean
  onClick?: () => void
}

export default function OptionButton({
  label,
  text,
  selected,
  correct,
  wrong,
  disabled,
  onClick,
}: OptionButtonProps) {
  const base =
    'w-full flex items-start gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all duration-150 text-sm leading-relaxed'

  let style = 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800'

  if (correct) {
    style = 'border-green-500 bg-green-50 text-green-800'
  } else if (wrong) {
    style = 'border-red-500 bg-red-50 text-red-800'
  } else if (selected) {
    style = 'border-blue-500 bg-blue-50 text-blue-800'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(base, style, (disabled) && 'cursor-default')}
    >
      <span
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5',
          correct ? 'border-green-500 bg-green-500 text-white' :
          wrong ? 'border-red-500 bg-red-500 text-white' :
          selected ? 'border-blue-500 bg-blue-500 text-white' :
          'border-gray-300 text-gray-500'
        )}
      >
        {label}
      </span>
      <span className="flex-1">{text}</span>
      {correct && <CheckCircle size={18} className="flex-shrink-0 text-green-500 mt-0.5" />}
      {wrong && <XCircle size={18} className="flex-shrink-0 text-red-500 mt-0.5" />}
    </button>
  )
}
