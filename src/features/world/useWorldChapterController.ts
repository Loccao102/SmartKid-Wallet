import { useState } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import {
  createChapterRunSeed,
  getWorldChapterCompletionOutcome,
  isChapterLessonUnlocked,
} from '../../core/worldChapter/runtime'
import type {
  WorldChapterDefinition,
  WorldChapterLessonDefinition,
} from '../../core/worldChapter/types'
import type { WorldChapterProgressState } from '../../core/worldChapter/progressStore'
import { useProgressionStore } from '../../store/progression'

export function useWorldChapterController<LessonId extends string>({
  chapter,
  lessons,
  progressStore,
  resumeRuns = false,
}: {
  chapter: WorldChapterDefinition<LessonId>
  lessons: readonly WorldChapterLessonDefinition<LessonId>[]
  progressStore: UseBoundStore<StoreApi<WorldChapterProgressState<LessonId>>>
  resumeRuns?: boolean
}) {
  const completedLessonIds = progressStore(
    (state) => state.completedLessonIds,
  )
  const bestStarsByLessonId = progressStore(
    (state) => state.bestStarsByLessonId,
  )
  const nextRun = progressStore((state) => state.nextRun)
  const completeLesson = progressStore((state) => state.completeLesson)
  const savedRunsByLessonId = progressStore((state) => state.savedRunsByLessonId)
  const saveRun = progressStore((state) => state.saveRun)
  const clearRun = progressStore((state) => state.clearRun)

  const awardXpOnce = useProgressionStore((state) => state.awardXpOnce)
  const awardCoinsOnce = useProgressionStore(
    (state) => state.awardCoinsOnce,
  )
  const recordActivityResult = useProgressionStore(
    (state) => state.recordActivityResult,
  )
  const completeWorldChapter = useProgressionStore(
    (state) => state.completeWorldChapter,
  )
  const completedWorldChapterIds = useProgressionStore(
    (state) => state.completedWorldChapterIds,
  )

  const [activeLessonId, setActiveLessonId] =
    useState<LessonId | null>(null)
  const [runSeed, setRunSeed] = useState(1)

  const chapterCompleted = completedWorldChapterIds.includes(chapter.mapId)

  const startLesson = (lessonId: LessonId) => {
    if (!isChapterLessonUnlocked(chapter, lessonId, completedLessonIds)) return
    const saved = resumeRuns ? savedRunsByLessonId[lessonId] : undefined
    if (saved && Number.isSafeInteger(saved.seed)) {
      setRunSeed(saved.seed)
      setActiveLessonId(lessonId)
      return
    }
    const runNumber = nextRun(lessonId)
    const seed = createChapterRunSeed(chapter, lessonId, runNumber)
    setRunSeed(seed)
    if (resumeRuns) saveRun(lessonId, seed, null)
    setActiveLessonId(lessonId)
  }

  const finishLesson = (lessonId: LessonId, stars: number) => {
    const lesson = lessons.find((item) => item.id === lessonId)
    if (!lesson) {
      throw new Error(
        `Missing lesson "${lessonId}" in chapter "${chapter.mapId}"`,
      )
    }

    const outcome = getWorldChapterCompletionOutcome(
      chapter,
      lessonId,
      stars,
    )

    recordActivityResult(
      outcome.activityId,
      stars,
      stars * 20,
    )
    if (resumeRuns) clearRun(lessonId)

    if (!outcome.passed) return outcome

    completeLesson(lessonId, stars)
    awardXpOnce(outcome.lessonRewardKey, lesson.xpReward)

    if (outcome.completesChapter) {
      completeWorldChapter(chapter.mapId)
      awardXpOnce(outcome.chapterRewardKey, chapter.chapterXpReward)
      awardCoinsOnce(
        outcome.chapterRewardKey,
        chapter.chapterCoinReward,
      )
    }

    return outcome
  }

  const isLessonUnlocked = (lessonId: LessonId) =>
    isChapterLessonUnlocked(
      chapter,
      lessonId,
      completedLessonIds,
    )

  return {
    activeLessonId,
    setActiveLessonId,
    runSeed,
    chapterCompleted,
    completedLessonIds,
    bestStarsByLessonId,
    startLesson,
    finishLesson,
    isLessonUnlocked,
    savedRunsByLessonId,
    checkpoint: activeLessonId ? savedRunsByLessonId[activeLessonId]?.checkpoint : undefined,
    saveCheckpoint: (checkpoint: unknown) => {
      if (resumeRuns && activeLessonId) saveRun(activeLessonId, runSeed, checkpoint)
    },
  }
}
