/**
 * Parse real TPA questions from PDF bank soal files and insert into Supabase.
 * Run: npx tsx scripts/seed-from-pdf.ts
 *
 * Supports:
 *   soal-tes-potensi-akademik-beserta-kunci-jawaban.pdf  — main PDF with explanations
 *   779-adocpub-tes-bakat-skolastik-tbs.pdf              — TBS PDF, simple answer key
 */

import { config } from 'dotenv'
config({ path: '.env' })

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type MajorSection = 'verbal' | 'angka' | 'logika' | 'misc'

interface QuestionBlock {
  majorSection: MajorSection
  topic: string
  subtest: 'verbal' | 'numerik' | 'logika'
  number: number
  question: string
  options: Record<string, string>
}

interface AnswerEntry {
  majorSection: MajorSection
  number: number
  letter: string
  explanation: string
}

const TOPIC_TO_SUBTEST: Record<string, 'verbal' | 'numerik' | 'logika'> = {
  analogi:            'verbal',
  pengelompokan:      'verbal',
  sinonim:            'verbal',
  antonim:            'verbal',
  pemahaman_teks:     'verbal',
  aritmetika:         'numerik',
  deret_bilangan:     'numerik',
  operasi_matematika: 'numerik',
  analisis_data:      'numerik',
  logika_formal:      'logika',
  logika_analisa:     'logika',
  logika_cerita:      'logika',
}

/**
 * Returns: topic string if it IS a section header, null to skip section, undefined if not a header.
 */
function detectSectionTopic(line: string): string | null | undefined {
  const l = line.toLowerCase().trim()
  if (/^tes padanan hubungan/.test(l) || /^(a\.|b\.|i\.|ii\.)\s*padanan/.test(l)) return 'analogi'
  if (/^tes sinonim/.test(l) || l === 'tes sinonim') return 'sinonim'
  if (/^tes antonim/.test(l)) return 'antonim'
  if (/^tes pengelompokan/.test(l)) return 'pengelompokan'
  if (/^tes aritmetik/.test(l)) return 'aritmetika'
  if (/^tes seri angka/.test(l)) return 'deret_bilangan'
  if (/^tes seri huruf/.test(l)) return 'deret_bilangan'
  if (/^tes logika angka/.test(l)) return 'logika_cerita'
  if (/^tes angka dalam cerita/.test(l)) return 'analisis_data'
  if (/^tes logika umum/.test(l)) return 'logika_formal'
  if (/^tes logika analisa/.test(l)) return 'logika_analisa'
  if (/^tes logika cerita/.test(l)) return 'logika_cerita'
  if (/^tes logika dengan diagram/.test(l) || /^tes logika diagram/.test(l)) return null // visual
  // TBS-specific
  if (/^tes persamaan kata/.test(l)) return 'sinonim'
  if (/^tes lawan kata/.test(l)) return 'antonim'
  if (/^tes padanan hubungan kata/.test(l)) return 'analogi'
  if (/^tes deret angka/.test(l)) return 'deret_bilangan'
  if (/^tes numerik/.test(l)) return 'aritmetika'
  if (/^logika analisa/.test(l)) return 'logika_analisa'
  if (/^a\. sinonim/.test(l)) return 'sinonim'
  if (/^b\. antonim/.test(l)) return 'antonim'
  if (/^c\. analogi/.test(l) || /^analogi/.test(l)) return 'analogi'
  return undefined
}

function detectMajorSection(line: string): MajorSection | null {
  const l = line.toLowerCase().trim()
  // "Tes Verbal" or "I. Tes Verbal" etc
  if (/^(i\.\s+)?tes verbal$/.test(l)) return 'verbal'
  // "Tes Angka" but NOT "Tes Angka Dalam Cerita"
  if (/^(ii\.\s+)?tes angka$/.test(l)) return 'angka'
  // "Tes Logika" but NOT subsections
  if (/^(iii\.\s+)?tes logika$/.test(l)) return 'logika'
  return null
}

