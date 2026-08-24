import { callGroq } from '@/lib/groq/client'
import { getTargetTime } from '@/lib/scoring'
import type { Topic } from '@/types'

interface SessionData {
  score_final: number
  score_verbal: number
  score_numerik: number
  score_penalaran: number
  topic_accuracy: Record<string, number>
  topic_avg_time: Record<string, number>
  attempt_number: number
}

export async function generatePostTestSummary(session: SessionData): Promise<string> {
  const topicLabels: Record<string, string> = {
    sinonim:            'Sinonim',
    antonim:            'Antonim',
    analogi:            'Analogi',
    pengelompokan_kata: 'Pengelompokan Kata',
    pemahaman_wacana:   'Pemahaman Wacana',
    deret:              'Deret',
    matematika_berpola: 'Matematika Berpola',
    aritmetika_aljabar: 'Aritmetika & Aljabar',
    cerita:             'Cerita',
    penalaran_logis:    'Penalaran Logis',
    penalaran_analitis: 'Penalaran Analitis',
    penalaran_gambar:   'Penalaran Gambar',
  }

  const accuracyLines = Object.entries(session.topic_accuracy)
    .map(([t, a]) => `  - ${topicLabels[t] || t}: ${Math.round(a * 100)}%`)
    .join('\n')

  const speedLines = Object.entries(session.topic_avg_time)
    .map(([t, s]) => {
      const target = getTargetTime(t as Topic)
      const label = topicLabels[t] || t
      return `  - ${label}: ${Math.round(s)}s (target: ${target}s)`
    })
    .join('\n')

  const prompt = `Kamu adalah tutor TPA yang memberikan feedback setelah sesi try out.

DATA TES TERBARU:
- Skor final: ${session.score_final}/800
- Verbal: ${session.score_verbal} | Numerik: ${session.score_numerik} | Penalaran: ${session.score_penalaran}
- Akurasi per topik:
${accuracyLines}
- Rata-rata waktu per soal per topik:
${speedLines}
- Ini adalah try out ke-${session.attempt_number}

Berikan feedback dalam 3 paragraf:
1. Apresiasi pencapaian + highlight yang bagus dari sesi ini
2. Identifikasi 2-3 kelemahan spesifik dengan penjelasan konkret
3. Rekomendasi belajar yang actionable untuk sesi berikutnya

Gunakan bahasa Indonesia yang hangat dan memotivasi. Jangan gunakan bullet points. Langsung tulis teks paragraf tanpa heading.`

  return callGroq(prompt)
}
