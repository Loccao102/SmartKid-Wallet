import { describe, expect, it } from 'vitest'
import { createTinyBankMission, scoreTinyBankMission } from '../data/tinyBank'
import { chooseBankPlan, restoreBankPlan, summarizeBankPlan } from './tinyBankMission'

describe('Tiny Bank personal plan', () => {
  const run = createTinyBankMission(20261003)
  it('ignores duplicate choices while showing the current week result', () => {
    const initial = restoreBankPlan(run, null)
    const picked = chooseBankPlan(run, initial, 'balanced')
    expect(chooseBankPlan(run, picked, 'balanced')).toBe(picked)
    expect(chooseBankPlan(run, initial, 'unknown')).toBe(initial)
    expect(summarizeBankPlan(run, picked).ledger).toHaveLength(1)
  })
  it('replays saved choices into the same balances and score after reload', () => {
    let progress = restoreBankPlan(run, null)
    const ids = ['balanced', 'weekly-money', 'skip-sale', 'finish-strong']
    for (const id of ids) progress = chooseBankPlan(run, { ...progress, reviewing: false }, id)
    const reloaded = restoreBankPlan(createTinyBankMission(run.seed), JSON.parse(JSON.stringify(progress)))
    expect(reloaded).toEqual(progress)
    const totals = summarizeBankPlan(run, reloaded)
    expect(totals.ledger).toHaveLength(4)
    expect(totals.reserve).toBe(run.startingReserve)
    expect(totals.savings).toBe(run.startingSavings + run.rounds.reduce((sum, round, i) => sum + round.choices.find(choice => choice.id === ids[i])!.savingsDelta, 0))
    expect(scoreTinyBankMission(run, totals.savings, totals.reserve, totals.joy)).toBeGreaterThanOrEqual(3)
  })
  it('keeps only the valid prefix of a damaged checkpoint', () => {
    expect(restoreBankPlan(run, { choiceIds: ['balanced', 'missing', 'skip-sale'], reviewing: true })).toEqual({ choiceIds: ['balanced'], reviewing: true })
    expect(restoreBankPlan(run, { choiceIds: ['missing'], reviewing: true })).toEqual({ choiceIds: [], reviewing: false })
  })
})
