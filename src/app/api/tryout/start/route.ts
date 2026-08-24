import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TOPICS, TRYOUT_TOPIC_ORDER } from '@/lib/constants'
import type { ApiResponse, Question, Topic } from '@/types'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  // Count existing sessions
  const { count } = await supabase
    .from('tryout_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const attemptNumber = (count ?? 0) + 1

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from('tryout_sessions')
    .insert({
      user_id: user.id,
      status: 'in_progress',
      attempt_number: attemptNumber,
    })
    .select('id')
    .single()

  if (sessionError || !session) {
    return NextResponse.json<ApiResponse>({ error: 'Failed to create session' }, { status: 500 })
  }

  // Fetch questions for all topics
  const questionsByTopic: Record<string, Question[]> = {}

  for (const topicId of TRYOUT_TOPIC_ORDER) {
    const topicConfig = TOPICS.find(t => t.id === topicId)!

    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('topic', topicId)
      .limit(topicConfig.totalPerTryout * 5)

    const shuffled = ((questions as Question[]) || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, topicConfig.totalPerTryout)

    questionsByTopic[topicId] = shuffled

    // Pre-create empty answer rows for this session
    if (shuffled.length > 0) {
      await supabase.from('tryout_answers').insert(
        shuffled.map(q => ({
          session_id: session.id,
          question_id: q.id,
          subtest: topicConfig.subtest,
          topic: topicId,
          user_answer: null,
          is_correct: null,
        }))
      )
    }
  }

  return NextResponse.json<ApiResponse<{ sessionId: string; questions: Record<string, Question[]> }>>({
    data: { sessionId: session.id, questions: questionsByTopic },
  })
}
