import { describe, expect, it } from 'vitest'
import { getWorkManagerPlan } from '../data/workManagerPlans'
import { getWorkScenario, traineeShift, workScenarios } from '../data/workShift'
import {
  getWorkWorldEffect,
  workWorldEffects,
} from '../data/workWorldEffects'
import {
  applyManagerPlan,
  applyMathAttempt,
  applyScenarioChoice,
  applyStoryFollowUpChoice,
  applyWorkWorldEffect,
  calculateBasketTotal,
  calculateChange,
  calculateEffectiveTotal,
  createInitialShiftMetrics,
  createInitialWorkShiftProgress,
  createInitialWorkWorldState,
  getDueStoryFollowUp,
  resolveDueConsequences,
  settleCustomer,
} from './workShiftEngine'

describe('work shift engine', () => {
  it('calculates basket totals and change', () => {
    const customer = traineeShift.customers[0]
    expect(calculateBasketTotal(customer.basket)).toBe(102000)
    expect(calculateChange(customer.basket, customer.cashGiven)).toBe(98000)
  })

  it('applies voucher choice to the payable total', () => {
    const customer = traineeShift.customers[2]
    const scenario = getWorkScenario(customer.scenarioId!)
    const choice = scenario.choices.find((item) => item.id === 'apply-voucher')!

    expect(calculateBasketTotal(customer.basket)).toBe(115000)
    expect(calculateEffectiveTotal(customer.basket, choice)).toBe(95000)
    expect(calculateChange(customer.basket, customer.cashGiven, choice)).toBe(105000)
  })

  it('changes employee and store metrics separately', () => {
    const scenario = getWorkScenario('SCENARIO_DAMAGED_DRINK')
    const choice = scenario.choices.find((item) => item.id === 'sell-as-normal')!
    const initial = createInitialShiftMetrics(traineeShift)
    const afterChoice = applyScenarioChoice(initial, choice)

    expect(afterChoice.employeeRating).toBe(4.12)
    expect(afterChoice.storeReputation).toBe(4.08)
    expect(afterChoice.customerSatisfaction).toBe(4.2)
  })

  it('records math mistakes without failing the whole shift', () => {
    const initial = createInitialShiftMetrics(traineeShift)
    const afterWrong = applyMathAttempt(initial, false)

    expect(afterWrong.mathMistakes).toBe(1)
    expect(afterWrong.employeeRating).toBe(3.9)
  })

  it('adds only the effective transaction value to revenue', () => {
    const customer = traineeShift.customers[2]
    const scenario = getWorkScenario(customer.scenarioId!)
    const choice = scenario.choices.find((item) => item.id === 'apply-voucher')!
    const initial = createInitialShiftMetrics(traineeShift)
    const settled = settleCustomer(initial, customer.basket, choice)

    expect(settled.revenue).toBe(95000)
    expect(settled.servedCustomers).toBe(1)
  })

  it('keeps a valid expanded scenario bank', () => {
    expect(workScenarios).toHaveLength(24)

    const ids = workScenarios.map((scenario) => scenario.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const scenario of workScenarios) {
      expect(scenario.version).toBeGreaterThan(0)
      expect(scenario.choices).toHaveLength(3)
      expect(scenario.description.length).toBeGreaterThan(20)

      const choiceIds = scenario.choices.map((choice) => choice.id)
      expect(new Set(choiceIds).size).toBe(choiceIds.length)

      for (const choice of scenario.choices) {
        expect(choice.label.length).toBeGreaterThan(10)
        expect(choice.feedback.length).toBeGreaterThan(20)
        expect(Number.isFinite(choice.billDelta)).toBe(true)
        expect(Number.isFinite(choice.employeeRatingDelta)).toBe(true)
        expect(Number.isFinite(choice.storeReputationDelta)).toBe(true)
        expect(Number.isFinite(choice.customerSatisfactionDelta)).toBe(true)
      }
    }
  })

  it('schedules and resolves a delayed complaint for a risky hidden trade-off', () => {
    const scenario = getWorkScenario('SCENARIO_NEAR_EXPIRY_YOGURT')
    const choice = scenario.choices.find((item) => item.id === 'hide-expiry')!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const initialWorld = createInitialWorkWorldState()
    const scheduled = applyWorkWorldEffect(initialWorld, effect, 1)

    expect(scheduled.flags).toContain('complaint-risk')
    expect(scheduled.pendingConsequences).toHaveLength(1)
    expect(scheduled.pendingConsequences[0].dueAtServedCustomers).toBe(2)

    const initialMetrics = createInitialShiftMetrics(traineeShift)
    const tooEarly = resolveDueConsequences(initialMetrics, scheduled, 1, false)

    expect(tooEarly.newlyResolved).toHaveLength(0)
    expect(tooEarly.metrics.storeReputation).toBe(4)

    const resolved = resolveDueConsequences(initialMetrics, scheduled, 2, false)

    expect(resolved.newlyResolved).toHaveLength(1)
    expect(resolved.worldState.flags).not.toContain('complaint-risk')
    expect(resolved.worldState.pendingConsequences).toHaveLength(0)
    expect(resolved.worldState.resolvedConsequences).toHaveLength(1)
    expect(resolved.metrics.storeReputation).toBe(3.75)
  })

  it('keeps shift-end consequences pending until the shift ends', () => {
    const scenario = getWorkScenario('SCENARIO_EXTRA_CASH')
    const choice = scenario.choices.find((item) => item.id === 'keep-extra-cash')!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const scheduled = applyWorkWorldEffect(
      createInitialWorkWorldState(),
      effect,
      2,
    )
    const initialMetrics = createInitialShiftMetrics(traineeShift)

    const duringShift = resolveDueConsequences(
      initialMetrics,
      scheduled,
      3,
      false,
    )
    expect(duringShift.newlyResolved).toHaveLength(0)
    expect(duringShift.worldState.flags).toContain('cash-discrepancy')

    const atEnd = resolveDueConsequences(
      initialMetrics,
      scheduled,
      3,
      true,
    )
    expect(atEnd.newlyResolved).toHaveLength(1)
    expect(atEnd.worldState.flags).not.toContain('cash-discrepancy')
    expect(atEnd.metrics.employeeRating).toBe(3.65)
    expect(atEnd.metrics.storeReputation).toBe(3.8)
  })

  it('keeps every deferred world effect attached to a real scenario choice', () => {
    const consequenceIds = new Set<string>()

    for (const [key, effect] of Object.entries(workWorldEffects)) {
      const separator = key.lastIndexOf(':')
      expect(separator).toBeGreaterThan(0)

      const scenarioId = key.slice(0, separator)
      const choiceId = key.slice(separator + 1)
      const scenario = getWorkScenario(scenarioId)

      expect(scenario.choices.some((choice) => choice.id === choiceId)).toBe(true)

      for (const consequence of effect.deferredConsequences ?? []) {
        expect(consequence.title.length).toBeGreaterThan(5)
        expect(consequence.description.length).toBeGreaterThan(20)
        expect(Number.isFinite(consequence.employeeRatingDelta)).toBe(true)
        expect(Number.isFinite(consequence.storeReputationDelta)).toBe(true)
        expect(Number.isFinite(consequence.customerSatisfactionDelta)).toBe(true)

        const scopedId = scenarioId + ':' + consequence.id
        expect(consequenceIds.has(scopedId)).toBe(false)
        consequenceIds.add(scopedId)
      }
    }
  })

  it('uses only registered scenarios inside the trainee shift', () => {
    for (const customer of traineeShift.customers) {
      if (!customer.scenarioId) continue

      expect(() => getWorkScenario(customer.scenarioId!)).not.toThrow()
    }
  })

  it('schedules an interactive follow-up from a risky scenario choice', () => {
    const scenario = getWorkScenario('SCENARIO_NEAR_EXPIRY_YOGURT')
    const choice = scenario.choices.find((item) => item.id === 'hide-expiry')!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const world = applyWorkWorldEffect(
      createInitialWorkWorldState(),
      effect,
      1,
      scenario.id,
      choice.id,
    )

    expect(world.pendingFollowUps).toHaveLength(1)
    expect(world.pendingFollowUps[0].sourceScenarioId).toBe(scenario.id)
    expect(world.pendingFollowUps[0].sourceChoiceId).toBe(choice.id)
    expect(getDueStoryFollowUp(world, 1)).toBeUndefined()
    expect(getDueStoryFollowUp(world, 2)?.id).toBe(
      'near-expiry-customer-returns',
    )
  })

  it('resolves a story follow-up choice without settling revenue twice', () => {
    const scenario = getWorkScenario('SCENARIO_NEAR_EXPIRY_YOGURT')
    const choice = scenario.choices.find((item) => item.id === 'hide-expiry')!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const world = applyWorkWorldEffect(
      createInitialWorkWorldState(),
      effect,
      1,
      scenario.id,
      choice.id,
    )
    const followUp = getDueStoryFollowUp(world, 2)!
    const followUpChoice = followUp.choices.find(
      (item) => item.id === 'apologize-and-replace',
    )!
    const initialMetrics = {
      ...createInitialShiftMetrics(traineeShift),
      revenue: 123000,
      servedCustomers: 2,
    }

    const resolved = applyStoryFollowUpChoice(
      initialMetrics,
      world,
      followUp,
      followUpChoice,
      2,
    )

    expect(resolved.metrics.revenue).toBe(123000)
    expect(resolved.metrics.servedCustomers).toBe(2)
    expect(resolved.worldState.pendingFollowUps).toHaveLength(0)
    expect(resolved.worldState.resolvedFollowUps).toHaveLength(1)
    expect(resolved.worldState.resolvedFollowUps[0].selectedChoiceId).toBe(
      'apologize-and-replace',
    )
    expect(resolved.metrics.customerSatisfaction).toBeGreaterThan(
      initialMetrics.customerSatisfaction,
    )
  })

  it('forces remaining follow-ups to surface before the shift ends', () => {
    const scenario = getWorkScenario('SCENARIO_LAST_ITEM_RESERVED')
    const choice = scenario.choices.find(
      (item) => item.id === 'sell-reserved-item',
    )!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const world = applyWorkWorldEffect(
      createInitialWorkWorldState(),
      effect,
      7,
      scenario.id,
      choice.id,
    )

    expect(getDueStoryFollowUp(world, 8, false)).toBeUndefined()
    expect(getDueStoryFollowUp(world, 8, true)?.id).toBe(
      'reserved-customer-arrives',
    )
  })


  it('story director prioritizes urgent follow-ups when several are due', () => {
    const world = createInitialWorkWorldState()
    const lowPriority = {
      id: 'low-priority',
      priority: 1 as const,
      delayCustomers: 1,
      title: 'Low priority',
      description: 'Một tình huống nhẹ hơn đang chờ xử lý.',
      choices: [
        {
          id: 'ok',
          label: 'Xử lý',
          employeeRatingDelta: 0,
          storeReputationDelta: 0,
          customerSatisfactionDelta: 0,
          feedback: 'Đã xử lý.',
        },
      ],
    }
    const highPriority = {
      id: 'high-priority',
      priority: 3 as const,
      delayCustomers: 1,
      title: 'High priority',
      description: 'Một tình huống nghiêm trọng hơn đang chờ xử lý.',
      choices: [
        {
          id: 'ok',
          label: 'Xử lý',
          employeeRatingDelta: 0,
          storeReputationDelta: 0,
          customerSatisfactionDelta: 0,
          feedback: 'Đã xử lý.',
        },
      ],
    }

    const withLow = applyWorkWorldEffect(
      world,
      { followUps: [lowPriority] },
      1,
      'scenario-low',
      'choice-low',
    )
    const withBoth = applyWorkWorldEffect(
      withLow,
      { followUps: [highPriority] },
      1,
      'scenario-high',
      'choice-high',
    )

    expect(getDueStoryFollowUp(withBoth, 2)?.id).toBe('high-priority')
  })

  it('story director prevents two follow-ups in the same service beat', () => {
    const scenario = getWorkScenario('SCENARIO_NEAR_EXPIRY_YOGURT')
    const choice = scenario.choices.find((item) => item.id === 'hide-expiry')!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const firstWorld = applyWorkWorldEffect(
      createInitialWorkWorldState(),
      effect,
      1,
      scenario.id,
      choice.id,
    )
    const secondWorld = applyWorkWorldEffect(
      firstWorld,
      effect,
      1,
      scenario.id,
      choice.id,
    )
    const first = getDueStoryFollowUp(secondWorld, 2)!
    const chosen = first.choices[0]
    const resolved = applyStoryFollowUpChoice(
      createInitialShiftMetrics(traineeShift),
      secondWorld,
      first,
      chosen,
      2,
    )

    expect(getDueStoryFollowUp(resolved.worldState, 2)).toBeUndefined()
    expect(getDueStoryFollowUp(resolved.worldState, 3)).toBeDefined()
  })


  it('manager plan grants one protection and applies its opening trade-off', () => {
    const progress = createInitialWorkShiftProgress(traineeShift)
    const plan = getWorkManagerPlan('customer-care')
    const planned = applyManagerPlan(progress, plan)

    expect(planned.managerPlanId).toBe(plan.id)
    expect(planned.worldState.managerProtections).toEqual(['service'])
    expect(planned.metrics.customerSatisfaction).toBeGreaterThan(
      progress.metrics.customerSatisfaction,
    )
  })

  it('manager protection absorbs the first matching downstream incident', () => {
    const progress = createInitialWorkShiftProgress(traineeShift)
    const planned = applyManagerPlan(
      progress,
      getWorkManagerPlan('checkout-support'),
    )
    const scenario = getWorkScenario('SCENARIO_EXTRA_CASH')
    const choice = scenario.choices.find(
      (item) => item.id === 'keep-extra-cash',
    )!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const protectedWorld = applyWorkWorldEffect(
      planned.worldState,
      effect,
      1,
      scenario.id,
      choice.id,
    )

    expect(protectedWorld.managerProtections).toEqual([])
    expect(protectedWorld.consumedManagerProtections).toEqual(['operations'])
    expect(protectedWorld.flags).not.toContain('cash-discrepancy')
    expect(protectedWorld.pendingConsequences).toHaveLength(0)
  })

  it('manager protection does not absorb unrelated incident categories', () => {
    const progress = createInitialWorkShiftProgress(traineeShift)
    const planned = applyManagerPlan(
      progress,
      getWorkManagerPlan('customer-care'),
    )
    const scenario = getWorkScenario('SCENARIO_EXTRA_CASH')
    const choice = scenario.choices.find(
      (item) => item.id === 'keep-extra-cash',
    )!
    const effect = getWorkWorldEffect(scenario.id, choice.id)!
    const world = applyWorkWorldEffect(
      planned.worldState,
      effect,
      1,
      scenario.id,
      choice.id,
    )

    expect(world.managerProtections).toEqual(['service'])
    expect(world.consumedManagerProtections).toEqual([])
    expect(world.flags).toContain('cash-discrepancy')
    expect(world.pendingConsequences).toHaveLength(1)
  })

})
