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
}: {
  chapter: WorldChapterDefinition<LessonId>
  lessons: readonly WorldChapterLessonDefinition<LessonId>[]
  progressStore: UseBoundStore<StoreApi<WorldChapterProgressState<LessonId>>>
}) {
  const completedLessonIds = progressStore(
    (state) => state.completedLessonIds,
  )
  const bestStarsByLessonId = progressStore(
    (state) => state.bestStarsByLessonId,
  )
  const nextRun = progressStore((state) => state.nextRun)
  const completeLesson = progressStore((state) => state.completeLesson)

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
    const runNumber = nextRun(lessonId)
    setRunSeed(createChapterRunSeed(chapter, lessonId, runNumber))
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
  }
}
