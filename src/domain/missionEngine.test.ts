import { describe, expect, it } from 'vitest'
import { firstMission } from '../data/missions'
import { products } from '../data/products'
import { evaluateMission } from './missionEngine'

describe('mission engine', () => {
  it('accepts a valid class party basket', () => {
    const result = evaluateMission(firstMission, products, [
      { productId: 'produce-banana-bunch', quantity: 5 },
      { productId: 'food-bread-basket', quantity: 4 },
      { productId: 'drinks-water-pack', quantity: 4 },
    ])

    expect(result.success).toBe(true)
    expect(result.spent).toBe(384000)
    expect(result.remaining).toBe(116000)
    expect(result.coverageByStall.produce).toBe(20)
    expect(result.coverageByStall.food).toBe(20)
    expect(result.coverageByStall.drinks).toBe(24)
    expect(result.softGoalResults).toEqual([
      { id: 'class-party-variety', achieved: false },
    ])
    // Soft goals affect mastery stars, not hard mission completion.
  })

  it('applies a revealed mission event without making it disappear when cart changes', () => {
    const result = evaluateMission(
      firstMission,
      products,
      [
        { productId: 'produce-banana-bunch', quantity: 5 },
        { productId: 'food-bread-basket', quantity: 4 },
        { productId: 'drinks-water-pack', quantity: 4 },
      ],
      ['class-party-four-more'],
    )

    expect(result.effectivePeople).toBe(24)
    expect(result.activeEventIds).toContain('class-party-four-more')
    expect(result.success).toBe(false)
    expect(result.reasons.some((reason) => reason.includes('/24'))).toBe(true)
  })

  it('rejects a basket that does not serve enough students', () => {
    const result = evaluateMission(firstMission, products, [
      { productId: 'produce-banana-bunch', quantity: 1 },
      { productId: 'food-bread-basket', quantity: 1 },
      { productId: 'drinks-water-pack', quantity: 1 },
    ])

    expect(result.success).toBe(false)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('rejects overspending even when coverage is high enough', () => {
    const result = evaluateMission(firstMission, products, [
      { productId: 'produce-grape-box', quantity: 5 },
      { productId: 'food-sandwich-box', quantity: 5 },
      { productId: 'drinks-juice-pack', quantity: 5 },
    ])

    expect(result.success).toBe(false)
    expect(result.remaining).toBeLessThan(firstMission.reserveRequired)
  })
})
