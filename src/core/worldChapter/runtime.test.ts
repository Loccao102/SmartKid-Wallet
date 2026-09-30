import { describe, expect, it } from 'vitest'
import {
  createChapterRunSeed,
  getWorldChapterCompletionOutcome,
  isChapterLessonUnlocked,
  scoreProceduralQuiz,
} from './runtime'
import { resolveWorldUnlockState } from './unlock'
import type { WorldChapterDefinition } from './types'
import type { WorldMapDefinition } from '../../domain/types'

type LessonId = 'a' | 'b' | 'final'

const chapter: WorldChapterDefinition<LessonId> = {
  mapId: 'tiny-bank',
  version: 1,
  lessonOrder: ['a', 'b', 'final'],
  finalLessonId: 'final',
  finalMinStars: 3,
  seedBase: 1000,
  chapterXpReward: 80,
  chapterCoinReward: 80,
}

describe('World Chapter Core', () => {
  it('keeps replay seeds deterministic and lesson-specific', () => {
    expect(createChapterRunSeed(chapter, 'a', 1)).toBe(
      createChapterRunSeed(chapter, 'a', 1),
    )
    expect(createChapterRunSeed(chapter, 'a', 1)).not.toBe(
      createChapterRunSeed(chapter, 'a', 2),
    )
    expect(createChapterRunSeed(chapter, 'a', 1)).not.toBe(
      createChapterRunSeed(chapter, 'b', 1),
    )
  })

  it('unlocks sequential lessons and gates the final lesson on all core lessons', () => {
    expect(isChapterLessonUnlocked(chapter, 'a', [])).toBe(true)
    expect(isChapterLessonUnlocked(chapter, 'b', [])).toBe(false)
    expect(isChapterLessonUnlocked(chapter, 'b', ['a'])).toBe(true)
    expect(isChapterLessonUnlocked(chapter, 'final', ['a'])).toBe(false)
    expect(isChapterLessonUnlocked(chapter, 'final', ['a', 'b'])).toBe(true)
  })

  it('uses one shared procedural quiz star curve', () => {
    expect(scoreProceduralQuiz(0)).toBe(5)
    expect(scoreProceduralQuiz(1)).toBe(4)
    expect(scoreProceduralQuiz(3)).toBe(3)
    expect(scoreProceduralQuiz(7)).toBe(2)
  })

  it('only completes a final chapter when it reaches the minimum stars', () => {
    expect(
      getWorldChapterCompletionOutcome(chapter, 'final', 2)
        .completesChapter,
    ).toBe(false)
    expect(
      getWorldChapterCompletionOutcome(chapter, 'final', 3)
        .completesChapter,
    ).toBe(true)
    expect(
      getWorldChapterCompletionOutcome(chapter, 'a', 5).completesChapter,
    ).toBe(false)
  })

  it('resolves map prerequisites in one place', () => {
    const map: WorldMapDefinition = {
      id: 'happy-restaurant',
      order: 3,
      name: 'Restaurant',
      shortName: 'Restaurant',
      description: 'test',
      status: 'available',
      unlockLevel: 8,
      prerequisiteMapId: 'tiny-bank',
      theme: 'restaurant',
      artworkKey: 'test',
    }

    expect(
      resolveWorldUnlockState(map, {
        level: 7,
        completedMissionIds: [],
        completedWorldChapterIds: ['tiny-bank'],
      }).playable,
    ).toBe(false)

    expect(
      resolveWorldUnlockState(map, {
        level: 8,
        completedMissionIds: [],
        completedWorldChapterIds: [],
      }).playable,
    ).toBe(false)

    expect(
      resolveWorldUnlockState(map, {
        level: 8,
        completedMissionIds: [],
        completedWorldChapterIds: ['tiny-bank'],
      }).playable,
    ).toBe(true)
  })
})
