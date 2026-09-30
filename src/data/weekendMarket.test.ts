import { describe, expect, it } from 'vitest'
import {
  createMarketDay,
  createWeekendMarketQuiz,
  scoreMarketDay,
} from './weekendMarket'

describe('Weekend Market generators', () => {
  it('generates deterministic but seed-varying unit-price questions', () => {
    const first = createWeekendMarketQuiz('unit-price', 31)
    const same = createWeekendMarketQuiz('unit-price', 31)
    const other = createWeekendMarketQuiz('unit-price', 32)

    expect(first).toEqual(same)
    expect(first.map((item) => item.prompt)).not.toEqual(
      other.map((item) => item.prompt),
    )
    expect(first.every((item) => item.answer > 0)).toBe(true)
  })

  it('keeps profit questions positive', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      expect(
        createWeekendMarketQuiz('profit-loss', seed).every(
          (item) => item.answer > 0,
        ),
      ).toBe(true)
    }
  })

  it('creates four market-day scenarios with distinct choices', () => {
    const run = createMarketDay(909)
    expect(run.rounds).toHaveLength(4)
    expect(
      run.rounds.every(
        (round) =>
          round.choices.length === 3 &&
          new Set(round.choices.map((choice) => choice.id)).size === 3,
      ),
    ).toBe(true)
  })

  it('scores a healthy market day higher than a poor one', () => {
    const run = createMarketDay(1001)
    const strong = scoreMarketDay(run, run.targetCash, 5, 2, 0)
    const weak = scoreMarketDay(run, run.targetCash * 0.4, -2, 12, 6)

    expect(strong).toBe(5)
    expect(weak).toBeLessThan(3)
  })
})
