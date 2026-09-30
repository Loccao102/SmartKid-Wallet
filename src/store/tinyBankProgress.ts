import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TinyBankLessonId } from '../data/tinyBank'

type TinyBankStars = Partial<Record<TinyBankLessonId, number>>

interface TinyBankProgressState {
  completedLessonIds: TinyBankLessonId[]
  bestStarsByLessonId: TinyBankStars
  runCountByLessonId: Partial<Record<TinyBankLessonId, number>>
  completeLesson: (lessonId: TinyBankLessonId, stars: number) => void
  nextRun: (lessonId: TinyBankLessonId) => number
  resetTinyBank: () => void
}

const initialState = {
  completedLessonIds: [] as TinyBankLessonId[],
  bestStarsByLessonId: {} as TinyBankStars,
  runCountByLessonId: {} as Partial<Record<TinyBankLessonId, number>>,
}

export const useTinyBankProgressStore = create<TinyBankProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeLesson: (lessonId, stars) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
          bestStarsByLessonId: {
            ...state.bestStarsByLessonId,
            [lessonId]: Math.max(
              state.bestStarsByLessonId[lessonId] ?? 0,
              stars,
            ),
          },
        })),

      nextRun: (lessonId) => {
        const next = (get().runCountByLessonId[lessonId] ?? 0) + 1
        set((state) => ({
          runCountByLessonId: {
            ...state.runCountByLessonId,
            [lessonId]: next,
          },
        }))
        return next
      },

      resetTinyBank: () => set(initialState),
    }),
    {
      name: 'smartkid-wallet-tiny-bank-v1',
      version: 1,
    },
  ),
)
