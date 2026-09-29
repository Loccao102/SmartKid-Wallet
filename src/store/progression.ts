import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StallId } from '../domain/types'

interface ProgressionState {
  completedStalls: StallId[]
  completeStall: (stallId: StallId) => void
  reset: () => void
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set) => ({
      completedStalls: [],
      completeStall: (stallId) =>
        set((state) => ({
          completedStalls: state.completedStalls.includes(stallId)
            ? state.completedStalls
            : [...state.completedStalls, stallId],
        })),
      reset: () => set({ completedStalls: [] }),
    }),
    { name: 'smartkid-wallet-progression-v1' },
  ),
)
