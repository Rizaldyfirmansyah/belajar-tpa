import { callGroq } from '@/lib/groq/client'
import type { DashboardMetrics } from '@/types'

export async function generateOverallAnalysis(metrics: DashboardMetrics): Promise<string> {
  if (metrics.totalSessions === 0) {
    return 'Belum ada data try out. Mulailah dengan try out pertamamu untuk mendapatkan analisis menyeluruh!'
  }

  const topicAccLines = metrics.topicAccuracy
    .map(t => `  - ${t.label}: ${Math.round(t.accuracy * 100)}%`)
    .join('\n')

  const topicSpeedLines = metrics.topicSpeed
    .map(t => `  - ${t.label}: ${Math.round(t.avgSec)}s (target: ${t.targetSec}s)`)
    .join('\n')

  const scoreSeq = metrics.scoreTrend.map(s => s.score).join(' → ')

  const prompt = `Kamu adalah konsultan TPA/UPDA yang menganalisis progress belajar secara menyeluruh.

RINGKASAN PROGRESS PENGGUNA:
- Total try out selesai: ${metrics.totalSessions}
- Skor tertinggi: ${Math.max(...metrics.scoreTrend.map(s => s.score), 0)}
- Skor rata-rata: ${metrics.totalSessions > 0 ? Math.round(metrics.scoreTrend.reduce((a, b) => a + b.score, 0) / metrics.scoreTrend.length) : 0}
- Tren skor (dari awal sampai terbaru): ${scoreSeq}
- Streak belajar: ${metrics.currentStreak} hari

AKURASI PER TOPIK (rata-rata semua sesi):
${topicAccLines}

KECEPATAN PER TOPIK (rata-rata detik/soal):
${topicSpeedLines}

Berikan analisis menyeluruh dalam 4-5 paragraf:
1. Gambaran umum progress (apakah menuju target 475?)
2. Kekuatan yang sudah solid
3. Kelemahan yang paling perlu diprioritaskan + alasannya
4. Rekomendasi rencana belajar konkret (topik apa, berapa soal per hari)
5. Estimasi kesiapan ujian berdasarkan tren yang ada

Gunakan bahasa Indonesia yang profesional tapi tidak kaku. Jangan gunakan bullet points. Langsung tulis paragraf tanpa heading.`

  return callGroq(prompt)
}
