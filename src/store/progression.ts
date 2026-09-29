import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MapId, StallId } from '../domain/types'

interface ProgressionState {
  unlockedMaps: MapId[]
  unlockedStalls: StallId[]
  completedMissionIds: string[]
  unlockMap: (mapId: MapId) => void
  unlockStall: (stallId: StallId) => void
  completeMission: (missionId: string) => void
  resetProgression: () => void
}

const initialProgression = {
  unlockedMaps: ['smartmart'] as MapId[],
  unlockedStalls: [] as StallId[],
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
      completeMission: (missionId) =>
        set((state) =>
          state.completedMissionIds.includes(missionId)
            ? state
            : { completedMissionIds: [...state.completedMissionIds, missionId] },
        ),
      resetProgression: () => set(initialProgression),
    }),
    { name: 'smartkid-wallet-progression-v3' },
  ),
)
