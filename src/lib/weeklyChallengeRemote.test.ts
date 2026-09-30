import { describe, expect, it } from 'vitest'
import { createWeeklyChallenge } from '../domain/weeklyChallenge'

describe('weekly challenge remote payload contract', () => {
  it('uses the database challenge identity format', () => {
    const challenge = createWeeklyChallenge(
      new Date('2026-09-30T03:00:00Z'),
    )
    expect(challenge.id).toBe('smartmart-week-2026-09-28-v1')
    expect(challenge.version).toBe(1)
    expect(challenge.weekKey).toBe('2026-09-28')
  })
})
