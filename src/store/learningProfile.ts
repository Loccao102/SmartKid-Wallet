import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MathSkill, StallId } from '../domain/types'
import {
  getSkillMastery,
  meanMasteryForSkills,
  updateSkillMastery,
  type MasteryBySkill,
} from '../domain/mastery'

const MAX_RECENT_EXERCISES = 6
const MAX_RECENT_WORK_SHIFTS = 12

interface LearningProfileState {
  masteryBySkill: MasteryBySkill
  recentExerciseFamilyIdsByStall: Partial<Record<StallId, string[]>>
  practiceSequenceByStall: Partial<Record<StallId, number>>
  recentWorkFingerprintsByKey: Record<string, string[]>

  recordMathAttempt: (
    skills: readonly MathSkill[],
    correct: boolean,
    attemptNumber: number,
    responseTimeMs?: number,
  ) => { beforeMean: number; afterMean: number }
  rememberExerciseFamily: (stallId: StallId, familyId: string) => void
  nextPracticeSequence: (stallId: StallId) => number
  rememberWorkFingerprint: (key: string, fingerprint: string) => void
  resetLearningProfile: () => void
}

const initialState = {
  masteryBySkill: {} as MasteryBySkill,
  recentExerciseFamilyIdsByStall: {} as Partial<Record<StallId, string[]>>,
  practiceSequenceByStall: {} as Partial<Record<StallId, number>>,
  recentWorkFingerprintsByKey: {} as Record<string, string[]>,
}

export const useLearningProfileStore = create<LearningProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordMathAttempt: (skills, correct, attemptNumber, responseTimeMs) => {
        const before = get().masteryBySkill
        const beforeMean = meanMasteryForSkills(before, skills)
        const next = { ...before }

        for (const skill of new Set(skills)) {
          next[skill] = updateSkillMastery(getSkillMastery(before, skill), {
            correct,
            attemptNumber,
            responseTimeMs,
          })
        }

        set({ masteryBySkill: next })

        return {
          beforeMean,
          afterMean: meanMasteryForSkills(next, skills),
        }
      },

      rememberExerciseFamily: (stallId, familyId) =>
        set((state) => {
          const current = state.recentExerciseFamilyIdsByStall[stallId] ?? []
          return {
            recentExerciseFamilyIdsByStall: {
              ...state.recentExerciseFamilyIdsByStall,
              [stallId]: [
                familyId,
                ...current.filter((id) => id !== familyId),
              ].slice(0, MAX_RECENT_EXERCISES),
            },
          }
        }),

      nextPracticeSequence: (stallId) => {
        const next = (get().practiceSequenceByStall[stallId] ?? 0) + 1
        set((state) => ({
          practiceSequenceByStall: {
            ...state.practiceSequenceByStall,
            [stallId]: next,
          },
        }))
        return next
      },

      rememberWorkFingerprint: (key, fingerprint) =>
        set((state) => {
          const current = state.recentWorkFingerprintsByKey[key] ?? []
          return {
            recentWorkFingerprintsByKey: {
              ...state.recentWorkFingerprintsByKey,
              [key]: [
                fingerprint,
                ...current.filter((item) => item !== fingerprint),
              ].slice(0, MAX_RECENT_WORK_SHIFTS),
            },
          }
        }),

      resetLearningProfile: () => set(initialState),
    }),
    {
      name: 'smartkid-wallet-learning-profile-v1',
    },
  ),
)
