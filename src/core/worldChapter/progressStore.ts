import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WorldChapterSavedRun {
  seed: number
  checkpoint: unknown
}

export interface WorldChapterProgressState<LessonId extends string> {
  completedLessonIds: LessonId[]
  bestStarsByLessonId: Partial<Record<LessonId, number>>
  runCountByLessonId: Partial<Record<LessonId, number>>
  savedRunsByLessonId: Partial<Record<LessonId, WorldChapterSavedRun>>
  saveRun: (lessonId: LessonId, seed: number, checkpoint: unknown) => void
  clearRun: (lessonId: LessonId) => void
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
    savedRunsByLessonId: {} as Partial<Record<LessonId, WorldChapterSavedRun>>,
  }

  return create<WorldChapterProgressState<LessonId>>()(
    persist(
      (set, get) => ({
        ...initialState,

        saveRun: (lessonId, seed, checkpoint) => set((state) => ({
          savedRunsByLessonId: { ...state.savedRunsByLessonId, [lessonId]: { seed, checkpoint } },
        })),
        clearRun: (lessonId) => set((state) => {
          const savedRunsByLessonId = { ...state.savedRunsByLessonId }
          delete savedRunsByLessonId[lessonId]
          return { savedRunsByLessonId }
        }),

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
        version: 2,
        // V1 stores have no in-flight runs; keep their completion and reward history.
        migrate: (persisted) => ({
          ...(persisted as object), savedRunsByLessonId: {},
        }),
      },
    ),
  )
}
