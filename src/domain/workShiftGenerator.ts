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
} from '../lib/seededRandom'
import type {
  WorkCustomerDefinition,
  WorkScenarioDefinition,
  WorkShiftInstance,
  WorkShiftTemplateDefinition,
} from './types'

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

  for (const scenario of shuffled) {
    if (selected.length >= template.scenarioCount) break
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

function createCustomerFromBlueprint(
  blueprint: WorkCustomerBlueprint,
  name: string,
  id: string,
  scenario?: WorkScenarioDefinition,
): WorkCustomerDefinition {
  return {
    id,
    name,
    basket: blueprint.basket.map((item) => ({ ...item })),
    cashGiven: blueprint.cashGiven,
    scenarioId: scenario?.id,
    scenarioVersion: scenario?.version,
  }
}

export function generateWorkShiftInstance(
  template: WorkShiftTemplateDefinition,
  studentKey: string,
  variantIndex = 0,
): WorkShiftInstance {
  if (template.customerCount <= 0) {
    throw new Error('Work Shift customerCount must be greater than zero.')
  }

  if (template.scenarioCount > template.customerCount) {
    throw new Error('Work Shift scenarioCount cannot exceed customerCount.')
  }

  const seed = createSeed([studentKey, template.id, template.version, variantIndex])
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
      entry.scenario,
    ),
  )

  return {
    id: `${template.id}-seed-${seed}`,
    templateId: template.id,
    templateVersion: template.version,
    seed,
    studentKey,
    variantIndex,
    title: template.title,
    subtitle: template.subtitle,
    roleTitle: template.roleTitle,
    customers,
    startingEmployeeRating: template.startingEmployeeRating,
    startingStoreReputation: template.startingStoreReputation,
    startingCustomerSatisfaction: template.startingCustomerSatisfaction,
  }
}
