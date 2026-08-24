import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

const bodySchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string().length(1),
  timeSpentSec: z.number().int().min(0).default(0),
})

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = params

  // Verify session ownership
  const { data: session } = await supabase
    .from('tryout_sessions')
    .select('id, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session || session.status !== 'in_progress') {
    return NextResponse.json<ApiResponse>({ error: 'Session not found or not active' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ error: 'Invalid body' }, { status: 400 })
  }

  const { questionId, answer, timeSpentSec } = parsed.data

  // Get correct answer
  const { data: question } = await supabase
    .from('questions')
    .select('answer')
    .eq('id', questionId)
    .single()

  if (!question) {
    return NextResponse.json<ApiResponse>({ error: 'Question not found' }, { status: 404 })
  }

  const isCorrect = question.answer === answer

  // Update tryout answer
  const { error } = await supabase
    .from('tryout_answers')
    .update({
      user_answer: answer,
      is_correct: isCorrect,
      time_spent_sec: timeSpentSec,
      answered_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('question_id', questionId)

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  return NextResponse.json<ApiResponse<{ isCorrect: boolean }>>({ data: { isCorrect } })
}
