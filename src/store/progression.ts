import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StallId } from '../domain/types'

interface ProgressionState {
  completedByAssignment: Record<string, StallId[]>
  completeStall: (assignmentId: string, stallId: StallId) => void
  resetAssignment: (assignmentId: string) => void
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set) => ({
      completedByAssignment: {},
      completeStall: (assignmentId, stallId) =>
        set((state) => {
          const current = state.completedByAssignment[assignmentId] ?? []

          if (current.includes(stallId)) {
            return state
          }

          return {
            completedByAssignment: {
              ...state.completedByAssignment,
              [assignmentId]: [...current, stallId],
            },
          }
        }),
      resetAssignment: (assignmentId) =>
        set((state) => {
          const next = { ...state.completedByAssignment }
          delete next[assignmentId]
          return { completedByAssignment: next }
        }),
    }),
    { name: 'smartkid-wallet-progression-v2' },
  ),
)
