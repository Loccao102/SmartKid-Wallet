import { describe, expect, it } from 'vitest'
import { getWorkScenario, traineeShift } from '../data/workShift'
import {
  applyMathAttempt,
  applyScenarioChoice,
  calculateBasketTotal,
  calculateChange,
  calculateEffectiveTotal,
  createInitialShiftMetrics,
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

    expect(afterChoice.employeeRating).toBe(3.6)
    expect(afterChoice.storeReputation).toBe(3.5)
    expect(afterChoice.customerSatisfaction).toBe(3.6)
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
})
