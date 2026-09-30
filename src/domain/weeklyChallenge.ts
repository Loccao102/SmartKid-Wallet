import { exerciseFamilies, getExerciseFamilyById } from '../data/exerciseFamilies'
import { stalls } from '../data/stalls'
import { getWorkScenario, workScenarios } from '../data/workShift'
import { generateExercise } from './exerciseEngine'
import { choiceQuality, starsFromScore, timeEfficiencyScore } from './scoring'
import { createSeed, createSeededRandom, pickOne } from '../lib/seededRandom'
import type { ExerciseInstance, WorkScenarioDefinition } from './types'

export const WEEKLY_CHALLENGE_VERSION = 2
export const WEEKLY_MATH_COUNT = 6
export const WEEKLY_SCENARIO_COUNT = 2
export const WEEKLY_TARGET_SECONDS = 600
export const WEEKLY_XP_REWARD = 60
export const WEEKLY_COIN_REWARD = 50

export interface WeeklyChallengeDefinition {
  id: string
  version: number
  weekKey: string
  seed: number
  title: string
  subtitle: string
  mathFamilyIds: string[]
  scenarioIds: string[]
  targetSeconds: number
  xpReward: number
  coinReward: number
}

export interface WeeklyScenarioRound {
  scenario: WorkScenarioDefinition
  choiceOrder: string[]
  variantSeed: number
}

export interface WeeklyChallengeRunScore {
  accuracy: number
  decisions: number
  time: number
  total: number
  stars: 1 | 2 | 3 | 4 | 5
  decisionQuality: number
}

function formatDateUtc(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export function getVietnamWeekKey(date = new Date()) {
  const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  const day = vietnamTime.getUTCDay()
  const daysSinceMonday = (day + 6) % 7
  const monday = new Date(
    Date.UTC(
      vietnamTime.getUTCFullYear(),
      vietnamTime.getUTCMonth(),
      vietnamTime.getUTCDate() - daysSinceMonday,
    ),
  )
  return formatDateUtc(monday)
}

export function getVietnamWeekEndsAt(date = new Date()) {
  const key = getVietnamWeekKey(date)
  const [year, month, day] = key.split('-').map(Number)
  // Monday 00:00 Asia/Ho_Chi_Minh → next Monday.
  return new Date(Date.UTC(year, month - 1, day + 7) - 7 * 60 * 60 * 1000)
}

function uniquePick<T>(
  pool: readonly T[],
  count: number,
  random: () => number,
  key: (value: T) => string,
) {
  const remaining = [...pool]
  const result: T[] = []

  while (remaining.length && result.length < count) {
    const picked = pickOne(remaining, random)
    result.push(picked)
    const pickedKey = key(picked)
    const index = remaining.findIndex((item) => key(item) === pickedKey)
    if (index >= 0) remaining.splice(index, 1)
  }

  return result
}

export function createWeeklyChallenge(
  date = new Date(),
): WeeklyChallengeDefinition {
  const weekKey = getVietnamWeekKey(date)
  const seed = createSeed([
    'smartmart-weekly',
    weekKey,
    WEEKLY_CHALLENGE_VERSION,
  ])
  const random = createSeededRandom(seed)

  const onePerStall = stalls.map((stall) =>
    pickOne(
      stall.exerciseFamilyIds.map((id) => getExerciseFamilyById(id)),
      random,
    ),
  )

  const selectedIds = new Set(onePerStall.map((family) => family.id))
  const bonusPool = exerciseFamilies.filter(
    (family) => !selectedIds.has(family.id),
  )
  const bonus = pickOne(bonusPool, random)
  const mathFamilyIds = [...onePerStall, bonus].map((family) => family.id)

  const scenarioPool = workScenarios.filter(
    (scenario) => scenario.difficulty <= 2,
  )
  const firstScenario = pickOne(scenarioPool, random)
  const secondPool = scenarioPool.filter(
    (scenario) =>
      scenario.id !== firstScenario.id &&
      scenario.category !== firstScenario.category,
  )
  const secondScenario = pickOne(
    secondPool.length ? secondPool : scenarioPool.filter((item) => item.id !== firstScenario.id),
    random,
  )

  return {
    id: 'smartmart-week-' + weekKey + '-v' + WEEKLY_CHALLENGE_VERSION,
    version: WEEKLY_CHALLENGE_VERSION,
    weekKey,
    seed,
    title: 'SmartMart Weekly Arena',
    subtitle: '6 bài Toán · 2 tình huống · cùng độ khó, dữ kiện riêng',
    mathFamilyIds,
    scenarioIds: [firstScenario.id, secondScenario.id],
    targetSeconds: WEEKLY_TARGET_SECONDS,
    xpReward: WEEKLY_XP_REWARD,
    coinReward: WEEKLY_COIN_REWARD,
  }
}

function shuffleWithRandom<T>(items: readonly T[], random: () => number) {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = result[index]
    result[index] = result[swapIndex]
    result[swapIndex] = current
  }

  return result
}

