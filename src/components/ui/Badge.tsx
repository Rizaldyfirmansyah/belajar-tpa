import { cn } from '@/lib/utils'
import type { Subtest } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'verbal' | 'numerik' | 'penalaran' | 'success' | 'warning' | 'danger' | 'gray'
  className?: string
}

const variants = {
  default:   'bg-gray-100 text-gray-600',
  verbal:    'bg-blue-50 text-blue-700',
  numerik:   'bg-emerald-50 text-emerald-700',
  penalaran: 'bg-violet-50 text-violet-700',
  success:   'bg-green-50 text-green-700',
  warning:   'bg-amber-50 text-amber-700',
  danger:    'bg-red-50 text-red-700',
  gray:      'bg-gray-100 text-gray-500',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

export function SubtestBadge({ subtest }: { subtest: Subtest }) {
  const labels: Record<Subtest, string> = {
    verbal:    'Verbal',
    numerik:   'Numerik',
    penalaran: 'Penalaran',
  }
  const variantMap: Record<Subtest, BadgeProps['variant']> = {
    verbal:    'verbal',
    numerik:   'numerik',
    penalaran: 'penalaran',
  }
  return <Badge variant={variantMap[subtest]}>{labels[subtest]}</Badge>
}
