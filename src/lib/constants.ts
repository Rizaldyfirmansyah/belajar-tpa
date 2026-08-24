import type { Subtest, Topic } from '@/types'

export const SUBTESTS: {
  id: Subtest
  label: string
  color: string
  bgColor: string
  borderColor: string
  comingSoon?: boolean
}[] = [
  { id: 'verbal',    label: 'Tes Kemampuan Verbal',    color: 'text-blue-600',    bgColor: 'bg-blue-50',    borderColor: 'border-blue-200' },
  { id: 'numerik',   label: 'Tes Kemampuan Numerik',   color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 'penalaran', label: 'Tes Kemampuan Penalaran', color: 'text-violet-600',  bgColor: 'bg-violet-50',  borderColor: 'border-violet-200' },
]

export const TOPICS: {
  id: Topic
  label: string
  subtest: Subtest
  totalPerTryout: number
  bankTarget: number
  durationMinutes: number
}[] = [
  // Verbal
  { id: 'sinonim',           label: 'Sinonim',             subtest: 'verbal',    totalPerTryout: 20, bankTarget: 100, durationMinutes: 10 },
  { id: 'antonim',           label: 'Antonim',             subtest: 'verbal',    totalPerTryout: 20, bankTarget: 100, durationMinutes: 10 },
  { id: 'analogi',           label: 'Analogi',             subtest: 'verbal',    totalPerTryout: 20, bankTarget: 100, durationMinutes: 10 },
  { id: 'pengelompokan_kata',label: 'Pengelompokan Kata',  subtest: 'verbal',    totalPerTryout: 15, bankTarget: 75,  durationMinutes: 10 },
  { id: 'pemahaman_wacana',  label: 'Pemahaman Wacana',    subtest: 'verbal',    totalPerTryout: 15, bankTarget: 75,  durationMinutes: 15 },
  // Numerik
  { id: 'deret',             label: 'Deret',               subtest: 'numerik',   totalPerTryout: 20, bankTarget: 100, durationMinutes: 15 },
  { id: 'matematika_berpola',label: 'Matematika Berpola',  subtest: 'numerik',   totalPerTryout: 20, bankTarget: 100, durationMinutes: 15 },
  { id: 'aritmetika_aljabar',label: 'Aritmetika & Aljabar',subtest: 'numerik',   totalPerTryout: 20, bankTarget: 100, durationMinutes: 15 },
  { id: 'cerita',            label: 'Cerita',              subtest: 'numerik',   totalPerTryout: 20, bankTarget: 100, durationMinutes: 20 },
  // Penalaran
  { id: 'penalaran_logis',   label: 'Penalaran Logis',     subtest: 'penalaran', totalPerTryout: 20, bankTarget: 100, durationMinutes: 15 },
  { id: 'penalaran_analitis',label: 'Penalaran Analitis',  subtest: 'penalaran', totalPerTryout: 20, bankTarget: 100, durationMinutes: 15 },
  { id: 'penalaran_gambar',  label: 'Penalaran Gambar',    subtest: 'penalaran', totalPerTryout: 20, bankTarget: 100, durationMinutes: 15 },
]

// Topics ordered for tryout: Verbal → Numerik → Penalaran
export const TRYOUT_TOPIC_ORDER: Topic[] = [
  'sinonim', 'antonim', 'analogi', 'pengelompokan_kata', 'pemahaman_wacana',
  'deret', 'matematika_berpola', 'aritmetika_aljabar', 'cerita',
  'penalaran_logis', 'penalaran_analitis', 'penalaran_gambar',
]

// Target seconds per question per topic
export const TARGET_TIMES: Record<Topic, number> = {
  sinonim:            30,
  antonim:            30,
  analogi:            30,
  pengelompokan_kata: 40,
  pemahaman_wacana:   60,
  deret:              45,
  matematika_berpola: 45,
  aritmetika_aljabar: 45,
  cerita:             60,
  penalaran_logis:    45,
  penalaran_analitis: 45,
  penalaran_gambar:   45,
}

export const SCORE_MIN = 200
export const SCORE_MAX = 800
export const PASSING_SCORE = 475

export const TOPIC_DURATION_SECONDS = 15 * 60

export function getTopicConfig(topic: Topic) {
  return TOPICS.find(t => t.id === topic)!
}

export function getSubtestConfig(subtest: Subtest) {
  return SUBTESTS.find(s => s.id === subtest)!
}

export function getTopicsBySubtest(subtest: Subtest) {
  return TOPICS.filter(t => t.subtest === subtest)
}