export function createWeeklyMathExercises(
  challenge: WeeklyChallengeDefinition,
  variantKey = 'shared-preview',
): ExerciseInstance[] {
  return challenge.mathFamilyIds.map((familyId, index) =>
    generateExercise(
      getExerciseFamilyById(familyId),
      challenge.id + ':' + variantKey,
      100 + index,
    ),
  )
}

export function getWeeklyScenarios(
  challenge: WeeklyChallengeDefinition,
): WorkScenarioDefinition[] {
  return challenge.scenarioIds.map((id) => getWorkScenario(id))
}

export function createWeeklyScenarioRounds(
  challenge: WeeklyChallengeDefinition,
  variantKey = 'shared-preview',
): WeeklyScenarioRound[] {
  return challenge.scenarioIds.map((scenarioId, index) => {
    const scenario = getWorkScenario(scenarioId)
    const variantSeed = createSeed([
      challenge.id,
      'scenario-round',
      variantKey,
      index,
    ])
    const random = createSeededRandom(variantSeed)

    return {
      scenario,
      variantSeed,
      choiceOrder: shuffleWithRandom(
        scenario.choices.map((choice) => choice.id),
        random,
      ),
    }
  })
}

export function scoreWeeklyChallenge({
  challenge,
  firstTryCorrect,
  totalMathAttempts,
  choiceIds,
  elapsedMs,
}: {
  challenge: WeeklyChallengeDefinition
  firstTryCorrect: number
  totalMathAttempts: number
  choiceIds: string[]
  elapsedMs: number
}): WeeklyChallengeRunScore {
  const mathCount = challenge.mathFamilyIds.length
  const accuracyRatio = mathCount
    ? Math.min(1, Math.max(0, firstTryCorrect / mathCount))
    : 0
  const accuracy = accuracyRatio * 55

  const scenarios = getWeeklyScenarios(challenge)
  const qualities = scenarios.map((scenario, index) => {
    const choice = scenario.choices.find((item) => item.id === choiceIds[index])
    return choice ? choiceQuality(choice) : 0
  })
  const decisionQuality = qualities.length
    ? qualities.reduce((sum, value) => sum + value, 0) / qualities.length
    : 0
  const decisions = decisionQuality * 30

  const time = timeEfficiencyScore(
    elapsedMs,
    challenge.targetSeconds,
    15,
  )

  // Repeated attempts already lower first-try accuracy. This tiny guard prevents
  // accidental impossible payloads from receiving a perfect score locally.
  const attemptPenalty =
    totalMathAttempts < mathCount ? 5 : 0

  const total = Math.max(
    0,
    Math.round((accuracy + decisions + time - attemptPenalty) * 100) / 100,
  )

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    decisions: Math.round(decisions * 100) / 100,
    time,
    total,
    stars: starsFromScore(total),
    decisionQuality: Math.round(decisionQuality * 10000) / 10000,
  }
}
