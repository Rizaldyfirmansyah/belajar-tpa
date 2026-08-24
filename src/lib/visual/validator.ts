import type { VisualData } from '@/types'

export function validateVisualQuestion(q: VisualData): boolean {
  if (!q.type || !q.question || !q.answer || !q.explanation) return false
  if (!q.options || Object.keys(q.options).length !== 5) return false

  const validAnswers = ['A', 'B', 'C', 'D', 'E']
  if (!validAnswers.includes(q.answer)) return false

  if (!(q.answer in q.options)) return false

  if (q.type === 'odd_one_out' && (!q.items || q.items.length < 2)) return false
  if (q.type === 'sequence' && (!q.sequence || q.sequence.length < 2)) return false
  if (q.type === 'matrix' && (!q.grid || q.grid.length === 0)) return false
  if (q.type === 'mirror' && !q.source) return false

  return true
}
