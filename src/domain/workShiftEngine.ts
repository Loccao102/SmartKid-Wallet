import type {
  WorkBasketItem,
  WorkScenarioChoice,
  WorkShiftDefinition,
  WorkShiftMetrics,
} from './types'

const clampRating = (value: number) => Math.min(5, Math.max(1, Number(value.toFixed(2))))

export function calculateBasketTotal(items: WorkBasketItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function calculateEffectiveTotal(
  items: WorkBasketItem[],
  choice?: WorkScenarioChoice,
) {
  return Math.max(0, calculateBasketTotal(items) + (choice?.billDelta ?? 0))
}

export function calculateChange(
  items: WorkBasketItem[],
  cashGiven: number,
  choice?: WorkScenarioChoice,
) {
  return cashGiven - calculateEffectiveTotal(items, choice)
}

export function createInitialShiftMetrics(
  shift: WorkShiftDefinition,
): WorkShiftMetrics {
  return {
    employeeRating: shift.startingEmployeeRating,
    storeReputation: shift.startingStoreReputation,
    customerSatisfaction: shift.startingCustomerSatisfaction,
    revenue: 0,
    servedCustomers: 0,
    mathMistakes: 0,
  }
}

export function applyMathAttempt(
  metrics: WorkShiftMetrics,
  correct: boolean,
): WorkShiftMetrics {
  if (correct) return metrics

  return {
    ...metrics,
    employeeRating: clampRating(metrics.employeeRating - 0.1),
    customerSatisfaction: clampRating(metrics.customerSatisfaction - 0.05),
    mathMistakes: metrics.mathMistakes + 1,
  }
}

export function applyScenarioChoice(
  metrics: WorkShiftMetrics,
  choice: WorkScenarioChoice,
): WorkShiftMetrics {
  return {
    ...metrics,
    employeeRating: clampRating(
      metrics.employeeRating + choice.employeeRatingDelta,
    ),
    storeReputation: clampRating(
      metrics.storeReputation + choice.storeReputationDelta,
    ),
    customerSatisfaction: clampRating(
      metrics.customerSatisfaction + choice.customerSatisfactionDelta,
    ),
  }
}

export function settleCustomer(
  metrics: WorkShiftMetrics,
  items: WorkBasketItem[],
  choice?: WorkScenarioChoice,
): WorkShiftMetrics {
  return {
    ...metrics,
    revenue: metrics.revenue + calculateEffectiveTotal(items, choice),
    servedCustomers: metrics.servedCustomers + 1,
  }
}
