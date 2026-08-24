import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePostTestSummary } from '@/lib/groq/analyzers/postTest'
import type { ApiResponse, TryoutSession, TryoutAnswer, Question } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = params

  const { data: session } = await supabase
    .from('tryout_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json<ApiResponse>({ error: 'Session not found' }, { status: 404 })

  // Get answers with question data
  const { data: answers } = await supabase
    .from('tryout_answers')
    .select('*, questions(*)')
    .eq('session_id', sessionId)

  // Generate AI summary if not done
  if (!session.ai_summary && session.status === 'completed') {
    try {
      const summary = await generatePostTestSummary({
        score_final: session.score_final,
        score_verbal: session.score_verbal,
        score_numerik: session.score_numerik,
        score_penalaran: session.score_penalaran,
        topic_accuracy: session.topic_accuracy || {},
        topic_avg_time: session.topic_avg_time || {},
        attempt_number: session.attempt_number,
      })

      await supabase
        .from('tryout_sessions')
        .update({ ai_summary: summary, ai_generated_at: new Date().toISOString() })
        .eq('id', sessionId)

      session.ai_summary = summary
    } catch (_err) {
      // Non-fatal: proceed without AI summary
    }
  }

  return NextResponse.json<ApiResponse<{ session: TryoutSession; answers: (TryoutAnswer & { questions: Question })[] }>>({
    data: { session, answers: answers as (TryoutAnswer & { questions: Question })[] || [] },
  })
}
