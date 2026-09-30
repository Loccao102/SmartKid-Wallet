import type { ExerciseFamilyDefinition, MathSkill } from './types'
import { createSeededRandom } from '../lib/seededRandom'

export interface SkillMasteryState {
  score: number
  attempts: number
  correctAttempts: number
  firstTryCorrect: number
  averageResponseTimeMs?: number
}

export type MasteryBySkill = Partial<Record<MathSkill, SkillMasteryState>>

export interface MasteryAttempt {
  correct: boolean
  attemptNumber: number
  responseTimeMs?: number
}

export const DEFAULT_MASTERY_SCORE = 50

export function getSkillMastery(
  mastery: MasteryBySkill,
  skill: MathSkill,
): SkillMasteryState {
  return mastery[skill] ?? {
    score: DEFAULT_MASTERY_SCORE,
    attempts: 0,
    correctAttempts: 0,
    firstTryCorrect: 0,
  }
}

export function updateSkillMastery(
  previous: SkillMasteryState,
  attempt: MasteryAttempt,
): SkillMasteryState {
  const target = attempt.correct
    ? attempt.attemptNumber === 1
      ? 100
      : 78
    : 20
  const alpha = previous.attempts < 10 ? 0.18 : 0.1
  const score = Math.max(
    0,
    Math.min(100, Math.round(previous.score * (1 - alpha) + target * alpha)),
  )
  const attempts = previous.attempts + 1
  const averageResponseTimeMs =
    attempt.responseTimeMs === undefined
      ? previous.averageResponseTimeMs
      : previous.averageResponseTimeMs === undefined
        ? attempt.responseTimeMs
        : Math.round(
            (previous.averageResponseTimeMs * previous.attempts +
              attempt.responseTimeMs) /
              attempts,
          )

  return {
    score,
    attempts,
    correctAttempts: previous.correctAttempts + Number(attempt.correct),
    firstTryCorrect:
      previous.firstTryCorrect +
      Number(attempt.correct && attempt.attemptNumber === 1),
    averageResponseTimeMs,
  }
}

export function meanMasteryForSkills(
  mastery: MasteryBySkill,
  skills: readonly MathSkill[],
) {
  if (skills.length === 0) return DEFAULT_MASTERY_SCORE
  return (
    skills.reduce(
      (sum, skill) => sum + getSkillMastery(mastery, skill).score,
      0,
    ) / skills.length
  )
}

function familyAttempts(
  family: ExerciseFamilyDefinition,
  mastery: MasteryBySkill,
) {
  if (family.skills.length === 0) return 0
  return (
    family.skills.reduce(
      (sum, skill) => sum + getSkillMastery(mastery, skill).attempts,
      0,
    ) / family.skills.length
  )
}

export type AdaptiveSelectionStrategy = 'support' | 'review' | 'challenge'

export interface AdaptiveFamilySelection {
  family: ExerciseFamilyDefinition
  strategy: AdaptiveSelectionStrategy
  masteryScore: number
}

export function selectAdaptiveExerciseFamily(
  families: ExerciseFamilyDefinition[],
  mastery: MasteryBySkill,
  recentFamilyIds: readonly string[],
  seed: number,
): AdaptiveFamilySelection {
  if (families.length === 0) {
    throw new Error('Cannot select an adaptive exercise from an empty family list.')
  }

  const random = createSeededRandom(seed)
  const recent = new Set(recentFamilyIds.slice(0, 2))
  const fresh = families.filter((family) => !recent.has(family.id))
  const candidates = fresh.length > 0 ? fresh : families
  const roll = random()
  const strategy: AdaptiveSelectionStrategy =
    roll < 0.6 ? 'support' : roll < 0.85 ? 'review' : 'challenge'

  const ranked = candidates
    .map((family) => ({
      family,
      masteryScore: meanMasteryForSkills(mastery, family.skills),
      attempts: familyAttempts(family, mastery),
      jitter: random() * 3,
    }))
    .sort((a, b) => {
      if (strategy === 'support') {
        return (
          a.masteryScore + a.family.difficulty * 2 + a.jitter -
          (b.masteryScore + b.family.difficulty * 2 + b.jitter)
        )
      }

      if (strategy === 'review') {
        return a.attempts + a.jitter - (b.attempts + b.jitter)
      }

      return (
        b.family.difficulty * 20 +
        b.masteryScore +
        b.jitter -
        (a.family.difficulty * 20 + a.masteryScore + a.jitter)
      )
    })

  return {
    family: ranked[0].family,
    strategy,
    masteryScore: ranked[0].masteryScore,
  }
}
