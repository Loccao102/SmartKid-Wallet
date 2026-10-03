import type { TinyBankMissionRun } from '../data/tinyBank'

/** A personal planning exercise. It never changes employee/store world state. */
export interface BankPlanProgress {
  choiceIds: string[]
  reviewing: boolean
}

export function restoreBankPlan(run: TinyBankMissionRun, value: unknown): BankPlanProgress {
  const source = value && typeof value === 'object' ? value as Partial<BankPlanProgress> : {}
  const choiceIds: string[] = []
  if (Array.isArray(source.choiceIds)) {
    for (const [index, id] of source.choiceIds.entries()) {
      if (!run.rounds[index]?.choices.some(choice => choice.id === id)) break
      choiceIds.push(id)
    }
  }
  return { choiceIds, reviewing: choiceIds.length > 0 && (source.reviewing === true || choiceIds.length === run.rounds.length) }
}

export function chooseBankPlan(run: TinyBankMissionRun, progress: BankPlanProgress, choiceId: string): BankPlanProgress {
  if (progress.reviewing || !run.rounds[progress.choiceIds.length]?.choices.some(choice => choice.id === choiceId)) return progress
  return { choiceIds: [...progress.choiceIds, choiceId], reviewing: true }
}

export function summarizeBankPlan(run: TinyBankMissionRun, progress: BankPlanProgress) {
  let savings = run.startingSavings
  let reserve = run.startingReserve
  let joy = 0
  const ledger = progress.choiceIds.map((id, index) => {
    const round = run.rounds[index]
    const choice = round.choices.find(item => item.id === id)!
    savings += choice.savingsDelta
    reserve = Math.max(0, reserve + choice.reserveDelta)
    joy += choice.joyDelta
    return { week: index + 1, choice, savings, reserve }
  })
  return { savings, reserve, joy, ledger }
}
