'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { PASSING_SCORE, SCORE_MIN, SCORE_MAX } from '@/lib/constants'

interface ScoreTrendProps {
  data: { session: number; score: number; date: string }[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const score = payload[0]?.value
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
      <p className="text-xs text-gray-500 mb-1">Sesi ke-{label}</p>
      <p className={`text-lg font-bold font-heading ${score >= PASSING_SCORE ? 'text-green-600' : 'text-red-600'}`}>
        {score}
      </p>
      <p className={`text-xs ${score >= PASSING_SCORE ? 'text-green-600' : 'text-red-500'}`}>
        {score >= PASSING_SCORE ? 'Lulus' : 'Belum lulus'}
      </p>
    </div>
  )
}

export default function ScoreTrendChart({ data }: ScoreTrendProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="session"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Sesi ke-', position: 'insideBottom', offset: -2, style: { fontSize: 11, fill: '#9ca3af' } }}
          />
          <YAxis
            domain={[SCORE_MIN, SCORE_MAX]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={PASSING_SCORE}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{ value: '475', position: 'insideRight', style: { fontSize: 11, fill: '#ef4444' } }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
