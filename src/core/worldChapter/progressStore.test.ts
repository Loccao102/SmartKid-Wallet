import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createWorldChapterProgressStore } from './progressStore'
import { restoreQuizProgress } from './quizProgress'

const entries = new Map<string, string>()
beforeEach(() => {
  entries.clear()
  vi.stubGlobal('window', { localStorage: {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  } })
})
afterEach(() => vi.unstubAllGlobals())

describe('chapter resumable runs', () => {
  it('migrates v1 completion, stars and replay count without resetting them', () => {
    entries.set('chapter-test', JSON.stringify({ version: 1, state: {
      completedLessonIds: ['a'], bestStarsByLessonId: { a: 5 }, runCountByLessonId: { a: 3 },
    } }))
    const state = createWorldChapterProgressStore<'a'>('chapter-test').getState()
    expect(state.completedLessonIds).toEqual(['a'])
    expect(state.bestStarsByLessonId.a).toBe(5)
    expect(state.runCountByLessonId.a).toBe(3)
    expect(state.savedRunsByLessonId).toEqual({})
  })
  it('restores seed, answer, retries and question position in a fresh store', () => {
    const store = createWorldChapterProgressStore<'a' | 'b'>('chapter-test')
    const checkpoint = { index: 1, answer: '25000', mistakes: 2, feedback: 'hint' as const }
    store.getState().nextRun('a')
    store.getState().saveRun('a', 20261003, checkpoint)
    store.getState().saveRun('b', 20261004, { choiceIds: ['balanced'], reviewing: true })
    const fresh = createWorldChapterProgressStore<'a' | 'b'>('chapter-test')
    expect(fresh.getState().savedRunsByLessonId.a).toEqual({ seed: 20261003, checkpoint })
    expect(restoreQuizProgress(fresh.getState().savedRunsByLessonId.a?.checkpoint, 3)).toEqual(checkpoint)
    fresh.getState().clearRun('a')
    expect(fresh.getState().savedRunsByLessonId.a).toBeUndefined()
    expect(fresh.getState().savedRunsByLessonId.b?.seed).toBe(20261004)
    expect(fresh.getState().runCountByLessonId.a).toBe(1)
  })
  it('clears in-flight runs on chapter reset and keeps best stars on replay', () => {
    const store = createWorldChapterProgressStore<'a'>('chapter-test')
    store.getState().completeLesson('a', 5)
    store.getState().completeLesson('a', 3)
    expect(store.getState().bestStarsByLessonId.a).toBe(5)
    store.getState().saveRun('a', 1, {})
    store.getState().resetChapter()
    expect(store.getState().savedRunsByLessonId).toEqual({})
    expect(store.getState().completedLessonIds).toEqual([])
  })
  it('recovers malformed or out-of-range quiz checkpoints', () => {
    for (const bad of [null, { index: 3, answer: '10', mistakes: 0 }, { index: 0, answer: '10', mistakes: -1 }, { index: 0, answer: 10, mistakes: 0 }]) {
      expect(restoreQuizProgress(bad, 3)).toEqual({ index: 0, answer: '', mistakes: 0, feedback: null })
    }
  })
})
