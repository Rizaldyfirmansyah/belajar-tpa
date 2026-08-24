import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'emerald'
  size?: 'sm' | 'md'
}

const colors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
}

export default function ProgressBar({ value, max = 100, className, color = 'blue', size = 'sm' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', colors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
