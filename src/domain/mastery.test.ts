import { describe, expect, it } from 'vitest'
import { exerciseFamilies } from '../data/exerciseFamilies'
import {
  getSkillMastery,
  selectAdaptiveExerciseFamily,
  updateSkillMastery,
  type MasteryBySkill,
} from './mastery'

describe('mastery engine', () => {
  it('raises mastery more for first-try success and lowers it after mistakes', () => {
    const base = getSkillMastery({}, 'subtraction')
    const firstTry = updateSkillMastery(base, {
      correct: true,
      attemptNumber: 1,
      responseTimeMs: 10000,
    })
    const wrong = updateSkillMastery(base, {
      correct: false,
      attemptNumber: 1,
      responseTimeMs: 10000,
    })
    const recovered = updateSkillMastery(base, {
      correct: true,
      attemptNumber: 3,
      responseTimeMs: 10000,
    })

    expect(firstTry.score).toBeGreaterThan(base.score)
    expect(wrong.score).toBeLessThan(base.score)
    expect(firstTry.score).toBeGreaterThan(recovered.score)
  })

  it('avoids the two most recent families when alternatives exist', () => {
    const families = exerciseFamilies.filter((item) => item.stallId === 'produce')
    const selected = selectAdaptiveExerciseFamily(
      families,
      {},
      [families[0].id, families[1].id],
      12345,
    )

    expect([families[0].id, families[1].id]).not.toContain(selected.family.id)
  })

  it('support strategy can focus a weak skill profile', () => {
    const families = exerciseFamilies.filter((item) => item.stallId === 'promotion')
    const mastery: MasteryBySkill = {
      percentage: { score: 25, attempts: 6, correctAttempts: 2, firstTryCorrect: 1 },
      comparison: { score: 80, attempts: 8, correctAttempts: 7, firstTryCorrect: 6 },
      subtraction: { score: 82, attempts: 8, correctAttempts: 7, firstTryCorrect: 6 },
      multiplication: { score: 78, attempts: 7, correctAttempts: 6, firstTryCorrect: 5 },
      addition: { score: 79, attempts: 7, correctAttempts: 6, firstTryCorrect: 5 },
    }

    const selections = Array.from({ length: 30 }, (_, index) =>
      selectAdaptiveExerciseFamily(families, mastery, [], index + 1),
    )

    expect(
      selections.filter((item) => item.family.skills.includes('percentage')).length,
    ).toBeGreaterThan(20)
  })
})
