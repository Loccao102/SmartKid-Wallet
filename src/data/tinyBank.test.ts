import { describe, expect, it } from 'vitest'
import {
  createTinyBankMission,
  createTinyBankQuiz,
  scoreTinyBankMission,
} from './tinyBank'

describe('Tiny Bank generators', () => {
  it('generates deterministic but seed-varying saving questions', () => {
    const first = createTinyBankQuiz('saving-goal', 101)
    const same = createTinyBankQuiz('saving-goal', 101)
    const other = createTinyBankQuiz('saving-goal', 202)

    expect(first).toEqual(same)
    expect(first.map((item) => item.prompt)).not.toEqual(
      other.map((item) => item.prompt),
    )
    expect(first).toHaveLength(3)
    expect(first.every((item) => item.answer > 0)).toBe(true)
  })

  it('keeps balance questions non-negative and solvable', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const questions = createTinyBankQuiz('balance-counter', seed)
      expect(questions.every((item) => item.answer >= 0)).toBe(true)
    }
  })

  it('creates a four-week mission with shuffled valid choices', () => {
    const mission = createTinyBankMission(777)

    expect(mission.rounds).toHaveLength(4)
    expect(mission.goal).toBeGreaterThan(mission.startingSavings)
    expect(
      mission.rounds.every(
        (round) =>
          round.choices.length === 3 &&
          new Set(round.choices.map((choice) => choice.id)).size === 3,
      ),
    ).toBe(true)
  })

  it('rewards a balanced successful plan more than a depleted failed plan', () => {
    const mission = createTinyBankMission(123)
    const strong = scoreTinyBankMission(
      mission,
      mission.goal + 10_000,
      30_000,
      3,
    )
    const weak = scoreTinyBankMission(
      mission,
      mission.goal * 0.6,
      0,
      0,
    )

    expect(strong).toBe(5)
    expect(weak).toBeLessThan(3)
  })
})
