import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-xl shadow-sm', padding && 'p-6', className)}>
      {children}
    </div>
  )
}
