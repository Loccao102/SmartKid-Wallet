import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RestaurantLessonId } from '../data/happyRestaurant'

interface RestaurantProgressState {
  completedLessonIds: RestaurantLessonId[]
  bestStarsByLessonId: Partial<Record<RestaurantLessonId, number>>
  runCountByLessonId: Partial<Record<RestaurantLessonId, number>>
  completeLesson: (lessonId: RestaurantLessonId, stars: number) => void
  nextRun: (lessonId: RestaurantLessonId) => number
  resetRestaurant: () => void
}

const initialState = {
  completedLessonIds: [] as RestaurantLessonId[],
  bestStarsByLessonId: {} as Partial<Record<RestaurantLessonId, number>>,
  runCountByLessonId: {} as Partial<Record<RestaurantLessonId, number>>,
}

export const useRestaurantProgressStore =
  create<RestaurantProgressState>()(
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
        resetRestaurant: () => set(initialState),
      }),
      {
        name: 'smartkid-wallet-happy-restaurant-v1',
        version: 1,
      },
    ),
  )
