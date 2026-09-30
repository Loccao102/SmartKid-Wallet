import { describe, expect, it } from 'vitest'
import {
  createWeeklyChallenge,
  createWeeklyMathExercises,
  createWeeklyScenarioRounds,
  getVietnamWeekKey,
  getWeeklyScenarios,
  scoreWeeklyChallenge,
} from './weeklyChallenge'

describe('weekly SmartMart challenge', () => {
  const date = new Date('2026-09-30T03:00:00Z')

  it('uses the Vietnam Monday as the shared week identity', () => {
    expect(getVietnamWeekKey(date)).toBe('2026-09-28')
  })

  it('creates the exact same challenge for every player in a week', () => {
    const first = createWeeklyChallenge(date)
    const second = createWeeklyChallenge(
      new Date('2026-10-04T10:00:00Z'),
    )

    expect(first).toEqual(second)
    expect(first.mathFamilyIds).toHaveLength(6)
    expect(first.scenarioIds).toHaveLength(2)
  })

  it('generates replayable questions and scenario set for one variant', () => {
    const challenge = createWeeklyChallenge(date)
    expect(createWeeklyMathExercises(challenge, 'player-a')).toEqual(
      createWeeklyMathExercises(challenge, 'player-a'),
    )
    expect(createWeeklyScenarioRounds(challenge, 'player-a')).toEqual(
      createWeeklyScenarioRounds(challenge, 'player-a'),
    )
    expect(getWeeklyScenarios(challenge)).toHaveLength(2)
  })

  it('keeps the same blueprints while changing numeric answers by player', () => {
    const challenge = createWeeklyChallenge(date)
    const playerA = createWeeklyMathExercises(challenge, 'player-a')
    const playerB = createWeeklyMathExercises(challenge, 'player-b')

    expect(playerA.map((item) => item.familyId)).toEqual(
      playerB.map((item) => item.familyId),
    )
    expect(
      playerA.some(
        (item, index) =>
          item.answer !== playerB[index].answer ||
          item.prompt !== playerB[index].prompt,
      ),
    ).toBe(true)
  })

  it('varies scenario choice positions without changing available choices', () => {
    const challenge = createWeeklyChallenge(date)
    const signatures = new Set<string>()

    for (const player of ['a', 'b', 'c', 'd', 'e']) {
      const rounds = createWeeklyScenarioRounds(challenge, 'player-' + player)
      signatures.add(
        rounds.map((round) => round.choiceOrder.join('.')).join('|'),
      )

      for (const round of rounds) {
        expect(new Set(round.choiceOrder)).toEqual(
          new Set(round.scenario.choices.map((choice) => choice.id)),
        )
      }
    }

    expect(signatures.size).toBeGreaterThan(1)
  })

  it('allows a mastery run to reach five stars', () => {
    const challenge = createWeeklyChallenge(date)
    const scenarios = getWeeklyScenarios(challenge)
    const bestChoiceIds = scenarios.map((scenario) =>
      [...scenario.choices].sort((a, b) => {
        const qa =
          a.employeeRatingDelta +
          a.storeReputationDelta +
          a.customerSatisfactionDelta
        const qb =
          b.employeeRatingDelta +
          b.storeReputationDelta +
          b.customerSatisfactionDelta
        return qb - qa
      })[0].id,
    )

    const score = scoreWeeklyChallenge({
      challenge,
      firstTryCorrect: 6,
      totalMathAttempts: 6,
      choiceIds: bestChoiceIds,
      elapsedMs: 300_000,
    })

    expect(score.total).toBeGreaterThanOrEqual(95)
    expect(score.stars).toBe(5)
  })
})
