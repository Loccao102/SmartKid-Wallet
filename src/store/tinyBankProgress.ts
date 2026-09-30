import { createWorldChapterProgressStore } from '../core/worldChapter/progressStore'
import type { TinyBankLessonId } from '../data/tinyBank'

export const useTinyBankProgressStore =
  createWorldChapterProgressStore<TinyBankLessonId>(
    'smartkid-wallet-tiny-bank-v1',
  )
