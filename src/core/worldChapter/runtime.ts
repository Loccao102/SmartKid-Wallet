import type {
  WorldChapterCompletionOutcome,
  WorldChapterDefinition,
} from './types'

export function scoreProceduralQuiz(mistakes: number) {
  if (mistakes === 0) return 5
  if (mistakes <= 2) return 4
  if (mistakes <= 4) return 3
  return 2
}

export function createChapterRunSeed<LessonId extends string>(
  chapter: WorldChapterDefinition<LessonId>,
  lessonId: LessonId,
  runNumber: number,
) {
  const lessonIndex = chapter.lessonOrder.indexOf(lessonId)
  if (lessonIndex < 0) {
    throw new Error(
      `Unknown lesson "${lessonId}" in chapter "${chapter.mapId}"`,
    )
  }

  return (
    chapter.seedBase +
    runNumber * 7919 +
    lessonIndex * 104729
  )
}

export function isChapterLessonUnlocked<LessonId extends string>(
  chapter: WorldChapterDefinition<LessonId>,
  lessonId: LessonId,
  completedLessonIds: readonly LessonId[],
) {
  const index = chapter.lessonOrder.indexOf(lessonId)
  if (index < 0) return false
  if (index === 0) return true

  if (lessonId === chapter.finalLessonId) {
    return chapter.lessonOrder
      .filter((id) => id !== chapter.finalLessonId)
      .every((id) => completedLessonIds.includes(id))
  }

  return completedLessonIds.includes(chapter.lessonOrder[index - 1])
}

export function getWorldChapterCompletionOutcome<LessonId extends string>(
  chapter: WorldChapterDefinition<LessonId>,
  lessonId: LessonId,
  stars: number,
): WorldChapterCompletionOutcome {
  const isFinal = lessonId === chapter.finalLessonId
  const passed = !isFinal || stars >= chapter.finalMinStars

  return {
    passed,
    completesChapter: isFinal && passed,
    activityId:
      `${chapter.mapId}:${lessonId}:v${chapter.version}`,
    lessonRewardKey:
      `${chapter.mapId}:${lessonId}:v${chapter.version}`,
    chapterRewardKey:
      `${chapter.mapId}:chapter:v${chapter.version}`,
  }
}
