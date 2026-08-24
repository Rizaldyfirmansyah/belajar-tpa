import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

const bodySchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string().length(1),
  timeSpentSec: z.number().int().min(0).default(0),
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

  const { questionId, answer, timeSpentSec } = parsed.data

  // Get question to check answer and topic
  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('id, topic, subtest, answer')
    .eq('id', questionId)
    .single()

  if (qError || !question) {
    return NextResponse.json<ApiResponse>({ error: 'Question not found' }, { status: 404 })
  }

  const isCorrect = question.answer === answer

  const { error } = await supabase.from('drill_answers').insert({
    user_id: user.id,
    question_id: questionId,
    user_answer: answer,
    is_correct: isCorrect,
    topic: question.topic,
    subtest: question.subtest,
    time_spent_sec: timeSpentSec,
  })

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  // Update study streak
  await updateStreak(supabase, user.id)

  return NextResponse.json<ApiResponse<{ isCorrect: boolean; correctAnswer: string }>>({
    data: { isCorrect, correctAnswer: question.answer },
  })
}

async function updateStreak(supabase: ReturnType<typeof import('@/lib/supabase/server').createClient>, userId: string) {
  const today = new Date().toISOString().slice(0, 10)

  const { data: streak } = await supabase
    .from('study_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    await supabase.from('study_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity: today,
    })
    return
  }

  const lastActivity = streak.last_activity
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  if (lastActivity === today) return

  let newCurrent = 1
  if (lastActivity === yesterday) {
    newCurrent = (streak.current_streak || 0) + 1
  }

  await supabase.from('study_streaks').upsert({
    user_id: userId,
    current_streak: newCurrent,
    longest_streak: Math.max(streak.longest_streak || 0, newCurrent),
    last_activity: today,
  })
}
