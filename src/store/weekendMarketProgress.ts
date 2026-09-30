import { createWorldChapterProgressStore } from '../core/worldChapter/progressStore'
import type { WeekendMarketLessonId } from '../data/weekendMarket'

export const useWeekendMarketProgressStore =
  createWorldChapterProgressStore<WeekendMarketLessonId>(
    'smartkid-wallet-weekend-market-v1',
  )