function extractAnswerLetter(text: string): string | null {
  // Pattern 1: last occurrence of (A) through (E) in parentheses
  const parenMatches = [...text.matchAll(/\(([A-Ea-e])\)/g)]
  if (parenMatches.length > 0) {
    return parenMatches[parenMatches.length - 1][1].toUpperCase()
  }
  // Pattern 2: "Jawaban: X" or "Jawaban X" format (Bappenas)
  const jawabanMatch = text.match(/jawaban\s*:?\s*([A-Ea-e])\b/i)
  if (jawabanMatch) return jawabanMatch[1].toUpperCase()
  // Pattern 3: entire text is a single letter (TBS "KUNCI SOAL" format: "1. C")
  if (/^[A-Ea-e]$/.test(text.trim())) {
    return text.trim().toUpperCase()
  }
  // Pattern 4: short text ending with standalone letter
  const endMatch = text.match(/\b([A-Ea-e])\s*$/)
  if (endMatch && text.length < 5) {
    return endMatch[1].toUpperCase()
  }
  return null
}

function parsePDF(pdfPath: string): { questions: QuestionBlock[], answers: AnswerEntry[] } {
  const rawText = execSync(`pdftotext "${pdfPath}" -`, {
    maxBuffer: 20 * 1024 * 1024,
  }).toString()
  const lines = rawText.split('\n')

  const questions: QuestionBlock[] = []
  const answers: AnswerEntry[] = []

  let mode: 'questions' | 'answers' = 'questions'
  let majorSection: MajorSection = 'verbal'
  let currentTopic: string | null = 'analogi'
  let currentQuestion: QuestionBlock | null = null
  let lastOptionLetter: string | null = null

  let answerMajorSection: MajorSection = 'verbal'
  let currentAnswer: AnswerEntry | null = null

  const finalizeQuestion = () => {
    if (
      currentQuestion &&
      currentQuestion.topic &&
      currentQuestion.question.trim().length > 1 &&
      Object.keys(currentQuestion.options).length >= 4
    ) {
      // Normalize option keys to uppercase
      const normalizedOptions: Record<string, string> = {}
      for (const [k, v] of Object.entries(currentQuestion.options)) {
        normalizedOptions[k.toUpperCase()] = v.trim()
      }
      currentQuestion.options = normalizedOptions
      questions.push(currentQuestion)
    }
    currentQuestion = null
    lastOptionLetter = null
  }

  const finalizeAnswer = () => {
    if (currentAnswer && currentAnswer.explanation) {
      const letter = extractAnswerLetter(currentAnswer.explanation)
      if (letter) {
        currentAnswer.letter = letter
        // Clean explanation: remove trailing (LETTER) marker
        currentAnswer.explanation = currentAnswer.explanation
          .replace(/\s*\([A-Ea-e]\)\s*$/, '')
          .replace(/\s*\bJawaban[:\s]+[A-Ea-e]\s*$/i, '')
          .trim()
        answers.push({ ...currentAnswer })
      }
    }
    currentAnswer = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) continue

    // Skip standalone page numbers (just digits, no other content)
    if (/^\d{1,3}$/.test(line)) continue

    // Skip parenthetical page markers like "(76 Soal, Waktu: 50 Menit)"
    if (/^\(\d+\s+soal/i.test(line)) continue

    // Check for "Jawaban" header → switch to answers mode
    if (/^jawaban/i.test(line) && !line.match(/^jawaban[an]?\s+[a-e]\b/i)) {
      if (mode === 'questions') {
        finalizeQuestion()
        mode = 'answers'
      }
      finalizeAnswer()
      const l = line.toLowerCase()
      if (l.includes('verbal')) answerMajorSection = 'verbal'
      else if (l.includes('angka')) answerMajorSection = 'angka'
      else if (l.includes('logika')) answerMajorSection = 'logika'
      // "spasial" → we'll leave it but it won't match any questions
      continue
    }

    // "KUNCI SOAL" header (TBS format)
    if (/^kunci soal/i.test(line)) {
      if (mode === 'questions') {
        finalizeQuestion()
        mode = 'answers'
      }
      finalizeAnswer()
      answerMajorSection = 'misc'
      continue
    }

    if (mode === 'questions') {
      // Check major section header first
      const ms = detectMajorSection(line)
      if (ms) {
        finalizeQuestion()
        majorSection = ms
        continue
      }

      // Check subsection header
      const topicResult = detectSectionTopic(line)
      if (topicResult !== undefined) {
        finalizeQuestion()
        currentTopic = topicResult
        continue
      }

      // Skip lines that look like instructions or headers (no period/parens, all caps, long)
      if (/^[A-Z\s]{15,}$/.test(line) && !line.match(/^[A-E]\s*=/)) continue

      // Question start: "N. text" or "N) text"
      const qMatch = line.match(/^(\d+)[.)]\s+(.+)/)
      if (qMatch) {
        finalizeQuestion()
        if (currentTopic) {
          currentQuestion = {
            majorSection,
            topic: currentTopic,
            subtest: TOPIC_TO_SUBTEST[currentTopic] || 'verbal',
            number: parseInt(qMatch[1]),
            question: qMatch[2].trim(),
            options: {},
          }
          lastOptionLetter = null
        }
        continue
      }

      // Option: "A. text" or "a. text" or "A) text"
      const oMatch = line.match(/^([A-Ea-e])[.)]\s+(.+)/)
      if (oMatch && currentQuestion) {
        const letter = oMatch[1].toUpperCase()
        currentQuestion.options[letter] = oMatch[2].trim()
        lastOptionLetter = letter
        continue
      }

      // Standalone "(A)" style - skip
      if (/^\([A-Ea-e]\)$/.test(line)) continue

      // Continuation text
      if (currentQuestion) {
        if (lastOptionLetter) {
          currentQuestion.options[lastOptionLetter] += ' ' + line
        } else {
          currentQuestion.question += ' ' + line
        }
      }
    } else {
      // ANSWERS MODE

      // Sub-section headers within answer key (e.g., "Tes sinonim", "Tes logika cerita")
      // NOTE: do NOT change answerMajorSection here — only explicit "Jawaban..." headers should do that.
      const topicResult = detectSectionTopic(line)
      if (topicResult !== undefined) {
        finalizeAnswer()
        continue
      }

      // Answer entry start: "N. text"
      const aMatch = line.match(/^(\d+)[.)]\s+(.*)/)
      if (aMatch) {
        finalizeAnswer()
        currentAnswer = {
          majorSection: answerMajorSection,
          number: parseInt(aMatch[1]),
          letter: '',
          explanation: aMatch[2].trim(),
        }
        continue
      }

      // Continuation
      if (currentAnswer) {
        currentAnswer.explanation += ' ' + line
      }
    }
  }

  finalizeQuestion()
  finalizeAnswer()

  return { questions, answers }
}

