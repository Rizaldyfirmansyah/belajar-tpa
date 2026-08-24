import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, Question } from '@/types'

const querySchema = z.object({
  topic: z.string().optional(),
  subtest: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  exclude: z.string().optional(),
  question_type: z.enum(['text', 'visual']).optional(),
})

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ error: 'Invalid query params' }, { status: 400 })
  }

  const { topic, subtest, limit, exclude, question_type } = parsed.data

  let query = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit * 2) // fetch extra for random sampling

  if (topic) query = query.eq('topic', topic)
  if (subtest) query = query.eq('subtest', subtest)
  if (question_type) query = query.eq('question_type', question_type)

  const excludeIds = exclude ? exclude.split(',').filter(Boolean) : []
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  // Randomly sample up to `limit` questions
  const shuffled = (data as Question[]).sort(() => Math.random() - 0.5).slice(0, limit)

  return NextResponse.json<ApiResponse<Question[]>>({ data: shuffled })
}
