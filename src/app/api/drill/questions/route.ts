import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, Question } from '@/types'

const querySchema = z.object({
  topic: z.string(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  exclude: z.string().optional(),
})

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ error: 'Invalid params' }, { status: 400 })
  }

  const { topic, limit, exclude } = parsed.data
  const excludeIds = exclude ? exclude.split(',').filter(Boolean) : []

  let query = supabase
    .from('questions')
    .select('*')
    .eq('topic', topic)
    .limit(limit * 3)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  const shuffled = (data as Question[]).sort(() => Math.random() - 0.5).slice(0, limit)

  return NextResponse.json<ApiResponse<Question[]>>({ data: shuffled })
}
