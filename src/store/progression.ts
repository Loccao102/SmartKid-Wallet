import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  applyXpGain,
  STARTING_COINS,
  type XpGainResult,
} from '../domain/progression'
import type { MapId, StallId } from '../domain/types'

type StallExerciseProgress = Partial<Record<StallId, string[]>>

export interface ActivityBestResult {
  bestStars: number
  bestScore: number
  attempts: number
  bestTimeMs?: number
}

interface ProgressionState {
  unlockedMaps: MapId[]
  unlockedStalls: StallId[]
  stallExerciseProgress: StallExerciseProgress
  completedMissionIds: string[]
  completedWorldChapterIds: MapId[]

  level: number
  levelXp: number
  totalXp: number
  coins: number
  rewardedContentIds: string[]
  claimedChallengeIds: string[]
  activityResults: Record<string, ActivityBestResult>

  unlockMap: (mapId: MapId) => void
  unlockStall: (stallId: StallId) => void
  completeStallExercise: (stallId: StallId, familyId: string) => void
  completeMission: (missionId: string) => void
  completeWorldChapter: (mapId: MapId) => void

  awardXp: (amount: number) => XpGainResult
  awardXpOnce: (rewardKey: string, amount: number) => XpGainResult | null
  earnCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  claimChallengeReward: (challengeId: string, amount: number) => boolean
  awardCoinsOnce: (rewardKey: string, amount: number) => boolean
  recordActivityResult: (
    activityId: string,
    stars: number,
    score: number,
    elapsedMs?: number,
  ) => void

  resetProgression: () => void
}

const initialProgression = {
  unlockedMaps: ['smartmart'] as MapId[],
  unlockedStalls: [] as StallId[],
  stallExerciseProgress: {} as StallExerciseProgress,
  completedMissionIds: [] as string[],
  completedWorldChapterIds: [] as MapId[],
  level: 1,
  levelXp: 0,
  totalXp: 0,
  coins: STARTING_COINS,
  rewardedContentIds: [] as string[],
  claimedChallengeIds: [] as string[],
  activityResults: {} as Record<string, ActivityBestResult>,
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      ...initialProgression,

      unlockMap: (mapId) =>
        set((state) =>
          state.unlockedMaps.includes(mapId)
            ? state
            : { unlockedMaps: [...state.unlockedMaps, mapId] },
        ),

      unlockStall: (stallId) =>
        set((state) =>
          state.unlockedStalls.includes(stallId)
            ? state
            : { unlockedStalls: [...state.unlockedStalls, stallId] },
        ),

      completeStallExercise: (stallId, familyId) =>
        set((state) => {
          const completed = state.stallExerciseProgress[stallId] ?? []

          if (completed.includes(familyId)) return state

          return {
            stallExerciseProgress: {
              ...state.stallExerciseProgress,
              [stallId]: [...completed, familyId],
            },
          }
        }),

      completeMission: (missionId) =>
        set((state) =>
          state.completedMissionIds.includes(missionId)
            ? state
            : { completedMissionIds: [...state.completedMissionIds, missionId] },
        ),

      completeWorldChapter: (mapId) =>
        set((state) =>
          state.completedWorldChapterIds.includes(mapId)
            ? state
            : {
                completedWorldChapterIds: [
                  ...state.completedWorldChapterIds,
                  mapId,
                ],
              },
        ),

      awardXp: (amount) => {
        const state = get()
        const next = applyXpGain(state, amount)
        set({
          level: next.level,
          levelXp: next.levelXp,
          totalXp: next.totalXp,
          coins: next.coins,
        })
        return next
      },

      awardXpOnce: (rewardKey, amount) => {
        const state = get()
        if (state.rewardedContentIds.includes(rewardKey)) return null

        const next = applyXpGain(state, amount)
        set({
          level: next.level,
          levelXp: next.levelXp,
          totalXp: next.totalXp,
          coins: next.coins,
          rewardedContentIds: [...state.rewardedContentIds, rewardKey],
        })
        return next
      },

      earnCoins: (amount) =>
        set((state) => ({
          coins: state.coins + Math.max(0, Math.round(amount)),
        })),

      spendCoins: (amount) => {
        const cost = Math.max(0, Math.round(amount))
        const state = get()
        if (state.coins < cost) return false
        set({ coins: state.coins - cost })
        return true
      },

      claimChallengeReward: (challengeId, amount) => {
        const state = get()
        if (state.claimedChallengeIds.includes(challengeId)) return false
        set({
          coins: state.coins + Math.max(0, Math.round(amount)),
          claimedChallengeIds: [...state.claimedChallengeIds, challengeId],
        })
        return true
      },

      awardCoinsOnce: (rewardKey, amount) => {
        const state = get()
        if (state.claimedChallengeIds.includes(rewardKey)) return false
        set({
          coins: state.coins + Math.max(0, Math.round(amount)),
          claimedChallengeIds: [
            ...state.claimedChallengeIds,
            rewardKey,
          ],
        })
        return true
      },

      recordActivityResult: (activityId, stars, score, elapsedMs) =>
        set((state) => {
          const previous = state.activityResults[activityId]
          const next: ActivityBestResult = {
            bestStars: Math.max(previous?.bestStars ?? 0, stars),
            bestScore: Math.max(previous?.bestScore ?? 0, score),
            attempts: (previous?.attempts ?? 0) + 1,
            bestTimeMs:
              elapsedMs === undefined
                ? previous?.bestTimeMs
                : previous?.bestTimeMs === undefined
                  ? elapsedMs
                  : Math.min(previous.bestTimeMs, elapsedMs),
          }

          return {
            activityResults: {
              ...state.activityResults,
              [activityId]: next,
            },
          }
        }),

      resetProgression: () => set(initialProgression),
    }),
    {
      name: 'smartkid-wallet-progression-v4',
      version: 1,
      migrate: (persisted) => ({
        ...initialProgression,
        ...(persisted as Partial<ProgressionState>),
        level:
          typeof (persisted as Partial<ProgressionState>)?.level === 'number'
            ? (persisted as Partial<ProgressionState>).level!
            : 1,
        coins:
          typeof (persisted as Partial<ProgressionState>)?.coins === 'number'
            ? (persisted as Partial<ProgressionState>).coins!
            : STARTING_COINS,
        completedWorldChapterIds:
          Array.isArray(
            (persisted as Partial<ProgressionState>)?.completedWorldChapterIds,
          )
            ? (persisted as Partial<ProgressionState>).completedWorldChapterIds!
            : [],
      }),
    },
  ),
)
