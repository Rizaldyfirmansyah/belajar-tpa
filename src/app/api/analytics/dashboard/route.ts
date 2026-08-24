import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TOPICS } from '@/lib/constants'
import { getTargetTime } from '@/lib/scoring'
import type { ApiResponse, DashboardMetrics, Subtest, Topic } from '@/types'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })

  // Completed sessions
  const { data: sessions } = await supabase
    .from('tryout_sessions')
    .select('id, score_final, score_verbal, score_numerik, score_penalaran, topic_accuracy, topic_avg_time, completed_at, attempt_number')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true })

  const { data: drillAnswers } = await supabase
    .from('drill_answers')
    .select('topic, subtest, is_correct, time_spent_sec')
    .eq('user_id', user.id)

  const { data: tryoutAnswers } = await supabase
    .from('tryout_answers')
    .select('topic, subtest, is_correct, time_spent_sec, session_id')
    .eq('user_id', user.id)

  const { data: streak } = await supabase
    .from('study_streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .single()

  // Total questions answered
  const totalDrill = drillAnswers?.length ?? 0
  const totalTryout = tryoutAnswers?.length ?? 0

  // Score trend
  const sessionList = sessions || []
  const scoreTrend = sessionList.map((s, i) => ({
    session: i + 1,
    score: s.score_final ?? 0,
    date: s.completed_at,
  }))

  // Topic accuracy aggregated from all sources
  const topicAccMap: Record<string, { correct: number; total: number }> = {}
  const topicSpeedMap: Record<string, { total: number; count: number }> = {}

  const allAnswers = [
    ...(drillAnswers || []).map(a => ({ ...a, is_correct: a.is_correct as boolean })),
    ...(tryoutAnswers || []).map(a => ({ ...a, is_correct: a.is_correct as boolean })),
  ]

  for (const a of allAnswers) {
    if (!topicAccMap[a.topic]) topicAccMap[a.topic] = { correct: 0, total: 0 }
    topicAccMap[a.topic].total++
    if (a.is_correct) topicAccMap[a.topic].correct++

    if (a.time_spent_sec) {
      if (!topicSpeedMap[a.topic]) topicSpeedMap[a.topic] = { total: 0, count: 0 }
      topicSpeedMap[a.topic].total += a.time_spent_sec
      topicSpeedMap[a.topic].count++
    }
  }

  const topicAccuracy = TOPICS.map(t => ({
    topic: t.id,
    label: t.label,
    accuracy: topicAccMap[t.id]
      ? topicAccMap[t.id].correct / topicAccMap[t.id].total
      : 0,
    subtest: t.subtest,
  })).sort((a, b) => a.accuracy - b.accuracy)

  const topicSpeed = TOPICS.map(t => ({
    topic: t.id,
    label: t.label,
    avgSec: topicSpeedMap[t.id]
      ? topicSpeedMap[t.id].total / topicSpeedMap[t.id].count
      : 0,
    targetSec: getTargetTime(t.id as Topic),
  }))

  // Subtest accuracy
  const subtestAcc: Record<Subtest, { correct: number; total: number }> = {
    verbal:    { correct: 0, total: 0 },
    numerik:   { correct: 0, total: 0 },
    penalaran: { correct: 0, total: 0 },
  }
  for (const a of allAnswers) {
    const sub = a.subtest as Subtest
    if (sub in subtestAcc) {
      subtestAcc[sub].total++
      if (a.is_correct) subtestAcc[sub].correct++
    }
  }

  const subtestAccuracy = {
    verbal:    subtestAcc.verbal.total    > 0 ? subtestAcc.verbal.correct    / subtestAcc.verbal.total    : 0,
    numerik:   subtestAcc.numerik.total   > 0 ? subtestAcc.numerik.correct   / subtestAcc.numerik.total   : 0,
    penalaran: subtestAcc.penalaran.total > 0 ? subtestAcc.penalaran.correct / subtestAcc.penalaran.total : 0,
  }

  // Hardest questions
  const questionErrorMap: Record<string, { correct: number; total: number; question?: string; topic?: string }> = {}
  for (const a of allAnswers) {
    const qId = (a as { question_id?: string }).question_id
    if (!qId) continue
    if (!questionErrorMap[qId]) questionErrorMap[qId] = { correct: 0, total: 0, topic: a.topic }
    questionErrorMap[qId].total++
    if (a.is_correct) questionErrorMap[qId].correct++
  }

  const lastScore = sessionList.length > 0 ? sessionList[sessionList.length - 1].score_final : undefined
  const prevScore = sessionList.length > 1 ? sessionList[sessionList.length - 2].score_final : undefined

  const metrics: DashboardMetrics = {
    lastScore: lastScore ?? undefined,
    lastScoreDiff: lastScore && prevScore ? lastScore - prevScore : undefined,
    totalSessions: sessionList.length,
    totalQuestions: totalDrill + totalTryout,
    currentStreak: streak?.current_streak ?? 0,
    scoreTrend,
    subtestAccuracy,
    topicAccuracy,
    topicSpeed,
    hardestQuestions: [],
  }

  return NextResponse.json<ApiResponse<DashboardMetrics>>({ data: metrics })
}
