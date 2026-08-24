import { SCORE_MIN, SCORE_MAX, PASSING_SCORE, TOPICS } from './constants'
import type { Subtest, Topic } from '@/types'

export function calculateScaledScore(correct: number, total: number): number {
  if (total === 0) return SCORE_MIN
  const raw = (correct / total) * 100
  const scaled = SCORE_MIN + (raw / 100) * (SCORE_MAX - SCORE_MIN)
  return Math.round(scaled)
}

export function calculateSubtestScore(topicScores: Record<string, number>, subtest: Subtest): number {
  const subtestTopics = TOPICS.filter(t => t.subtest === subtest).map(t => t.id)
  const scores = subtestTopics
    .filter(topic => topic in topicScores)
    .map(topic => topicScores[topic])

  if (scores.length === 0) return SCORE_MIN
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export function calculateFinalScore(verbal: number, numerik: number, penalaran: number): number {
  return Math.round((verbal + numerik + penalaran) / 3)
}

export function isPassing(score: number): boolean {
  return score >= PASSING_SCORE
}

export function getScoreColor(score: number): string {
  if (score >= PASSING_SCORE) return 'text-green-600'
  if (score >= 400) return 'text-amber-600'
  return 'text-red-600'
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.7) return 'text-green-600'
  if (accuracy >= 0.5) return 'text-amber-600'
  return 'text-red-600'
}

export function getAccuracyBgColor(accuracy: number): string {
  if (accuracy >= 0.7) return 'bg-green-100 text-green-700'
  if (accuracy >= 0.5) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

export function formatScore(score: number): string {
  return score.toString()
}

export function getTargetTime(topic: Topic): number {
  const topicConfig = TOPICS.find(t => t.id === topic)
  if (!topicConfig) return 36
  return Math.floor((topicConfig.durationMinutes * 60) / topicConfig.totalPerTryout)
}

export function computeTopicScores(
  answers: { topic: Topic; is_correct: boolean; time_spent_sec?: number }[]
): {
  topicScores: Record<string, number>
  topicAccuracy: Record<string, number>
  topicAvgTime: Record<string, number>
} {
  const grouped: Record<string, { correct: number; total: number; totalTime: number }> = {}

  for (const answer of answers) {
    if (!grouped[answer.topic]) {
      grouped[answer.topic] = { correct: 0, total: 0, totalTime: 0 }
    }
    grouped[answer.topic].total++
    if (answer.is_correct) grouped[answer.topic].correct++
    grouped[answer.topic].totalTime += answer.time_spent_sec ?? 0
  }

  const topicScores: Record<string, number> = {}
  const topicAccuracy: Record<string, number> = {}
  const topicAvgTime: Record<string, number> = {}

  for (const [topic, data] of Object.entries(grouped)) {
    const topicConfig = TOPICS.find(t => t.id === topic)
    if (!topicConfig) continue
    topicScores[topic] = calculateScaledScore(data.correct, topicConfig.totalPerTryout)
    topicAccuracy[topic] = data.total > 0 ? data.correct / data.total : 0
    topicAvgTime[topic] = data.total > 0 ? data.totalTime / data.total : 0
  }

  return { topicScores, topicAccuracy, topicAvgTime }
}
