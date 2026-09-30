import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WorldChapterProgressState<LessonId extends string> {
  completedLessonIds: LessonId[]
  bestStarsByLessonId: Partial<Record<LessonId, number>>
  runCountByLessonId: Partial<Record<LessonId, number>>
  completeLesson: (lessonId: LessonId, stars: number) => void
  nextRun: (lessonId: LessonId) => number
  resetChapter: () => void
}

export function createWorldChapterProgressStore<LessonId extends string>(
  storageName: string,
) {
  const initialState = {
    completedLessonIds: [] as LessonId[],
    bestStarsByLessonId: {} as Partial<Record<LessonId, number>>,
    runCountByLessonId: {} as Partial<Record<LessonId, number>>,
  }

  return create<WorldChapterProgressState<LessonId>>()(
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

        resetChapter: () => set(initialState),
      }),
      {
        name: storageName,
        version: 1,
      },
    ),
  )
}