interface MatchedQuestion {
  topic: string
  subtest: 'verbal' | 'numerik' | 'logika'
  question: string
  options: Record<string, string>
  answer: string
  explanation: string
}

function matchQuestionsToAnswers(
  questions: QuestionBlock[],
  answers: AnswerEntry[],
): MatchedQuestion[] {
  // Build answer lookup: key = "majorSection:number"
  const answerMap = new Map<string, AnswerEntry>()
  for (const a of answers) {
    const key = `${a.majorSection}:${a.number}`
    if (!answerMap.has(key)) answerMap.set(key, a)
  }

  const result: MatchedQuestion[] = []

  for (const q of questions) {
    if (!q.topic) continue
    const key = `${q.majorSection}:${q.number}`
    const answer = answerMap.get(key)

    if (!answer || !answer.letter) continue
    if (!['A', 'B', 'C', 'D', 'E'].includes(answer.letter)) continue
    if (!q.options[answer.letter]) continue

    // Must have all 5 options
    if (!q.options.A || !q.options.B || !q.options.C || !q.options.D || !q.options.E) continue

    result.push({
      topic: q.topic,
      subtest: q.subtest,
      question: q.question.trim(),
      options: q.options,
      answer: answer.letter,
      explanation: answer.explanation || `Jawaban: ${answer.letter}`,
    })
  }

  return result
}

