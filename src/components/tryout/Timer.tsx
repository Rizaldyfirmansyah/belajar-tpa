'use client'

import { useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { cn, formatTime } from '@/lib/utils'

interface TimerProps {
  timeRemaining: number
  onTick: (time: number) => void
  onExpire: () => void
  paused?: boolean
}

export default function Timer({ timeRemaining, onTick, onExpire, paused = false }: TimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      onTick(Math.max(0, timeRemaining - 1))
      if (timeRemaining <= 1) {
        clearInterval(intervalRef.current!)
        onExpire()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timeRemaining, paused, onTick, onExpire])

  const isWarning = timeRemaining < 180
  const isDanger = timeRemaining < 60

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold transition-colors',
        isDanger
          ? 'bg-red-100 text-red-700 animate-pulse-slow'
          : isWarning
          ? 'bg-amber-100 text-amber-700'
          : 'bg-gray-100 text-gray-700'
      )}
    >
      <Clock
        size={14}
        className={isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-500'}
      />
      {formatTime(timeRemaining)}
    </div>
  )
}
