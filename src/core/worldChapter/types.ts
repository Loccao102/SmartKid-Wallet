import type { MapId } from '../../domain/types'

export interface WorldChapterQuestion {
  id: string
  prompt: string
  answer: number
  unit: string
  hint: string
}

export interface WorldChapterLessonDefinition<LessonId extends string = string> {
  id: LessonId
  title: string
  subtitle: string
  description: string
  skillLabel: string
  xpReward: number
}

export interface WorldChapterDefinition<LessonId extends string = string> {
  mapId: MapId
  version: number
  lessonOrder: readonly LessonId[]
  finalLessonId: LessonId
  finalMinStars: number
  seedBase: number
  chapterXpReward: number
  chapterCoinReward: number
}

export interface WorldChapterCompletionOutcome {
  passed: boolean
  completesChapter: boolean
  activityId: string
  lessonRewardKey: string
  chapterRewardKey: string
}
