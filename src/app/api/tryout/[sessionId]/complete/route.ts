import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeTopicScores, calculateSubtestScore, calculateFinalScore } from '@/lib/scoring'
import type { ApiResponse, Topic } from '@/types'

export async function POST(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = params

  const { data: session } = await supabase
    .from('tryout_sessions')
    .select('id, status, started_at')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json<ApiResponse>({ error: 'Session not found' }, { status: 404 })

  // Get all answers
  const { data: answers } = await supabase
    .from('tryout_answers')
    .select('topic, is_correct, time_spent_sec')
    .eq('session_id', sessionId)

  if (!answers) return NextResponse.json<ApiResponse>({ error: 'No answers found' }, { status: 404 })

  const validAnswers = answers.filter(a => a.is_correct !== null)

  const { topicScores, topicAccuracy, topicAvgTime } = computeTopicScores(
    validAnswers.map(a => ({
      topic: a.topic as Topic,
      is_correct: a.is_correct as boolean,
      time_spent_sec: a.time_spent_sec,
    }))
  )

  const scoreVerbal = calculateSubtestScore(topicScores, 'verbal')
  const scoreNumerik = calculateSubtestScore(topicScores, 'numerik')
  const scorePenalaran = calculateSubtestScore(topicScores, 'penalaran')
  const scoreFinal = calculateFinalScore(scoreVerbal, scoreNumerik, scorePenalaran)

  const completedAt = new Date().toISOString()
  const durationSeconds = Math.round(
    (new Date(completedAt).getTime() - new Date(session.started_at).getTime()) / 1000
  )

  const { error } = await supabase
    .from('tryout_sessions')
    .update({
      status: 'completed',
      score_verbal: scoreVerbal,
      score_numerik: scoreNumerik,
      score_penalaran: scorePenalaran,
      score_final: scoreFinal,
      topic_scores: topicScores,
      topic_accuracy: topicAccuracy,
      topic_avg_time: topicAvgTime,
      completed_at: completedAt,
      duration_seconds: durationSeconds,
    })
    .eq('id', sessionId)

  if (error) return NextResponse.json<ApiResponse>({ error: error.message }, { status: 500 })

  // Update study streak
  const today = new Date().toISOString().slice(0, 10)
  const { data: streak } = await supabase
    .from('study_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  let newCurrent = 1
  if (streak && streak.last_activity === yesterday) {
    newCurrent = (streak.current_streak || 0) + 1
  }
  if (!streak || streak.last_activity !== today) {
    await supabase.from('study_streaks').upsert({
      user_id: user.id,
      current_streak: newCurrent,
      longest_streak: Math.max(streak?.longest_streak || 0, newCurrent),
      last_activity: today,
    })
  }

  return NextResponse.json<ApiResponse<{ scoreFinal: number }>>({ data: { scoreFinal } })
}
