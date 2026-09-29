import { createSeed, createSeededRandom, pickOne, pickSteppedNumber } from '../lib/seededRandom'
import type {
  ExerciseFamilyDefinition,
  ExerciseInstance,
  ExerciseParameter,
} from './types'

const currencyFormatter = new Intl.NumberFormat('vi-VN')

function formatMoney(value: number) {
  return currencyFormatter.format(value)
}

function getParameter(family: ExerciseFamilyDefinition, key: string): ExerciseParameter {
  const parameter = family.parameters.find((item) => item.key === key)

  if (!parameter) {
    throw new Error(`Missing parameter "${key}" in exercise family ${family.id}`)
  }

  return parameter
}

function pickListValue(
  family: ExerciseFamilyDefinition,
  key: string,
  random: () => number,
) {
  const parameter = getParameter(family, key)

  if (parameter.kind !== 'list') {
    throw new Error(`Parameter "${key}" must be a list`)
  }

  return pickOne(parameter.values, random)
}

function pickRangeValue(
  family: ExerciseFamilyDefinition,
  key: string,
  random: () => number,
  overrideMax?: number,
) {
  const parameter = getParameter(family, key)

  if (parameter.kind !== 'range') {
    throw new Error(`Parameter "${key}" must be a range`)
  }

  const max = Math.min(parameter.max, overrideMax ?? parameter.max)

  if (max < parameter.min) {
    throw new Error(`No valid value available for parameter "${key}"`)
  }

  return pickSteppedNumber(parameter.min, max, parameter.step, random)
}

function createBaseInstance(
  family: ExerciseFamilyDefinition,
  studentKey: string,
  variantIndex: number,
) {
  const seed = createSeed([studentKey, family.id, variantIndex])
  const random = createSeededRandom(seed)

  return { seed, random }
}

export function generateExercise(
  family: ExerciseFamilyDefinition,
  studentKey: string,
  variantIndex = 0,
): ExerciseInstance {
  const { seed, random } = createBaseInstance(family, studentKey, variantIndex)

  switch (family.generatorType) {
    case 'unit-price-total': {
      const product = String(pickListValue(family, 'product', random))
      const weightKg = Number(pickListValue(family, 'weightKg', random))
      const unitPrice = pickRangeValue(family, 'unitPrice', random)
      const answer = weightKg * unitPrice

      return {
        id: `${family.id}-${seed}`,
        familyId: family.id,
        stallId: family.stallId,
        seed,
        prompt: `${weightKg} kg ${product} có giá ${formatMoney(unitPrice)}đ/kg. Em cần trả bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { product, weightKg, unitPrice },
      }
    }

    case 'portion-count': {
      const item = String(pickListValue(family, 'item', random))
      const people = pickRangeValue(family, 'people', random)
      const portionPerPerson = Number(pickListValue(family, 'portionPerPerson', random))
      const answer = people * portionPerPerson

      return {
        id: `${family.id}-${seed}`,
        familyId: family.id,
        stallId: family.stallId,
        seed,
        prompt: `Có ${people} người. Mỗi người cần ${portionPerPerson} ${item}. Cần chuẩn bị tất cả bao nhiêu ${item}?`,
        answer,
        unit: item,
        parameters: { item, people, portionPerPerson },
      }
    }

    case 'cash-change': {
      const cashGiven = Number(pickListValue(family, 'cashGiven', random))
      const billTotal = pickRangeValue(family, 'billTotal', random, cashGiven - 1000)
      const answer = cashGiven - billTotal

      return {
        id: `${family.id}-${seed}`,
        familyId: family.id,
        stallId: family.stallId,
        seed,
        prompt: `Hóa đơn là ${formatMoney(billTotal)}đ. Khách đưa ${formatMoney(cashGiven)}đ. Em cần trả lại bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { billTotal, cashGiven },
      }
    }

    case 'budget-basket': {
      const itemA = String(pickListValue(family, 'itemA', random))
      const itemB = String(pickListValue(family, 'itemB', random))
      const budget = Number(pickListValue(family, 'budget', random))
      const priceA = pickRangeValue(family, 'priceA', random, Math.floor(budget * 0.55))
      const priceB = pickRangeValue(
        family,
        'priceB',
        random,
        Math.max(5000, budget - priceA - 5000),
      )
      const answer = budget - priceA - priceB

      return {
        id: `${family.id}-${seed}`,
        familyId: family.id,
        stallId: family.stallId,
        seed,
        prompt: `Em có ${formatMoney(budget)}đ. Một ${itemA} giá ${formatMoney(priceA)}đ và một ${itemB} giá ${formatMoney(priceB)}đ. Mua cả hai xong em còn bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { itemA, itemB, budget, priceA, priceB },
      }
    }

    case 'discount-final-price': {
      const product = String(pickListValue(family, 'product', random))
      const originalPrice = pickRangeValue(family, 'originalPrice', random)
      const discountRate = Number(pickListValue(family, 'discountRate', random))
      const discountAmount = (originalPrice * discountRate) / 100
      const answer = originalPrice - discountAmount

      return {
        id: `${family.id}-${seed}`,
        familyId: family.id,
        stallId: family.stallId,
        seed,
        prompt: `Một ${product} giá ${formatMoney(originalPrice)}đ, đang giảm ${discountRate}%. Sau khi giảm giá, sản phẩm còn bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { product, originalPrice, discountRate, discountAmount },
      }
    }

    default:
      throw new Error(`Unsupported generator type: ${family.generatorType}`)
  }
}
