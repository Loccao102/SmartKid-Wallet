import { workScenarios } from '../data/workShift'
import {
  normalCustomerBlueprints,
  scenarioCustomerBlueprints,
  workCustomerNames,
  type WorkCustomerBlueprint,
} from '../data/workShiftTemplates'
import {
  createSeed,
  createSeededRandom,
  pickOne,
} from '../lib/seededRandom'
import type {
  WorkCustomerDefinition,
  WorkScenarioDefinition,
  WorkShiftInstance,
  WorkShiftTemplateDefinition,
} from './types'

export interface WorkShiftGenerationOptions {
  recentFingerprints?: string[]
  maxSimilarity?: number
  maxRegenerations?: number
}

const requestLines = [
  'Mình nhờ em kiểm tra tổng tiền những món này nhé.',
  'Em tính giúp mình hóa đơn hôm nay với nhé.',
  'Mình muốn thanh toán giỏ hàng này, em kiểm tra giúp nhé.',
  'Em xem giúp mình tổng số tiền cần trả là bao nhiêu nhé.',
  'Mình mua những món này, nhờ em tính hóa đơn giúp.',
] as const

const scenarioPresentationStyles = [
  {
    key: 'noticed',
    titlePrefix: '',
    describe: (customerName: string, description: string) =>
      'Khi chuẩn bị chốt hóa đơn cho ' + customerName + ', em để ý thấy: ' + description,
  },
  {
    key: 'customer-check',
    titlePrefix: 'Khách hỏi lại · ',
    describe: (customerName: string, description: string) =>
      customerName + ' dừng lại kiểm tra giỏ hàng và nhờ em xem kỹ. ' + description,
  },
  {
    key: 'busy-counter',
    titlePrefix: 'Quầy đang bận · ',
    describe: (_customerName: string, description: string) =>
      'Giữa lúc hàng chờ đang dài hơn, một tình huống cần xử lý xuất hiện. ' + description,
  },
  {
    key: 'before-payment',
    titlePrefix: 'Trước khi thanh toán · ',
    describe: (customerName: string, description: string) =>
      'Ngay trước khi ' + customerName + ' thanh toán, em phát hiện thêm một chi tiết. ' + description,
  },
] as const

const priceMultipliers: Record<1 | 2 | 3, readonly number[]> = {
  1: [0.9, 0.95, 1, 1.05, 1.1],
  2: [0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15],
  3: [0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2],
}

const quantityOffsets: Record<1 | 2 | 3, readonly number[]> = {
  1: [0, 0, 0, 1],
  2: [-1, 0, 0, 1, 1],
  3: [-1, 0, 1, 1, 2],
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

function selectScenarios(
  template: WorkShiftTemplateDefinition,
  random: () => number,
) {
  const eligible = workScenarios.filter(
    (scenario) =>
      scenario.difficulty >= template.minScenarioDifficulty &&
      scenario.difficulty <= template.maxScenarioDifficulty &&
      scenarioCustomerBlueprints[scenario.id],
  )

  if (eligible.length < template.scenarioCount) {
    throw new Error(
      `Not enough eligible scenarios for template ${template.id}. Needed ${template.scenarioCount}, found ${eligible.length}.`,
    )
  }

  const shuffled = shuffleWithRandom(eligible, random)
  const selected: WorkScenarioDefinition[] = []
  const usedCategories = new Set<string>()

  if (template.maxScenarioDifficulty === 3) {
    const hardest = shuffled.find((scenario) => scenario.difficulty === 3)
    if (hardest) {
      selected.push(hardest)
      usedCategories.add(hardest.category)
    }
  }

  for (const scenario of shuffled) {
    if (selected.length >= template.scenarioCount) break
    if (selected.some((item) => item.id === scenario.id)) continue
    if (usedCategories.has(scenario.category)) continue

    selected.push(scenario)
    usedCategories.add(scenario.category)
  }

  if (selected.length < template.scenarioCount) {
    for (const scenario of shuffled) {
      if (selected.length >= template.scenarioCount) break
      if (selected.some((item) => item.id === scenario.id)) continue
      selected.push(scenario)
    }
  }

  return selected
}

function roundPrice(value: number) {
  return Math.max(5000, Math.round(value / 1000) * 1000)
}

function varyBasket(
  blueprint: WorkCustomerBlueprint,
  random: () => number,
  difficulty: 1 | 2 | 3,
) {
  return blueprint.basket.map((item) => {
    const multiplier = pickOne(priceMultipliers[difficulty], random)
    const quantityOffset = pickOne(quantityOffsets[difficulty], random)

    return {
      ...item,
      quantity: Math.max(1, Math.min(5, item.quantity + quantityOffset)),
      unitPrice: roundPrice(item.unitPrice * multiplier),
    }
  })
}

function calculateBasketTotal(
  basket: WorkCustomerDefinition['basket'],
) {
  return basket.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  )
}

