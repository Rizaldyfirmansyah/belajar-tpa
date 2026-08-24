/**
 * Seed script — generates text questions via Groq and inserts to Supabase.
 * Run: npx tsx scripts/seed-text-questions.ts
 *
 * Prerequisites:
 * - .env with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY
 */

import { config } from 'dotenv'
config({ path: '.env' })

import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = 'llama-3.3-70b-versatile'

interface RawQuestion {
  question: string
  options: Record<string, string>
  answer: string
  explanation: string
  difficulty: string
}

const TOPIC_CONFIG = [
  { topic: 'sinonim',            subtest: 'verbal',  bankTarget: 75 },
  { topic: 'antonim',            subtest: 'verbal',  bankTarget: 75 },
  { topic: 'analogi',            subtest: 'verbal',  bankTarget: 75 },
  { topic: 'pengelompokan',      subtest: 'verbal',  bankTarget: 50 },
  { topic: 'pemahaman_teks',     subtest: 'verbal',  bankTarget: 75 },
  { topic: 'aritmetika',         subtest: 'numerik', bankTarget: 75 },
  { topic: 'deret_bilangan',     subtest: 'numerik', bankTarget: 75 },
  { topic: 'operasi_matematika', subtest: 'numerik', bankTarget: 75 },
  { topic: 'analisis_data',      subtest: 'numerik', bankTarget: 75 },
  { topic: 'logika_formal',      subtest: 'logika',  bankTarget: 75 },
  { topic: 'logika_analisa',     subtest: 'logika',  bankTarget: 75 },
  { topic: 'logika_cerita',      subtest: 'logika',  bankTarget: 75 },
]

const PROMPTS: Record<string, string> = {
  sinonim:            `Buat {count} soal SINONIM untuk TPA Nasional (setara TPA Bappenas). Gunakan kosakata akademik, ilmiah, dan kata serapan yang sering muncul di TPA. Variasikan tingkat kesulitan: 30% mudah, 50% sedang, 20% sulit.`,
  antonim:            `Buat {count} soal ANTONIM untuk TPA Nasional. Sertakan kata-kata yang memiliki antonim tidak langsung (berlawanan konsep, bukan hanya lawan kata sederhana).`,
  analogi:            `Buat {count} soal ANALOGI / PADANAN HUBUNGAN KATA untuk TPA Nasional. Variasikan tipe hubungan: sebab-akibat, bagian-keseluruhan, fungsi, kategori, analogi profesi. Format soal: "KATA1 : KATA2 = ... : ..."`,
  pengelompokan:      `Buat {count} soal PENGELOMPOKAN KATA untuk TPA Nasional. Format: empat atau lima kata diberikan, tentukan kata yang tidak termasuk kelompok / ganjil. Variasikan kategori: benda, konsep, profesi, aktivitas, sifat.`,
  pemahaman_teks:     `Buat {count} soal PEMAHAMAN TEKS untuk TPA Nasional. Setiap soal: satu teks pendek (100-200 kata, topik akademik/sains/sosial) diikuti satu pertanyaan pemahaman.`,
  aritmetika:         `Buat {count} soal ARITMETIKA untuk TPA Nasional. Topik: pecahan, desimal, persen, eksponen, akar, perbandingan, rata-rata. PENTING: Setiap soal harus memiliki 1 jawaban yang pasti benar secara matematis.`,
  deret_bilangan:     `Buat {count} soal DERET BILANGAN untuk TPA Nasional. Variasikan: deret aritmetika, geometri, fibonacci-like, deret ganda, pola interleaved. Sertakan deret huruf juga (20% dari total).`,
  operasi_matematika: `Buat {count} soal OPERASI MATEMATIKA BERPOLA untuk TPA Nasional. Format: soal operasi matematika dengan pola tertentu, cari nilai yang kosong.`,
  analisis_data:      `Buat {count} soal ANALISIS DATA / CERITA untuk TPA Nasional. Topik: perbandingan, kecepatan-jarak-waktu, keuntungan-rugi, probabilitas, persamaan linear.`,
  logika_formal:      `Buat {count} soal LOGIKA FORMAL (silogisme) untuk TPA Nasional. Format: premis mayor + premis minor → simpulkan. Variasikan: semua/sebagian, kondisional, inklusif/eksklusif.`,
  logika_analisa:     `Buat {count} soal LOGIKA ANALISA / MATEMATIKA untuk TPA Nasional. Tipe: perbandingan nilai variabel (x vs y), pernyataan benar/salah, implikasi matematika.`,
  logika_cerita:      `Buat {count} soal LOGIKA CERITA / ANALITIS untuk TPA Nasional. Tipe: pengurutan, pengelompokan orang/benda, constraint satisfaction (misal: siapa duduk di mana).`,
}

