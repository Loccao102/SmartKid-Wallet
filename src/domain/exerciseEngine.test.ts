import { describe, expect, it } from 'vitest'
import { exerciseFamilies } from '../data/exerciseFamilies'
import { stalls } from '../data/stalls'
import { generateExercise, validateExerciseInstance } from './exerciseEngine'

describe('exercise engine', () => {
  it('replays the same exercise from the same student, family and variant', () => {
    const family = exerciseFamilies[0]
    const first = generateExercise(family, 'student-a', 0)
    const replay = generateExercise(family, 'student-a', 0)

    expect(replay).toEqual(first)
  })

  it('has three exercise families for every SmartMart stall', () => {
    expect(exerciseFamilies).toHaveLength(15)

    for (const stall of stalls) {
      const families = exerciseFamilies.filter((family) => family.stallId === stall.id)

      expect(stall.exerciseFamilyIds).toHaveLength(3)
      expect(families).toHaveLength(3)
      expect(new Set(families.map((family) => family.id))).toEqual(
        new Set(stall.exerciseFamilyIds),
      )
    }
  })

  it('creates valid integer answers across many seeded variants', () => {
    for (const family of exerciseFamilies) {
      for (let variant = 0; variant < 50; variant += 1) {
        const instance = generateExercise(family, 'student-a', variant)

        expect(validateExerciseInstance(instance)).toEqual([])
        expect(Number.isInteger(instance.answer)).toBe(true)
        expect(instance.answer).toBeGreaterThanOrEqual(0)
        expect(instance.prompt.length).toBeGreaterThan(20)
      }
    }
  })

  it('changes the seed when the student changes', () => {
    const family = exerciseFamilies[4]
    const studentA = generateExercise(family, 'student-a', 0)
    const studentB = generateExercise(family, 'student-b', 0)

    expect(studentA.seed).not.toBe(studentB.seed)
  })
})
