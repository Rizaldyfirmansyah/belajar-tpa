'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { Subtest } from '@/types'

interface TopicAccuracyChartProps {
  data: { topic: string; label: string; accuracy: number; subtest: Subtest }[]
}

const SUBTEST_COLORS: Record<Subtest, string> = {
  verbal:    '#3b82f6',
  numerik:   '#10b981',
  penalaran: '#8b5cf6',
}

function getBarColor(accuracy: number): string {
  if (accuracy >= 0.7) return '#22c55e'
  if (accuracy >= 0.5) return '#f59e0b'
  return '#ef4444'
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { subtest: Subtest } }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const pct = Math.round(payload[0].value * 100)
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2.5">
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-sm font-bold" style={{ color: getBarColor(payload[0].value) }}>
        {pct}% akurasi
      </p>
    </div>
  )
}

export default function TopicAccuracyChart({ data }: TopicAccuracyChartProps) {
  if (data.every(d => d.accuracy === 0)) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">Belum ada data. Mulai latihan soal!</p>
    )
  }

  return (
    <div className="h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          // left: 0, bukan 80 — YAxis di bawah sudah punya width sendiri untuk
          // label topik. Dulu dua-duanya diisi 80, jadi ruang kiri kepakai 160px
          // dan batangnya terdorong ke tengah di layar HP.
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 10.5, fill: '#767C87' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 10.5, fill: '#41474F' }}
            tickLine={false}
            axisLine={false}
            width={104}
            interval={0}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0.7} stroke="#22c55e" strokeDasharray="4 2" opacity={0.5} />
          <ReferenceLine x={0.5} stroke="#f59e0b" strokeDasharray="4 2" opacity={0.5} />
          <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((d, i) => (
              <Cell key={i} fill={getBarColor(d.accuracy)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