function chooseCashGiven(
  basketTotal: number,
  scenario: WorkScenarioDefinition | undefined,
  random: () => number,
) {
  const highestBillDelta = Math.max(
    0,
    ...(scenario?.choices.map((choice) => choice.billDelta) ?? [0]),
  )
  const required = basketTotal + highestBillDelta
  const denominations = [100000, 200000, 500000, 1000000]
  const eligible = denominations.filter((amount) => amount >= required)

  if (eligible.length === 0) {
    return Math.ceil(required / 100000) * 100000
  }

  const near = eligible.slice(0, Math.min(2, eligible.length))
  return pickOne(near, random)
}

function createCustomerFromBlueprint(
  blueprint: WorkCustomerBlueprint,
  name: string,
  id: string,
  random: () => number,
  mathDifficulty: 1 | 2 | 3,
  scenario?: WorkScenarioDefinition,
): WorkCustomerDefinition {
  const basket = varyBasket(blueprint, random, mathDifficulty)
  const basketTotal = calculateBasketTotal(basket)
  const presentation = scenario
    ? pickOne(scenarioPresentationStyles, random)
    : undefined
  const scenarioChoiceOrder = scenario
    ? shuffleWithRandom(
        scenario.choices.map((choice) => choice.id),
        random,
      )
    : undefined

  return {
    id,
    name,
    basket,
    cashGiven: chooseCashGiven(basketTotal, scenario, random),
    requestLine: pickOne(requestLines, random),
    scenarioId: scenario?.id,
    scenarioVersion: scenario?.version,
    scenarioVariantKey: presentation?.key,
    scenarioTitle:
      scenario && presentation
        ? presentation.titlePrefix + scenario.title
        : undefined,
    scenarioDescription:
      scenario && presentation
        ? presentation.describe(name, scenario.description)
        : undefined,
    scenarioChoiceOrder,
  }
}

function normalizeFingerprintText(value: string) {
  return value
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
}

export function buildWorkShiftFingerprint(
  shift: Pick<WorkShiftInstance, 'customers'> | { customers: WorkCustomerDefinition[] },
) {
  const tokens: string[] = []

  shift.customers.forEach((customer, customerIndex) => {
    const position = customerIndex + 1
    tokens.push(
      `c${position}:scenario:${customer.scenarioId ?? 'normal'}`,
      `c${position}:variant:${customer.scenarioVariantKey ?? 'none'}`,
      `c${position}:choice-order:${customer.scenarioChoiceOrder?.join('.') ?? 'none'}`,
      `c${position}:cash:${Math.round(customer.cashGiven / 50000)}`,
    )

    customer.basket.forEach((item, itemIndex) => {
      tokens.push(
        `c${position}:i${itemIndex + 1}:name:${normalizeFingerprintText(item.name)}`,
        `c${position}:i${itemIndex + 1}:qty:${item.quantity}`,
        `c${position}:i${itemIndex + 1}:price:${Math.round(item.unitPrice / 5000)}`,
      )
    })
  })

  return tokens.join('|')
}

export function workShiftFingerprintSimilarity(a: string, b: string) {
  if (a === b) return 1

  const aTokens = new Set(a.split('|').filter(Boolean))
  const bTokens = new Set(b.split('|').filter(Boolean))
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length
  const union = new Set([...aTokens, ...bTokens]).size

  return union === 0 ? 0 : intersection / union
}

function estimateDifficultyScore(
  template: WorkShiftTemplateDefinition,
  customers: WorkCustomerDefinition[],
  selectedScenarios: WorkScenarioDefinition[],
) {
  const mathBase = template.mathDifficulty / 3
  const scenarioBase =
    selectedScenarios.length === 0
      ? 0
      : selectedScenarios.reduce(
          (sum, scenario) => sum + scenario.difficulty / 3,
          0,
        ) / selectedScenarios.length
  const averageLines =
    customers.reduce((sum, customer) => sum + customer.basket.length, 0) /
    Math.max(1, customers.length)
  const basketComplexity = Math.min(1, averageLines / 3)

  return Number(
    Math.min(
      1,
      Math.max(0, mathBase * 0.5 + scenarioBase * 0.35 + basketComplexity * 0.15),
    ).toFixed(3),
  )
}

