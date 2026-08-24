'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface SubtestTransitionProps {
  nextTopicName?: string
  onContinue: () => void
  isLastTopic?: boolean
}

export default function SubtestTransition({
  nextTopicName,
  onContinue,
  isLastTopic = false,
}: SubtestTransitionProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown <= 0) {
      onContinue()
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, onContinue])

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>

        <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">
          {isLastTopic ? 'Semua topik selesai!' : 'Topik selesai!'}
        </h2>

        {!isLastTopic && nextTopicName && (
          <p className="text-gray-500 text-sm mb-6">
            Berikutnya: <span className="font-semibold text-gray-700">{nextTopicName}</span>
          </p>
        )}

        {isLastTopic && (
          <p className="text-gray-500 text-sm mb-6">
            Kamu telah menyelesaikan semua 12 topik.
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button onClick={onContinue}>
            {isLastTopic ? 'Lihat Hasil' : 'Lanjut'}
            <ArrowRight size={16} />
          </Button>
          {!isLastTopic && (
            <span className="text-sm text-gray-400">Auto lanjut: {countdown}s</span>
          )}
        </div>
      </div>
    </div>
  )
}
