import { describe, expect, it } from 'vitest'
import { firstMission } from '../data/missions'
import {
  scoreShoppingMission,
  starsFromScore,
  timeEfficiencyScore,
} from './scoring'

describe('hidden scoring', () => {
  it('maps mastery score to stars', () => {
    expect(starsFromScore(100)).toBe(5)
    expect(starsFromScore(95)).toBe(5)
    expect(starsFromScore(90)).toBe(4)
    expect(starsFromScore(70)).toBe(2)
    expect(starsFromScore(40)).toBe(1)
  })

  it('never fails a run only because time is slow', () => {
    expect(timeEfficiencyScore(120_000, 300)).toBe(20)
    expect(timeEfficiencyScore(900_000, 300)).toBeGreaterThanOrEqual(0)
  })

  it('allows a clean shopping run to reach five stars', () => {
    const result = scoreShoppingMission(
      firstMission,
      {
        success: true,
        spent: 440000,
        remaining: 60000,
        coverageByStall: {
          produce: 20,
          food: 20,
          drinks: 20,
          supplies: 0,
        },
        reasons: [],
        softGoalResults: [
          { id: 'class-party-variety', achieved: true },
        ],
      },
      1,
      240_000,
    )

    expect(result.total).toBeGreaterThanOrEqual(95)
    expect(result.stars).toBe(5)
  })
})
