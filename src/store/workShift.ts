import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getWorkShiftById, workShiftInstances } from '../data/workShiftInstances'
import { createInitialWorkShiftProgress } from '../domain/workShiftEngine'
import type { WorkShiftProgress } from '../domain/types'

function createInitialProgressMap() {
  return Object.fromEntries(
    workShiftInstances.map((shift) => [
      shift.id,
      createInitialWorkShiftProgress(shift),
    ]),
  )
}

interface WorkShiftStore {
  progressByShiftId: Record<string, WorkShiftProgress>
  setProgress: (shiftId: string, progress: WorkShiftProgress) => void
  resetShift: (shiftId: string) => void
  resetAllShifts: () => void
}

export const useWorkShiftStore = create<WorkShiftStore>()(
  persist(
    (set) => ({
      progressByShiftId: createInitialProgressMap(),
      setProgress: (shiftId, progress) =>
        set((state) => ({
          progressByShiftId: {
            ...state.progressByShiftId,
            [shiftId]: progress,
          },
        })),
      resetShift: (shiftId) =>
        set((state) => ({
          progressByShiftId: {
            ...state.progressByShiftId,
            [shiftId]: createInitialWorkShiftProgress(getWorkShiftById(shiftId)),
          },
        })),
      resetAllShifts: () =>
        set({
          progressByShiftId: createInitialProgressMap(),
        }),
    }),
    {
      name: 'smartkid-wallet-work-shifts-v2',
    },
  ),
)