async function insertQuestions(matched: MatchedQuestion[], source: string) {
  if (matched.length === 0) {
    console.log(`  [${source}] No questions to insert.`)
    return
  }

  // Group by topic for reporting
  const byTopic: Record<string, MatchedQuestion[]> = {}
  for (const q of matched) {
    byTopic[q.topic] = byTopic[q.topic] || []
    byTopic[q.topic].push(q)
  }

  for (const [topic, qs] of Object.entries(byTopic)) {
    console.log(`  [${source}] ${topic}: ${qs.length} questions to insert`)

    const rows = qs.map(q => ({
      subtest: q.subtest,
      topic: q.topic,
      question_type: 'text',
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      difficulty: 'medium',
      is_validated: true,
    }))

    const { error } = await supabase.from('questions').insert(rows)
    if (error) {
      console.error(`  [${source}] Insert error for ${topic}:`, error.message)
    } else {
      console.log(`  [${source}] Inserted ${rows.length} questions for ${topic}`)
    }
  }
}

// Topics that will be seeded from PDF — only these get cleared with --clear
const PDF_TOPICS = [
  'analogi', 'sinonim', 'antonim', 'pengelompokan',
  'aritmetika', 'deret_bilangan', 'logika_cerita', 'analisis_data', 'logika_formal', 'logika_analisa',
]

async function clearPdfTopics() {
  console.log('\nClearing existing questions for PDF-sourced topics...')
  for (const topic of PDF_TOPICS) {
    // Get question IDs first
    const { data: qs } = await supabase
      .from('questions')
      .select('id')
      .eq('topic', topic)
    const ids = (qs ?? []).map(q => q.id)

    if (ids.length > 0) {
      // Delete child rows first to avoid FK violation
      await supabase.from('drill_answers').delete().in('question_id', ids)
      await supabase.from('tryout_answers').delete().in('question_id', ids)
      await supabase.from('bookmarks').delete().in('question_id', ids)
    }

    const { error, count } = await supabase
      .from('questions')
      .delete({ count: 'exact' })
      .eq('topic', topic)
    if (error) console.error(`  Error clearing ${topic}:`, error.message)
    else console.log(`  Deleted ${count} rows for ${topic}`)
  }
}

// ─── Bappenas PDF Parser ─────────────────────────────────────────────────────
// Handles format: "N.\n\nQUESTION\na. opt\n..." with "Jawaban: X" answer key

const BAPPENAS_SECTIONS: Record<string, string> = {
  'sinonim': 'sinonim',
  'antonim': 'antonim',
  'analogi': 'analogi',
  'pengelompokkan kata': 'pengelompokan',
  'pengelompokan kata': 'pengelompokan',
  'pemahaman wacana': 'pemahaman_teks',
  'pemahaman bacaan': 'pemahaman_teks',
  'wacana': 'pemahaman_teks',
}

interface BapQuestion {
  topic: string
  number: number
  question: string
  options: Record<string, string>
}

interface BapAnswer {
  topic: string
  number: number
  explanation: string
  letter: string
}

