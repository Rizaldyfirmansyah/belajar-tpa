import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateTextQuestions } from '@/lib/groq/generators/text'
import type { ApiResponse, Topic, Subtest } from '@/types'
import { getTopicConfig } from '@/lib/constants'

const bodySchema = z.object({
  topic: z.string(),
  count: z.number().int().min(1).max(25).default(10),
})

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ error: 'Invalid body' }, { status: 400 })
  }

  const { topic, count } = parsed.data
  const topicConfig = getTopicConfig(topic as Topic)
  if (!topicConfig) {
    return NextResponse.json<ApiResponse>({ error: 'Invalid topic' }, { status: 400 })
  }

  const questions = await generateTextQuestions(topic as Topic, count)

  if (questions.length === 0) {
    return NextResponse.json<ApiResponse>({ error: 'No questions generated' }, { status: 422 })
  }

  const admin = createAdminClient()
  const rows = questions.map(q => ({
    subtest: topicConfig.subtest as Subtest,
    topic: topic as Topic,
    question_type: 'text',
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    is_validated: true,
  }))

  const { data, error } = await admin.from('questions').insert(rows).select('id')

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse<{ inserted: number }>>({ data: { inserted: data?.length ?? 0 } })
}
