import { describe, expect, it } from 'vitest'
import {
  createRestaurantQuiz,
  createRestaurantRush,
  scoreRestaurantRush,
} from './happyRestaurant'

describe('Happy Restaurant generators', () => {
  it('generates deterministic but varying table questions', () => {
    const first = createRestaurantQuiz('share-table', 11)
    const same = createRestaurantQuiz('share-table', 11)
    const other = createRestaurantQuiz('share-table', 22)

    expect(first).toEqual(same)
    expect(first.map((item) => item.prompt)).not.toEqual(
      other.map((item) => item.prompt),
    )
    expect(first.every((item) => item.answer > 0)).toBe(true)
  })

  it('keeps generated bill questions positive', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      expect(
        createRestaurantQuiz('bill-counter', seed).every(
          (item) => item.answer > 0,
        ),
      ).toBe(true)
    }
  })

  it('creates four dinner-rush scenarios with three distinct choices each', () => {
    const run = createRestaurantRush(404)
    expect(run.rounds).toHaveLength(4)
    expect(
      run.rounds.every(
        (round) =>
          round.choices.length === 3 &&
          new Set(round.choices.map((choice) => choice.id)).size === 3,
      ),
    ).toBe(true)
  })

  it('gives five stars to a balanced high-performing shift', () => {
    const run = createRestaurantRush(505)
    expect(
      scoreRestaurantRush(run, run.targetRevenue, 5, 1, 2),
    ).toBe(5)
    expect(
      scoreRestaurantRush(run, run.targetRevenue * 0.5, 0, 8, 8),
    ).toBeLessThan(3)
  })
})
