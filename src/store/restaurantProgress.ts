import { createWorldChapterProgressStore } from '../core/worldChapter/progressStore'
import type { RestaurantLessonId } from '../data/happyRestaurant'

export const useRestaurantProgressStore =
  createWorldChapterProgressStore<RestaurantLessonId>(
    'smartkid-wallet-happy-restaurant-v1',
  )
