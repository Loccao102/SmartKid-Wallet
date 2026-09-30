import type {
  WorkBasketItem,
  WorkPendingStoryDecision,
  WorkResolvedConsequence,
  WorkScenarioChoice,
  WorkStoryChoice,
  WorkShiftCustomerProgress,
  WorkShiftDefinition,
  WorkShiftMetrics,
  WorkShiftProgress,
  WorkWorldEffect,
  WorkWorldFlag,
  WorkWorldState,
} from './types'

const clampRating = (value: number) =>
  Math.min(5, Math.max(1, Number(value.toFixed(2))))

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

function createCustomerProgress(): WorkShiftCustomerProgress {
  return {
    totalSolved: false,
    changeSolved: false,
    totalAttempts: 0,
    changeAttempts: 0,
  }
}

export function createInitialWorkWorldState(): WorkWorldState {
  return {
    flags: [],
    pendingConsequences: [],
    pendingStoryDecisions: [],
    resolvedConsequences: [],
  }
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

export function createInitialWorkShiftProgress(
  shift: WorkShiftDefinition,
): WorkShiftProgress {
  return {
    shiftId: shift.id,
    customerIndex: 0,
    customerProgress: Object.fromEntries(
      shift.customers.map((customer) => [customer.id, createCustomerProgress()]),
    ),
    metrics: createInitialShiftMetrics(shift),
    worldState: createInitialWorkWorldState(),
    startedAtEpochMs: Date.now(),
    completedAtEpochMs: undefined,
    completed: false,
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

function mergeFlags(
  flags: WorkWorldFlag[],
  add: WorkWorldFlag[] = [],
  remove: WorkWorldFlag[] = [],
) {
  const next = new Set(flags)

  for (const flag of add) next.add(flag)
  for (const flag of remove) next.delete(flag)

  return [...next]
}

export function applyWorkWorldEffect(
  worldState: WorkWorldState,
  effect: WorkWorldEffect | undefined,
  servedCustomers: number,
): WorkWorldState {
  if (!effect) return worldState

  const pendingConsequences = [
    ...worldState.pendingConsequences,
    ...(effect.deferredConsequences ?? []).map((consequence, index) => ({
      ...consequence,
      instanceId:
        consequence.id +
        '-' +
        (servedCustomers + 1) +
        '-' +
        (worldState.pendingConsequences.length + index),
      scheduledAtServedCustomers: servedCustomers,
      dueAtServedCustomers:
        consequence.trigger === 'after-customers'
          ? servedCustomers + Math.max(1, consequence.delayCustomers ?? 1)
          : undefined,
    })),
  ]

  return {
    ...worldState,
    flags: mergeFlags(
      worldState.flags,
      effect.setFlags,
      effect.clearFlags,
    ),
    pendingConsequences,
  }
}

function applyConsequenceMetrics(
  metrics: WorkShiftMetrics,
  consequence: WorkResolvedConsequence,
): WorkShiftMetrics {
  return {
    ...metrics,
    employeeRating: clampRating(
      metrics.employeeRating + consequence.employeeRatingDelta,
    ),
    storeReputation: clampRating(
      metrics.storeReputation + consequence.storeReputationDelta,
    ),
    customerSatisfaction: clampRating(
      metrics.customerSatisfaction + consequence.customerSatisfactionDelta,
    ),
  }
}

export function resolveDueConsequences(
  metrics: WorkShiftMetrics,
  worldState: WorkWorldState,
  servedCustomers: number,
  shiftEnded = false,
) {
  const due = worldState.pendingConsequences.filter((consequence) =>
    consequence.trigger === 'shift-end'
      ? shiftEnded
      : (consequence.dueAtServedCustomers ?? Number.POSITIVE_INFINITY) <=
        servedCustomers,
  )

  if (due.length === 0) {
    return {
      metrics,
      worldState,
      newlyResolved: [] as WorkResolvedConsequence[],
      newlyPresentedStoryDecisions: [] as WorkPendingStoryDecision[],
    }
  }

  const storyDue = due.filter(
    (consequence): consequence is WorkPendingStoryDecision =>
      Boolean(consequence.storyDecision),
  )
  const automaticDue = due.filter((consequence) => !consequence.storyDecision)

  let nextMetrics = metrics
  let nextFlags = [...worldState.flags]
  const newlyResolved = automaticDue.map((consequence) => {
    const resolved: WorkResolvedConsequence = {
      ...consequence,
      resolvedAtServedCustomers: servedCustomers,
    }

    nextMetrics = applyConsequenceMetrics(nextMetrics, resolved)
    nextFlags = mergeFlags(nextFlags, [], resolved.clearFlags)

    return resolved
  })

  const dueIds = new Set(due.map((item) => item.instanceId))

  return {
    metrics: nextMetrics,
    worldState: {
      flags: nextFlags,
      pendingConsequences: worldState.pendingConsequences.filter(
        (item) => !dueIds.has(item.instanceId),
      ),
      pendingStoryDecisions: [
        ...worldState.pendingStoryDecisions,
        ...storyDue,
      ],
      resolvedConsequences: [
        ...worldState.resolvedConsequences,
        ...newlyResolved,
      ],
    },
    newlyResolved,
    newlyPresentedStoryDecisions: storyDue,
  }
}

function applyStoryChoiceMetrics(
  metrics: WorkShiftMetrics,
  choice: WorkStoryChoice,
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

export function resolveStoryDecision(
  metrics: WorkShiftMetrics,
  worldState: WorkWorldState,
  instanceId: string,
  choiceId: string,
) {
  const pending = worldState.pendingStoryDecisions.find(
    (item) => item.instanceId === instanceId,
  )

  if (!pending) {
    throw new Error('Unknown pending story decision: ' + instanceId)
  }

  const choice = pending.storyDecision.choices.find(
    (item) => item.id === choiceId,
  )

  if (!choice) {
    throw new Error(
      'Unknown story choice ' + choiceId + ' for ' + pending.id,
    )
  }

  const nextMetrics = applyStoryChoiceMetrics(metrics, choice)
  const resolved: WorkResolvedConsequence = {
    ...pending,
    resolvedAtServedCustomers: metrics.servedCustomers,
    resolutionChoiceId: choice.id,
    resolutionFeedback: choice.feedback,
  }

  return {
    metrics: nextMetrics,
    worldState: {
      flags: mergeFlags(
        worldState.flags,
        choice.setFlags,
        [...(pending.clearFlags ?? []), ...(choice.clearFlags ?? [])],
      ),
      pendingConsequences: worldState.pendingConsequences,
      pendingStoryDecisions: worldState.pendingStoryDecisions.filter(
        (item) => item.instanceId !== instanceId,
      ),
      resolvedConsequences: [
        ...worldState.resolvedConsequences,
        resolved,
      ],
    },
    resolved,
    choice,
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