function parseBappenasPDF(pdfPath: string): MatchedQuestion[] {
  const rawText = execSync(`pdftotext "${pdfPath}" -`, { maxBuffer: 20 * 1024 * 1024 }).toString()
  const lines = rawText.split('\n').map(l => l.trim())

  const questions: BapQuestion[] = []
  const answers: BapAnswer[] = []

  let mode: 'questions' | 'answers' = 'questions'
  let currentTopic: string | null = null
  let currentQuestion: BapQuestion | null = null
  let lastOptionLetter: string | null = null
  let pendingNumber: number | null = null  // for "N." alone on a line
  let currentAnswer: BapAnswer | null = null

  function detectBapSection(line: string): string | null {
    // "A. SINONIM" or "B. ANTONIM" etc.
    const m = line.match(/^[A-Fa-f]\.\s+(.+)/i)
    if (!m) return null
    const label = m[1].toLowerCase().trim()
    for (const [key, topic] of Object.entries(BAPPENAS_SECTIONS)) {
      if (label === key || label.startsWith(key)) return topic
    }
    return null
  }

  function finalizeQ() {
    if (
      currentQuestion &&
      currentQuestion.question.trim().length > 1 &&
      ['A', 'B', 'C', 'D', 'E'].every(k => currentQuestion!.options[k])
    ) {
      questions.push({ ...currentQuestion, question: currentQuestion.question.trim() })
    }
    currentQuestion = null
    lastOptionLetter = null
    pendingNumber = null
  }

  function finalizeA() {
    if (currentAnswer) {
      const letter = extractAnswerLetter(currentAnswer.explanation)
      if (letter) {
        currentAnswer.letter = letter
        currentAnswer.explanation = currentAnswer.explanation
          .replace(/\s*jawaban\s*:?\s*[A-Ea-e]\s*$/i, '')
          .replace(/\s*\([A-Ea-e]\)\s*$/, '')
          .trim()
        answers.push({ ...currentAnswer })
      }
    }
    currentAnswer = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // Skip page numbers and headers
    if (/^\d{1,3}$/.test(line)) continue
    if (/^(tes kemampuan|paket soal|tes tpa|tpa oto|bappenas)/i.test(line)) continue

    // Switch to answers mode at PEMBAHASAN
    if (/^pembahasan$/i.test(line)) {
      finalizeQ()
      mode = 'answers'
      finalizeA()
      currentTopic = null
      continue
    }

    // Section header detection (both modes)
    const secTopic = detectBapSection(line)
    if (secTopic !== null) {
      if (mode === 'questions') finalizeQ()
      else finalizeA()
      currentTopic = secTopic
      continue
    }

    // Also detect plain section headers in answer key like "A. SINONIM" already handled
    // Handle "TES KEMAMPUAN VERBAL" style headers in answer key
    if (mode === 'answers' && /^tes kemampuan/i.test(line)) continue

    if (mode === 'questions') {
      // Question number alone on line: "5."
      const numOnlyMatch = line.match(/^(\d+)\.\s*$/)
      if (numOnlyMatch && currentTopic) {
        finalizeQ()
        pendingNumber = parseInt(numOnlyMatch[1])
        continue
      }

      // Question number + text on same line: "10. LEKANG"
      const numTextMatch = line.match(/^(\d+)[.)]\s+([^a-e].{1,})/)
      if (numTextMatch && currentTopic && !line.match(/^(\d+)[.)]\s+[a-e][.)]/)) {
        finalizeQ()
        currentQuestion = {
          topic: currentTopic,
          number: parseInt(numTextMatch[1]),
          question: numTextMatch[2].trim(),
          options: {},
        }
        lastOptionLetter = null
        continue
      }

      // Option: "a. text" or "A. text"
      const oMatch = line.match(/^([A-Ea-e])[.)]\s+(.+)/)
      if (oMatch && currentQuestion) {
        const letter = oMatch[1].toUpperCase()
        currentQuestion.options[letter] = oMatch[2].trim()
        lastOptionLetter = letter
        continue
      }

      // Question text arriving after a pending number (e.g., "DISPARITAS" after "5.")
      if (pendingNumber !== null && currentTopic && !line.match(/^[A-Ea-e][.)]/)) {
        currentQuestion = {
          topic: currentTopic,
          number: pendingNumber,
          question: line,
          options: {},
        }
        pendingNumber = null
        lastOptionLetter = null
        continue
      }

      // Continuation text
      if (currentQuestion) {
        if (lastOptionLetter) {
          currentQuestion.options[lastOptionLetter] += ' ' + line
        } else {
          currentQuestion.question += ' ' + line
        }
      }
    } else {
      // ANSWERS MODE

      // "Jawaban: X" on its own line → append to current answer
      const jawLine = line.match(/^jawaban\s*:?\s*([A-Ea-e])$/i)
      if (jawLine && currentAnswer) {
        currentAnswer.explanation += ' Jawaban: ' + jawLine[1]
        continue
      }

      // Answer entry: "N. explanation text"
      const aMatch = line.match(/^(\d+)[.)]\s+(.*)/)
      if (aMatch && currentTopic) {
        finalizeA()
        currentAnswer = {
          topic: currentTopic,
          number: parseInt(aMatch[1]),
          explanation: aMatch[2].trim(),
          letter: '',
        }
        continue
      }

      // Continuation
      if (currentAnswer) {
        currentAnswer.explanation += ' ' + line
      }
    }
  }

  finalizeQ()
  finalizeA()

  // Match by topic:number
  const answerMap = new Map<string, BapAnswer>()
  for (const a of answers) {
    const key = `${a.topic}:${a.number}`
    if (!answerMap.has(key)) answerMap.set(key, a)
  }

  const result: MatchedQuestion[] = []
  for (const q of questions) {
    if (!q.topic) continue
    const key = `${q.topic}:${q.number}`
    const ans = answerMap.get(key)
    if (!ans || !ans.letter) continue
    if (!['A', 'B', 'C', 'D', 'E'].includes(ans.letter)) continue
    if (!q.options[ans.letter]) continue
    if (!['A', 'B', 'C', 'D', 'E'].every(k => q.options[k])) continue

    result.push({
      topic: q.topic,
      subtest: TOPIC_TO_SUBTEST[q.topic] || 'verbal',
      question: q.question,
      options: q.options,
      answer: ans.letter,
      explanation: ans.explanation || `Jawaban: ${ans.letter}`,
    })
  }

  return result
}

