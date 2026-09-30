import { describe, expect, it } from 'vitest'
import {
  applyXpGain,
  LEVEL_UP_COIN_REWARD,
  retryCost,
  STARTING_COINS,
  xpNeededForNextLevel,
} from './progression'

describe('progression economy', () => {
  it('caps retry cost at 30 coins', () => {
    expect([1, 2, 3, 4, 5, 6, 9].map(retryCost)).toEqual([
      5, 10, 15, 20, 25, 30, 30,
    ])
  })

  it('uses a gently increasing XP curve', () => {
    expect(xpNeededForNextLevel(1)).toBe(100)
    expect(xpNeededForNextLevel(5)).toBe(300)
    expect(xpNeededForNextLevel(10)).toBe(550)
  })

  it('awards 100 coins for every level gained', () => {
    const result = applyXpGain(
      { level: 1, levelXp: 90, totalXp: 90, coins: STARTING_COINS },
      170,
    )

    expect(result.level).toBe(3)
    expect(result.levelXp).toBe(10)
    expect(result.levelsGained).toBe(2)
    expect(result.coins).toBe(STARTING_COINS + LEVEL_UP_COIN_REWARD * 2)
  })
})
