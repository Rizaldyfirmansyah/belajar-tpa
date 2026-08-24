'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'
import type { Subtest } from '@/types'

interface SubtestGaugeProps {
  label: string
  accuracy: number
  color: string
  subtest: Subtest
}

function getStrength(accuracy: number): { label: string; color: string } {
  if (accuracy >= 0.7) return { label: 'Kuat', color: 'text-green-600' }
  if (accuracy >= 0.5) return { label: 'Perlu Latihan', color: 'text-amber-600' }
  return { label: 'Lemah', color: 'text-red-600' }
}

export default function SubtestGauge({ label, accuracy, color, subtest }: SubtestGaugeProps) {
  const pct = Math.round(accuracy * 100)
  const data = [
    { value: pct },
    { value: 100 - pct },
  ]
  const { label: strengthLabel, color: strengthColor } = getStrength(accuracy)

  return (
    <Card>
      <div className="text-center">
        <div className="h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="75%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={68}
                paddingAngle={0}
                dataKey="value"
              >
                <Cell fill={color} />
                <Cell fill="#f3f4f6" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
            <span className="text-2xl font-bold font-heading text-gray-900">{pct}%</span>
          </div>
        </div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <p className={`text-xs mt-0.5 font-medium ${strengthColor}`}>{strengthLabel}</p>
      </div>
    </Card>
  )
}