async function main() {
  const clearFirst = process.argv.includes('--clear')
  console.log('=== TPA Nasional — Seed Questions from PDF ===\n')
  if (clearFirst) await clearPdfTopics()

  const bankSoalDir = path.join(process.cwd(), 'bank_soal')

  // ─── Main PDF ────────────────────────────────────────────────────────────
  const mainPdf = path.join(bankSoalDir, 'soal-tes-potensi-akademik-beserta-kunci-jawaban.pdf')
  console.log('\nParsing main PDF...')
  const { questions: mainQ, answers: mainA } = parsePDF(mainPdf)
  console.log(`  Raw: ${mainQ.length} questions, ${mainA.length} answers`)

  const mainMatched = matchQuestionsToAnswers(mainQ, mainA)
  console.log(`  Matched: ${mainMatched.length} Q+A pairs`)
  await insertQuestions(mainMatched, 'main-pdf')

  // ─── TBS PDF ─────────────────────────────────────────────────────────────
  const tbsPdf = path.join(bankSoalDir, '779-adocpub-tes-bakat-skolastik-tbs.pdf')
  if (fs.existsSync(tbsPdf)) {
    console.log('\nParsing TBS PDF...')
    const { questions: tbsQ, answers: tbsA } = parsePDF(tbsPdf)
    console.log(`  Raw: ${tbsQ.length} questions, ${tbsA.length} answers`)

    for (const a of tbsA) a.majorSection = 'misc'
    for (const q of tbsQ) q.majorSection = 'misc'

    const tbsMatched = matchQuestionsToAnswers(tbsQ, tbsA)
    console.log(`  Matched: ${tbsMatched.length} Q+A pairs`)
    await insertQuestions(tbsMatched, 'tbs-pdf')
  } else {
    console.log('\nTBS PDF not found, skipping.')
  }

  // ─── Simulasi Bappenas PDF ────────────────────────────────────────────────
  const bappenasPdf = path.join(bankSoalDir, 'Simulasi-TPA-OTO-BAPPENAS.pdf')
  if (fs.existsSync(bappenasPdf)) {
    console.log('\nParsing Simulasi Bappenas PDF...')
    const bapMatched = parseBappenasPDF(bappenasPdf)
    console.log(`  Matched: ${bapMatched.length} Q+A pairs`)
    await insertQuestions(bapMatched, 'bappenas-pdf')
  } else {
    console.log('\nSimulasi Bappenas PDF not found, skipping.')
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('\n=== Done. DB counts ===')
  for (const topic of [...PDF_TOPICS, 'pemahaman_teks', 'operasi_matematika']) {
    const { count } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('topic', topic)
    console.log(`  ${topic}: ${count}`)
  }
}

main().catch(console.error)
