'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts'

interface SpeedChartProps {
  data: { topic: string; label: string; avgSec: number; targetSec: number }[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { targetSec: number } }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const avg = Math.round(payload[0].value)
  const target = payload[0].payload.targetSec
  const tooSlow = avg > target

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2.5">
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      <p className={`text-sm font-bold ${tooSlow ? 'text-red-600' : 'text-green-600'}`}>
        {avg}s rata-rata
      </p>
      <p className="text-xs text-gray-400">Target: {target}s</p>
    </div>
  )
}

export default function SpeedChart({ data }: SpeedChartProps) {
  const hasData = data.some(d => d.avgSec > 0)

  if (!hasData) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">Belum ada data. Mulai latihan soal!</p>
    )
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          // left: 0 — lihat catatan yang sama di TopicAccuracyChart.
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}s`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: '#374151' }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avgSec" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.avgSec === 0 ? '#e5e7eb' : d.avgSec > d.targetSec ? '#ef4444' : '#22c55e'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