const RESPONSE_FORMAT = `\n\nReturn ONLY a valid JSON array. No markdown, no explanation, no backticks.
[
  {
    "question": "teks soal lengkap",
    "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
    "answer": "A",
    "explanation": "penjelasan kenapa jawabannya A",
    "difficulty": "easy|medium|hard"
  }
]`

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function parseJsonSafe(str: string): RawQuestion[] | null {
  try {
    const cleaned = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

class DailyLimitError extends Error {}

async function generateBatch(topic: string, count: number, retries = 3): Promise<RawQuestion[]> {
  const prompt = PROMPTS[topic].replace('{count}', String(count)) + RESPONSE_FORMAT
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      })
      const text = resp.choices[0]?.message?.content ?? ''
      const parsed = parseJsonSafe(text)
      if (parsed && Array.isArray(parsed)) return parsed
      console.log(`  [${topic}] Parse failed, retry ${i + 1}`)
      await delay(2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const status = (err as Record<string, unknown>)?.status ?? (err as Record<string, unknown>)?.statusCode ?? ''
      const detail = (err as Record<string, unknown>)?.errorDetails ?? (err as Record<string, unknown>)?.cause ?? ''
      console.log(`  [${topic}] API error, retry ${i + 1}: status=${status} | ${msg} | ${JSON.stringify(detail)}`)
      if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('per day')) {
        throw new DailyLimitError(msg)
      }
      await delay(3000 * (i + 1))
    }
  }
  return []
}

function validateQuestion(q: RawQuestion): boolean {
  return !!(
    q.question &&
    q.options &&
    q.options.A && q.options.B && q.options.C && q.options.D && q.options.E &&
    ['A', 'B', 'C', 'D', 'E'].includes(q.answer) &&
    q.explanation
  )
}

async function seedTopic(topic: string, subtest: string, bankTarget: number) {
  console.log(`\n[${topic.toUpperCase()}] Starting — target: ${bankTarget} questions`)

  // Check existing
  const { count: existing } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic', topic)

  const needed = bankTarget - (existing ?? 0)
  if (needed <= 0) {
    console.log(`  [${topic}] Already has ${existing} questions. Skipping.`)
    return
  }

  console.log(`  [${topic}] Need ${needed} more questions (have ${existing ?? 0})`)

  const batchSize = 10
  let totalInserted = 0
  let batches = Math.ceil(needed / batchSize)

  for (let b = 0; b < batches; b++) {
    const count = Math.min(batchSize, needed - totalInserted)
    console.log(`  [${topic}] Batch ${b + 1}/${batches}: generating ${count} questions...`)

    let questions: RawQuestion[]
    try {
      questions = await generateBatch(topic, count)
    } catch (err) {
      if (err instanceof DailyLimitError) throw err
      questions = []
    }
    const valid = questions.filter(validateQuestion)
    console.log(`  [${topic}] Batch ${b + 1}: got ${questions.length}, valid: ${valid.length}`)

    if (valid.length > 0) {
      const rows = valid.map(q => ({
        subtest,
        topic,
        question_type: 'text',
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        is_validated: true,
      }))

      const { error } = await supabase.from('questions').insert(rows)
      if (error) {
        console.error(`  [${topic}] Insert error:`, error.message)
      } else {
        totalInserted += valid.length
        console.log(`  [${topic}] Inserted ${valid.length}. Total: ${(existing ?? 0) + totalInserted}/${bankTarget}`)
      }
    }

    if (b < batches - 1) {
      console.log(`  [${topic}] Waiting 2s...`)
      await delay(2000)
    }
  }

  console.log(`  [${topic}] Done. Inserted ${totalInserted} questions.`)
}

async function main() {
  console.log('=== TPA Nasional Seed Script — Text Questions ===\n')
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + '...')

  for (const cfg of TOPIC_CONFIG) {
    try {
      await seedTopic(cfg.topic, cfg.subtest, cfg.bankTarget)
    } catch (err) {
      if (err instanceof DailyLimitError) {
        console.error('\n⛔ API daily/quota limit reached. Script stopped.')
        console.error('   Tunggu beberapa saat lalu jalankan lagi — script akan skip topik yang sudah selesai.')
        process.exit(1)
      }
      throw err
    }
    await delay(1000)
  }

  console.log('\n=== Seeding complete! ===')
}

main().catch(console.error)
