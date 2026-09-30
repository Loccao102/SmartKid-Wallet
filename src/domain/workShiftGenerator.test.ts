import { describe, expect, it } from 'vitest'
import { workScenarios } from '../data/workShift'
import {
  advancedShiftTemplate,
  expertShiftTemplate,
  scenarioCustomerBlueprints,
} from '../data/workShiftTemplates'
import { calculateEffectiveTotal } from './workShiftEngine'
import {
  generateWorkShiftInstance,
  workShiftFingerprintSimilarity,
} from './workShiftGenerator'

describe('seeded work shift generator', () => {
  it('replays exactly the same shift for the same student and variant', () => {
    const first = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-a',
      0,
    )
    const replay = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-a',
      0,
    )

    expect(replay).toEqual(first)
  })

  it('creates a six-customer shift with four unique seeded scenarios', () => {
    const shift = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-a',
      0,
    )

    expect(shift.customers).toHaveLength(6)

    const scenarioCustomers = shift.customers.filter(
      (customer) => customer.scenarioId,
    )
    expect(scenarioCustomers).toHaveLength(4)

    const scenarioIds = scenarioCustomers.map((customer) => customer.scenarioId!)
    expect(new Set(scenarioIds).size).toBe(4)

    const scenarioCategories = scenarioIds.map(
      (id) => workScenarios.find((scenario) => scenario.id === id)!.category,
    )
    expect(new Set(scenarioCategories).size).toBe(4)

    const customerNames = shift.customers.map((customer) => customer.name)
    expect(new Set(customerNames).size).toBe(6)
  })

  it('creates an eight-customer weekend peak shift with five scenarios', () => {
    const shift = generateWorkShiftInstance(
      expertShiftTemplate,
      'student-weekend',
      0,
    )

    expect(shift.customers).toHaveLength(8)
    expect(
      shift.customers.filter((customer) => customer.scenarioId),
    ).toHaveLength(5)
    expect(
      shift.customers.some((customer) => {
        if (!customer.scenarioId) return false
        return (
          workScenarios.find((scenario) => scenario.id === customer.scenarioId)
            ?.difficulty === 3
        )
      }),
    ).toBe(true)
  })

  it('stores scenario versions in the generated instance', () => {
    const shift = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-version-check',
      0,
    )

    for (const customer of shift.customers) {
      if (!customer.scenarioId) {
        expect(customer.scenarioVersion).toBeUndefined()
        continue
      }

      const scenario = workScenarios.find(
        (item) => item.id === customer.scenarioId,
      )

      expect(customer.scenarioVersion).toBe(scenario?.version)
    }
  })

  it('changes the generated instance when the student changes', () => {
    const studentA = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-a',
      0,
    )
    const studentB = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-b',
      0,
    )

    expect(studentA.seed).not.toBe(studentB.seed)
    expect(studentA.id).not.toBe(studentB.id)
    expect(studentA.customers[0].id).not.toBe(studentB.customers[0].id)
  })

  it('keeps every scenario blueprint payable for every choice', () => {
    for (const scenario of workScenarios) {
      const blueprint = scenarioCustomerBlueprints[scenario.id]
      expect(blueprint).toBeDefined()

      for (const choice of scenario.choices) {
        const payable = calculateEffectiveTotal(blueprint.basket, choice)

        expect(payable).toBeGreaterThanOrEqual(0)
        expect(blueprint.cashGiven).toBeGreaterThanOrEqual(payable)
      }
    }
  })

  it('generates valid shifts across many students and variants', () => {
    for (let studentIndex = 0; studentIndex < 30; studentIndex += 1) {
      for (let variant = 0; variant < 3; variant += 1) {
        const shift = generateWorkShiftInstance(
          advancedShiftTemplate,
          'student-' + studentIndex,
          variant,
        )

        expect(shift.customers).toHaveLength(6)
        expect(
          shift.customers.filter((customer) => customer.scenarioId),
        ).toHaveLength(4)
      }
    }
  })

  it('changes the basket and answer space on a new replay variant', () => {
    const first = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-replay',
      0,
    )
    const next = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-replay',
      1,
    )

    expect(next.seed).not.toBe(first.seed)
    expect(next.fingerprint).not.toBe(first.fingerprint)
    expect(next.customers.map((customer) => customer.basket)).not.toEqual(
      first.customers.map((customer) => customer.basket),
    )
  })

  it('regenerates when a candidate is too similar to recent play', () => {
    const first = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-antirepeat',
      2,
    )
    const regenerated = generateWorkShiftInstance(
      advancedShiftTemplate,
      'student-antirepeat',
      2,
      {
        recentFingerprints: [first.fingerprint],
        maxSimilarity: 0.95,
      },
    )

    expect(regenerated.generationAttempt).toBeGreaterThan(0)
    expect(regenerated.fingerprint).not.toBe(first.fingerprint)
    expect(
      workShiftFingerprintSimilarity(
        regenerated.fingerprint,
        first.fingerprint,
      ),
    ).toBeLessThan(0.95)
  })

  it('keeps generated bills payable after price and quantity variation', () => {
    for (let variant = 0; variant < 20; variant += 1) {
      const shift = generateWorkShiftInstance(
        expertShiftTemplate,
        'student-payable',
        variant,
      )

      expect(shift.difficultyScore).toBeGreaterThan(0)
      expect(shift.difficultyScore).toBeLessThanOrEqual(1)

      for (const customer of shift.customers) {
        const scenario = customer.scenarioId
          ? workScenarios.find((item) => item.id === customer.scenarioId)
          : undefined
        const maximumPayable = Math.max(
          calculateEffectiveTotal(customer.basket),
          ...(scenario?.choices.map((choice) =>
            calculateEffectiveTotal(customer.basket, choice),
          ) ?? []),
        )

        expect(customer.cashGiven).toBeGreaterThanOrEqual(maximumPayable)
      }
    }
  })


  it('seeds scenario framing and shuffles choice positions without changing choices', () => {
    const first = generateWorkShiftInstance(
      expertShiftTemplate,
      'student-scenario-presentation',
      4,
    )
    const replay = generateWorkShiftInstance(
      expertShiftTemplate,
      'student-scenario-presentation',
      4,
    )

    expect(replay).toEqual(first)

    for (const customer of first.customers.filter((item) => item.scenarioId)) {
      const scenario = workScenarios.find((item) => item.id === customer.scenarioId)!
      expect(customer.scenarioVariantKey).toBeTruthy()
      expect(customer.scenarioDescription).toBeTruthy()
      expect(customer.scenarioChoiceOrder).toHaveLength(scenario.choices.length)
      expect(new Set(customer.scenarioChoiceOrder)).toEqual(
        new Set(scenario.choices.map((choice) => choice.id)),
      )
    }
  })

  it('changes scenario presentation across replay variants', () => {
    const signatures = new Set<string>()

    for (let variant = 0; variant < 8; variant += 1) {
      const shift = generateWorkShiftInstance(
        expertShiftTemplate,
        'student-scenario-variety',
        variant,
      )
      signatures.add(
        shift.customers
          .filter((customer) => customer.scenarioId)
          .map(
            (customer) =>
              customer.scenarioId +
              ':' +
              customer.scenarioVariantKey +
              ':' +
              customer.scenarioChoiceOrder?.join('.'),
          )
          .join('|'),
      )
    }

    expect(signatures.size).toBeGreaterThan(4)
  })

})
