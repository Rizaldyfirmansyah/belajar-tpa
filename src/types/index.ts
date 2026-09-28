export type Subtest = 'verbal' | 'numerik' | 'penalaran'

export type Topic =
  | 'sinonim'
  | 'antonim'
  | 'analogi'
  | 'pengelompokan_kata'
  | 'pemahaman_wacana'
  | 'deret'
  | 'matematika_berpola'
  | 'aritmetika_aljabar'
  | 'cerita'
  | 'penalaran_logis'
  | 'penalaran_analitis'
  | 'penalaran_gambar'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'text' | 'image' | 'visual'

// Visual question types (legacy — kept for type compatibility)
export type Shape =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'pentagon'
  | 'hexagon'
  | 'arrow'
  | 'cylinder'
  | 'cross'

export type Fill = 'outline' | 'solid' | 'half' | 'dotted'

export type Inner =
  | 'circle'
  | 'star'
  | 'cross'
  | 'dot'
  | 'crescent'
  | 'triangle'
  | 'square'
  | null

export type Rotation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315

export type Size = 'small' | 'medium' | 'large'

export interface ShapeDescriptor {
  shape: Shape
  fill: Fill
  inner?: Inner
  rotation?: Rotation
  size?: Size
  dots?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  tail?: 'single' | 'double'
  id?: string
}

export interface VisualData {
  type: 'odd_one_out' | 'sequence' | 'matrix' | 'mirror'
  question: string
  items?: ShapeDescriptor[]
  sequence?: ShapeDescriptor[]
  grid?: (ShapeDescriptor | null)[][]
  source?: ShapeDescriptor
  options: Record<'A' | 'B' | 'C' | 'D' | 'E', ShapeDescriptor>
  answer: 'A' | 'B' | 'C' | 'D' | 'E'
  explanation: string
}

export interface Question {
  id: string
  subtest: Subtest
  topic: Topic
  question_type: QuestionType
  question?: string
  options?: Record<'A' | 'B' | 'C' | 'D' | 'E', string>
  answer?: string
  explanation?: string
  difficulty?: Difficulty
  image_url?: string
  options_images?: Partial<Record<'A' | 'B' | 'C' | 'D' | 'E', string>>
  explanation_image_url?: string
  visual_data?: VisualData
  is_validated: boolean
  created_at: string
}

export interface Profile {
  id: string
  name: string
  target_score: number
  is_admin?: boolean
  created_at: string
  updated_at: string
}

export interface TryoutSession {
  id: string
  user_id: string
  status: 'in_progress' | 'completed'
  score_verbal?: number
  score_numerik?: number
  score_penalaran?: number
  score_final?: number
  topic_scores?: Record<string, number>
  topic_accuracy?: Record<string, number>
  topic_avg_time?: Record<string, number>
  ai_summary?: string
  ai_generated_at?: string
  started_at: string
  completed_at?: string
  duration_seconds?: number
  attempt_number: number
}

export interface TryoutAnswer {
  id: string
  session_id: string
  question_id: string
  user_answer?: string
  is_correct?: boolean
  subtest: string
  topic: string
  time_spent_sec?: number
  answered_at?: string
}

export interface DrillAnswer {
  id: string
  user_id: string
  question_id: string
  user_answer: string
  is_correct: boolean
  topic: string
  subtest: string
  time_spent_sec?: number
  answered_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  question_id: string
  created_at: string
  question?: Question
}

export interface StudyStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity?: string
}

export interface AiAnalysisCache {
  user_id: string
  analysis_text: string
  generated_at: string
  expires_at: string
}

// Dashboard metrics
export interface DashboardMetrics {
  userName: string
  targetScore: number
  testDate: string | null
  lastScore?: number
  lastScoreDiff?: number
  totalSessions: number
  totalQuestions: number
  currentStreak: number
  scoreTrend: { session: number; score: number; date: string }[]
  subtestAccuracy: Record<Subtest, number>
  topicAccuracy: { topic: string; label: string; accuracy: number; subtest: Subtest }[]
  topicSpeed: { topic: string; label: string; avgSec: number; targetSec: number }[]
  hardestQuestions: {
    question_id: string
    question: string
    topic: string
    error_rate: number
  }[]
}

// Tryout session state (Zustand)
export interface TryoutSessionState {
  sessionId: string
  questions: Record<string, Question[]>
  currentSubtestIndex: number
  currentTopicIndex: number
  currentQuestionIndex: number
  answers: Record<string, string>
  timeRemaining: number
  status: 'active' | 'transitioning' | 'completed'
  nextTopicName?: string
}

// API response shape
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}
