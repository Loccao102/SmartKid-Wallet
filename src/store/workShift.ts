import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { traineeShift } from '../data/workShift'
import { createInitialShiftMetrics } from '../domain/workShiftEngine'
import type {
  WorkShiftCustomerProgress,
  WorkShiftProgress,
} from '../domain/types'

const createCustomerProgress = (): WorkShiftCustomerProgress => ({
  totalSolved: false,
  changeSolved: false,
  totalAttempts: 0,
  changeAttempts: 0,
})

const createInitialProgress = (): WorkShiftProgress => ({
  shiftId: traineeShift.id,
  customerIndex: 0,
  customerProgress: Object.fromEntries(
    traineeShift.customers.map((customer) => [customer.id, createCustomerProgress()]),
  ),
  metrics: createInitialShiftMetrics(traineeShift),
  completed: false,
})

interface WorkShiftStore {
  progress: WorkShiftProgress
  setProgress: (progress: WorkShiftProgress) => void
  resetShift: () => void
}

export const useWorkShiftStore = create<WorkShiftStore>()(
  persist(
    (set) => ({
      progress: createInitialProgress(),
      setProgress: (progress) => set({ progress }),
      resetShift: () => set({ progress: createInitialProgress() }),
    }),
    { name: 'smartkid-wallet-work-shift-v1' },
  ),
)
