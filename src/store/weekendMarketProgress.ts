import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WeekendMarketLessonId } from '../data/weekendMarket'

interface WeekendMarketProgressState {
  completedLessonIds: WeekendMarketLessonId[]
  bestStarsByLessonId: Partial<Record<WeekendMarketLessonId, number>>
  runCountByLessonId: Partial<Record<WeekendMarketLessonId, number>>
  completeLesson: (lessonId: WeekendMarketLessonId, stars: number) => void
  nextRun: (lessonId: WeekendMarketLessonId) => number
  resetWeekendMarket: () => void
}

const initialState = {
  completedLessonIds: [] as WeekendMarketLessonId[],
  bestStarsByLessonId: {} as Partial<Record<WeekendMarketLessonId, number>>,
  runCountByLessonId: {} as Partial<Record<WeekendMarketLessonId, number>>,
}

export const useWeekendMarketProgressStore =
  create<WeekendMarketProgressState>()(
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
        resetWeekendMarket: () => set(initialState),
      }),
      {
        name: 'smartkid-wallet-weekend-market-v1',
        version: 1,
      },
    ),
  )
