import { callGroqJson } from '@/lib/groq/client'
import type { Topic, Difficulty } from '@/types'

interface RawQuestion {
  question: string
  options: Record<'A' | 'B' | 'C' | 'D' | 'E', string>
  answer: 'A' | 'B' | 'C' | 'D' | 'E'
  explanation: string
  difficulty: Difficulty
}

const RESPONSE_FORMAT = `
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
[
  {
    "question": "teks soal lengkap",
    "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
    "answer": "A",
    "explanation": "penjelasan kenapa jawabannya A, bukan yang lain",
    "difficulty": "easy|medium|hard"
  }
]`

const PROMPTS: Record<Topic, string> = {
  sinonim: `Buat {count} soal SINONIM untuk TPA Nasional (setara TPA Bappenas).
Gunakan kosakata akademik, ilmiah, dan kata serapan yang sering muncul di TPA.
Variasikan tingkat kesulitan: 30% mudah, 50% sedang, 20% sulit.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  antonim: `Buat {count} soal ANTONIM untuk TPA Nasional.
Sertakan kata-kata yang memiliki antonim tidak langsung (berlawanan konsep, bukan hanya lawan kata sederhana).
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  analogi: `Buat {count} soal ANALOGI / PADANAN HUBUNGAN KATA untuk TPA Nasional.
Variasikan tipe hubungan: sebab-akibat, bagian-keseluruhan, fungsi, kategori, analogi profesi.
Format soal: "KATA1 : KATA2 = ... : ..." dengan 5 pilihan pasangan kata.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  pengelompokan_kata: `Buat {count} soal PENGELOMPOKAN KATA untuk TPA Nasional.
Format: empat atau lima kata diberikan, tentukan kata yang tidak termasuk kelompok / ganjil.
Variasikan kategori: benda, konsep, profesi, aktivitas, sifat.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  pemahaman_wacana: `Buat {count} soal PEMAHAMAN WACANA untuk TPA Nasional.
Setiap soal: satu teks pendek (100-200 kata, topik akademik/sains/sosial) diikuti satu pertanyaan pemahaman.
Teks harus padat informasi dan membutuhkan pemahaman mendalam.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  aritmetika_aljabar: `Buat {count} soal ARITMETIKA & ALJABAR untuk TPA Nasional.
Topik: pecahan, desimal, persen, eksponen, akar, persamaan aljabar, perbandingan.
PENTING: Setiap soal harus memiliki 1 jawaban yang pasti benar secara matematis.
Sertakan angka spesifik dan pastikan hitungannya akurat.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  deret: `Buat {count} soal DERET untuk TPA Nasional.
Variasikan: deret aritmetika, geometri, fibonacci-like, deret ganda, pola interleaved.
Sertakan deret huruf juga (20% dari total).
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  matematika_berpola: `Buat {count} soal MATEMATIKA BERPOLA untuk TPA Nasional.
Format: soal operasi matematika dengan pola tertentu, cari nilai yang kosong dalam pola baris/kolom/matriks.
Pola bisa berupa: operasi baris, operasi kolom, diagonal, atau kombinasi.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  cerita: `Buat {count} soal CERITA (matematika) untuk TPA Nasional.
Topik: perbandingan, kecepatan-jarak-waktu, keuntungan-rugi, probabilitas, persamaan linear.
Tingkat kesulitan: setara soal matematika pascasarjana.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  penalaran_logis: `Buat {count} soal PENALARAN LOGIS (silogisme) untuk TPA Nasional.
Format: premis mayor + premis minor → simpulkan.
Variasikan: semua/sebagian, kondisional, inklusif/eksklusif.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  penalaran_analitis: `Buat {count} soal PENALARAN ANALITIS untuk TPA Nasional.
Tipe: perbandingan nilai variabel, pernyataan benar/salah, implikasi logika, deduksi dari premis.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,

  penalaran_gambar: `Buat {count} soal PENALARAN GAMBAR (verbal/deskripsi) untuk TPA Nasional.
Karena format gambar tidak tersedia, deskripsikan soal pola visual dalam teks.
Tipe: pengurutan pola, kelanjutan pola, odd-one-out berdasarkan deskripsi bentuk/pola.
Sistem: Kamu adalah pembuat soal TPA Nasional yang ahli.`,
}

function buildPrompt(topic: Topic, count: number): string {
  const base = PROMPTS[topic].replace('{count}', String(count))
  return `${base}\n${RESPONSE_FORMAT}`
}

export async function generateTextQuestions(topic: Topic, count: number): Promise<RawQuestion[]> {
  const prompt = buildPrompt(topic, count)
  const result = await callGroqJson<RawQuestion[]>(prompt)

  if (!Array.isArray(result)) return []

  return result.filter(q =>
    q.question &&
    q.options &&
    typeof q.options === 'object' &&
    ['A', 'B', 'C', 'D', 'E'].every(k => k in q.options) &&
    ['A', 'B', 'C', 'D', 'E'].includes(q.answer) &&
    q.explanation
  )
}
