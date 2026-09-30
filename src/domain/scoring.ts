import type {
  MissionDefinition,
  MissionEvaluation,
  WorkScenarioChoice,
  WorkShiftDefinition,
  WorkShiftProgress,
} from './types'

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))

export interface HiddenScoreBreakdown {
  accuracy: number
  time: number
  resources: number
  decisions: number
  objectives: number
  total: number
  stars: 1 | 2 | 3 | 4 | 5
}

export function starsFromScore(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 95) return 5
  if (score >= 85) return 4
  if (score >= 75) return 3
  if (score >= 65) return 2
  return 1
}

export function timeEfficiencyScore(
  elapsedMs: number,
  targetSeconds: number,
  maxPoints = 20,
) {
  const targetMs = Math.max(1, targetSeconds) * 1000
  if (elapsedMs <= targetMs) return maxPoints

  const ratioOver = (elapsedMs - targetMs) / targetMs
  return Math.round(maxPoints * clamp(1 - ratioOver * 0.65) * 100) / 100
}

export function choiceQuality(choice: WorkScenarioChoice) {
  const weighted =
    choice.employeeRatingDelta * 0.35 +
    choice.storeReputationDelta * 0.35 +
    choice.customerSatisfactionDelta * 0.3

  return clamp((weighted + 0.25) / 0.45)
}

export function scoreWorkShift(
  shift: WorkShiftDefinition,
  progress: WorkShiftProgress,
  resolveScenario?: (id: string) => { choices: WorkScenarioChoice[] } | undefined,
): HiddenScoreBreakdown {
  const entries = shift.customers.map(
    (customer) => progress.customerProgress[customer.id],
  )
  const mathTasks = entries.length * 2
  const firstTry = entries.reduce(
    (sum, item) =>
      sum +
      Number(item?.totalSolved && item.totalAttempts === 1) +
      Number(item?.changeSolved && item.changeAttempts === 1),
    0,
  )
  const accuracy = mathTasks ? (firstTry / mathTasks) * 30 : 30

  const elapsedMs = Math.max(
    0,
    (progress.completedAtEpochMs ?? Date.now()) -
      (progress.startedAtEpochMs ?? Date.now()),
  )
  const time = timeEfficiencyScore(
    elapsedMs,
    Math.max(180, shift.customers.length * 75),
    20,
  )

  const metricAverage =
    (progress.metrics.employeeRating +
      progress.metrics.storeReputation +
      progress.metrics.customerSatisfaction) /
    3
  const resources = clamp(metricAverage / 5) * 20

  const scenarioCustomers = shift.customers.filter(
    (customer) => customer.scenarioId,
  )
  const decisionQuality = scenarioCustomers.length
    ? scenarioCustomers.reduce((sum, customer) => {
        const choiceId =
          progress.customerProgress[customer.id]?.scenarioChoiceId
        if (!choiceId || !customer.scenarioId) return sum
        const scenario = resolveScenario?.(customer.scenarioId)
        const choice = scenario?.choices.find((item) => item.id === choiceId)
        return sum + (choice ? choiceQuality(choice) : 0)
      }, 0) / scenarioCustomers.length
    : 1
  const decisions = decisionQuality * 20

  const objectives = progress.completed ? 10 : 0

  const total = Math.round(
    (accuracy + time + resources + decisions + objectives) * 100,
  ) / 100
  const hasCriticalFailure = !progress.completed

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    time,
    resources: Math.round(resources * 100) / 100,
    decisions: Math.round(decisions * 100) / 100,
    objectives,
    total,
    stars: hasCriticalFailure ? Math.min(4, starsFromScore(total)) as 1|2|3|4 : starsFromScore(total),
  }
}


export function scoreShoppingMission(
  mission: MissionDefinition,
  evaluation: MissionEvaluation,
  checkoutAttempts: number,
  elapsedMs: number,
): HiddenScoreBreakdown {
  const failedAttempts = Math.max(0, checkoutAttempts - 1)
  const accuracy = Math.max(0, 30 - failedAttempts * 5)
  const time = timeEfficiencyScore(
    elapsedMs,
    mission.targetTimeSeconds ?? 300,
    20,
  )

  const requiredCoverage = mission.requiredStalls.reduce(
    (sum, stallId) => sum + mission.people,
    0,
  )
  const actualCoverage = mission.requiredStalls.reduce(
    (sum, stallId) => sum + evaluation.coverageByStall[stallId],
    0,
  )
  const excessCoverage = Math.max(0, actualCoverage - requiredCoverage)
  const wasteRatio =
    requiredCoverage > 0 ? excessCoverage / requiredCoverage : 0
  const resources = 20 * clamp(1 - wasteRatio * 0.8)

  const reserveTarget = Math.max(1, mission.reserveRequired)
  const reserveQuality = evaluation.remaining < reserveTarget
    ? 0
    : clamp(1 - Math.max(0, evaluation.remaining - reserveTarget * 2) / (mission.budget * 0.5))
  const softGoalRatio =
    evaluation.softGoalResults.length > 0
      ? evaluation.softGoalResults.filter((item) => item.achieved).length /
        evaluation.softGoalResults.length
      : 1
  const decisions =
    evaluation.softGoalResults.length > 0
      ? reserveQuality * 10 + softGoalRatio * 10
      : reserveQuality * 20

  const objectives = evaluation.success ? 10 : 0
  const total = Math.round(
    (accuracy + time + resources + decisions + objectives) * 100,
  ) / 100

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    time,
    resources: Math.round(resources * 100) / 100,
    decisions: Math.round(decisions * 100) / 100,
    objectives,
    total,
    stars: evaluation.success ? starsFromScore(total) : Math.min(4, starsFromScore(total)) as 1|2|3|4,
  }
}