function buildShiftCandidate(
  template: WorkShiftTemplateDefinition,
  studentKey: string,
  variantIndex: number,
  generationAttempt: number,
): WorkShiftInstance {
  const seed = createSeed([
    studentKey,
    template.id,
    template.version,
    variantIndex,
    generationAttempt,
  ])
  const random = createSeededRandom(seed)

  const selectedScenarios = selectScenarios(template, random)
  const normalCount = template.customerCount - selectedScenarios.length

  if (normalCount > normalCustomerBlueprints.length) {
    throw new Error(
      `Not enough normal customer blueprints for template ${template.id}.`,
    )
  }

  if (template.customerCount > workCustomerNames.length) {
    throw new Error(
      `Not enough unique customer names for template ${template.id}.`,
    )
  }

  const scenarioEntries = selectedScenarios.map((scenario) => ({
    blueprint: scenarioCustomerBlueprints[scenario.id],
    scenario,
  }))

  const normalEntries = shuffleWithRandom(normalCustomerBlueprints, random)
    .slice(0, normalCount)
    .map((blueprint) => ({
      blueprint,
      scenario: undefined,
    }))

  const customerEntries = shuffleWithRandom(
    [...scenarioEntries, ...normalEntries],
    random,
  )
  const names = shuffleWithRandom(workCustomerNames, random).slice(
    0,
    template.customerCount,
  )

  const customers = customerEntries.map((entry, index) =>
    createCustomerFromBlueprint(
      entry.blueprint,
      names[index],
      `${template.id}-${seed}-customer-${index + 1}`,
      random,
      template.mathDifficulty,
      entry.scenario,
    ),
  )

  const partial = {
    id: `${template.id}-seed-${seed}`,
    templateId: template.id,
    templateVersion: template.version,
    seed,
    studentKey,
    variantIndex,
    generationAttempt,
    title: template.title,
    subtitle: template.subtitle,
    roleTitle: template.roleTitle,
    guidanceLevel: template.guidanceLevel,
    customers,
    startingEmployeeRating: template.startingEmployeeRating,
    startingStoreReputation: template.startingStoreReputation,
    startingCustomerSatisfaction: template.startingCustomerSatisfaction,
  }

  return {
    ...partial,
    fingerprint: buildWorkShiftFingerprint(partial),
    difficultyScore: estimateDifficultyScore(
      template,
      customers,
      selectedScenarios,
    ),
  }
}

export function generateWorkShiftInstance(
  template: WorkShiftTemplateDefinition,
  studentKey: string,
  variantIndex = 0,
  options: WorkShiftGenerationOptions = {},
): WorkShiftInstance {
  if (template.customerCount <= 0) {
    throw new Error('Work Shift customerCount must be greater than zero.')
  }

  if (template.scenarioCount > template.customerCount) {
    throw new Error('Work Shift scenarioCount cannot exceed customerCount.')
  }

  const recentFingerprints = options.recentFingerprints ?? []
  const maxSimilarity = options.maxSimilarity ?? 0.82
  const maxRegenerations = Math.max(1, options.maxRegenerations ?? 16)

  let fallback: WorkShiftInstance | null = null
  let fallbackSimilarity = Number.POSITIVE_INFINITY

  for (
    let generationAttempt = 0;
    generationAttempt < maxRegenerations;
    generationAttempt += 1
  ) {
    const candidate = buildShiftCandidate(
      template,
      studentKey,
      variantIndex,
      generationAttempt,
    )

    if (recentFingerprints.length === 0) return candidate

    const similarity = Math.max(
      ...recentFingerprints.map((fingerprint) =>
        workShiftFingerprintSimilarity(candidate.fingerprint, fingerprint),
      ),
    )

    if (similarity < fallbackSimilarity) {
      fallback = candidate
      fallbackSimilarity = similarity
    }

    if (similarity < maxSimilarity) return candidate
  }

  if (fallback) return fallback

  throw new Error(`Unable to generate work shift for template ${template.id}.`)
}
