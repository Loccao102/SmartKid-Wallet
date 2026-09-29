import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MapId, StallId } from '../domain/types'

type StallExerciseProgress = Partial<Record<StallId, string[]>>

interface ProgressionState {
  unlockedMaps: MapId[]
  unlockedStalls: StallId[]
  stallExerciseProgress: StallExerciseProgress
  completedMissionIds: string[]
  unlockMap: (mapId: MapId) => void
  unlockStall: (stallId: StallId) => void
  completeStallExercise: (stallId: StallId, familyId: string) => void
  completeMission: (missionId: string) => void
  resetProgression: () => void
}

const initialProgression = {
  unlockedMaps: ['smartmart'] as MapId[],
  unlockedStalls: [] as StallId[],
  stallExerciseProgress: {} as StallExerciseProgress,
  completedMissionIds: [] as string[],
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set) => ({
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
      resetProgression: () => set(initialProgression),
    }),
    { name: 'smartkid-wallet-progression-v4' },
  ),
)
