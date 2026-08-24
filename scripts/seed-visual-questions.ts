/**
 * Seed script — generates visual questions programmatically and inserts to Supabase.
 * Run: npx tsx scripts/seed-visual-questions.ts
 *
 * Prerequisites:
 * - .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv'
config({ path: '.env' })

import { createClient } from '@supabase/supabase-js'
import { generateOddOneOut, generateSequence, generateMatrix, generateMirror } from '../src/lib/visual/generator'
import { validateVisualQuestion } from '../src/lib/visual/validator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BANK_TARGET = 100
const PER_TYPE = Math.ceil(BANK_TARGET / 4) // 25 per type

async function main() {
  console.log('=== TPA Nasional Seed Script — Visual/Spasial Questions ===\n')

  // Check existing
  const { count: existing } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic', 'spasial')

  const needed = BANK_TARGET - (existing ?? 0)
  if (needed <= 0) {
    console.log(`Already has ${existing} visual questions. Skipping.`)
    return
  }

  console.log(`Generating ${needed} visual questions...`)

  const generators = [
    { name: 'odd_one_out', gen: generateOddOneOut },
    { name: 'sequence', gen: generateSequence },
    { name: 'matrix', gen: generateMatrix },
    { name: 'mirror', gen: generateMirror },
  ]

  const allRows: object[] = []

  for (const { name, gen } of generators) {
    const count = Math.ceil(needed / 4)
    console.log(`  Generating ${count} ${name} questions...`)
    let validCount = 0

    for (let i = 0; i < count * 2 && validCount < count; i++) {
      const q = gen()
      if (validateVisualQuestion(q)) {
        allRows.push({
          subtest: 'spasial',
          topic: 'spasial',
          question_type: 'visual',
          question: q.question,
          answer: q.answer,
          explanation: q.explanation,
          visual_data: q,
          is_validated: true,
        })
        validCount++
      }
    }

    console.log(`  ${name}: generated ${validCount} valid questions`)
  }

  console.log(`\nInserting ${allRows.length} visual questions...`)

  const batchSize = 25
  let inserted = 0

  for (let i = 0; i < allRows.length; i += batchSize) {
    const batch = allRows.slice(i, i + batchSize)
    const { error } = await supabase.from('questions').insert(batch)

    if (error) {
      console.error('Insert error:', error.message)
    } else {
      inserted += batch.length
      console.log(`  Inserted ${inserted}/${allRows.length}`)
    }
  }

  console.log(`\n=== Done! Inserted ${inserted} visual questions ===`)
}

main().catch(console.error)
