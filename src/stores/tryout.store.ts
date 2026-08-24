import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TryoutSessionState, Question } from '@/types'
import { TRYOUT_TOPIC_ORDER, TOPICS } from '@/lib/constants'

interface TryoutStore extends TryoutSessionState {
  initSession: (sessionId: string, questions: Record<string, Question[]>) => void
  setAnswer: (questionId: string, answer: string) => void
  setTimeRemaining: (time: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  goToQuestion: (index: number) => void
  completeTopic: () => void
  startNextTopic: () => void
  completeSession: () => void
  clearSession: () => void
}

const initialState: TryoutSessionState = {
  sessionId: '',
  questions: {},
  currentSubtestIndex: 0,
  currentTopicIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 15 * 60,
  status: 'active',
  nextTopicName: undefined,
}

export const useTryoutStore = create<TryoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession(sessionId, questions) {
        set({
          ...initialState,
          sessionId,
          questions,
          status: 'active',
          timeRemaining: 15 * 60,
        })
      },

      setAnswer(questionId, answer) {
        set(state => ({
          answers: { ...state.answers, [questionId]: answer },
        }))
      },

      setTimeRemaining(time) {
        set({ timeRemaining: time })
      },

      nextQuestion() {
        const { currentTopicIndex, currentQuestionIndex, questions } = get()
        const topic = TRYOUT_TOPIC_ORDER[currentTopicIndex]
        const topicQuestions = questions[topic] || []
        if (currentQuestionIndex < topicQuestions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 })
        }
      },

      prevQuestion() {
        const { currentQuestionIndex } = get()
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 })
        }
      },

      goToQuestion(index) {
        set({ currentQuestionIndex: index })
      },

      completeTopic() {
        const { currentTopicIndex } = get()
        const nextIndex = currentTopicIndex + 1

        if (nextIndex >= TRYOUT_TOPIC_ORDER.length) {
          set({ status: 'transitioning', nextTopicName: undefined })
          return
        }

        const nextTopic = TRYOUT_TOPIC_ORDER[nextIndex]
        const nextTopicConfig = TOPICS.find(t => t.id === nextTopic)
        set({
          status: 'transitioning',
          nextTopicName: nextTopicConfig?.label,
        })
      },

      startNextTopic() {
        const { currentTopicIndex } = get()
        const nextIndex = currentTopicIndex + 1

        if (nextIndex >= TRYOUT_TOPIC_ORDER.length) {
          set({ status: 'completed' })
          return
        }

        set({
          currentTopicIndex: nextIndex,
          currentQuestionIndex: 0,
          timeRemaining: 15 * 60,
          status: 'active',
          nextTopicName: undefined,
        })
      },

      completeSession() {
        set({ status: 'completed' })
      },

      clearSession() {
        set(initialState)
      },
    }),
    {
      name: 'tryout-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
