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

export function validateExerciseInstance(instance: ExerciseInstance) {
  const errors: string[] = []

  if (!instance.prompt.trim()) {
    errors.push('Prompt must not be empty.')
  }

  if (!Number.isFinite(instance.answer)) {
    errors.push('Answer must be finite.')
  }

  if (!Number.isInteger(instance.answer)) {
    errors.push('MVP answers must be integers.')
  }

  if (instance.answer < 0) {
    errors.push('Answer must not be negative.')
  }

  for (const [key, value] of Object.entries(instance.parameters)) {
    if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) {
      errors.push(`Invalid numeric parameter: ${key}.`)
    }
  }

  return errors
}

function finalize(instance: ExerciseInstance) {
  const errors = validateExerciseInstance(instance)

  if (errors.length > 0) {
    throw new Error(
      `Invalid generated exercise ${instance.familyId}: ${errors.join(' ')}`,
    )
  }

  return instance
}

export function generateExercise(
  family: ExerciseFamilyDefinition,
  studentKey: string,
  variantIndex = 0,
): ExerciseInstance {
  const { seed, random } = createBaseInstance(family, studentKey, variantIndex)
  const base = {
    id: `${family.id}-${seed}`,
    familyId: family.id,
    stallId: family.stallId,
    seed,
  }

  switch (family.generatorType) {
    case 'unit-price-total': {
      const product = String(pickListValue(family, 'product', random))
      const weightKg = Number(pickListValue(family, 'weightKg', random))
      const unitPrice = pickRangeValue(family, 'unitPrice', random)
      const answer = weightKg * unitPrice

      return finalize({
        ...base,
        prompt: `${weightKg} kg ${product} có giá ${formatMoney(unitPrice)}đ/kg. Em cần trả bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { product, weightKg, unitPrice },
      })
    }

    case 'find-weight-from-total': {
      const product = String(pickListValue(family, 'product', random))
      const weightKg = Number(pickListValue(family, 'weightKg', random))
      const unitPrice = pickRangeValue(family, 'unitPrice', random)
      const totalPrice = weightKg * unitPrice

      return finalize({
        ...base,
        prompt: `${product} có giá ${formatMoney(unitPrice)}đ/kg. Một túi ${product} có tổng giá ${formatMoney(totalPrice)}đ. Túi đó nặng bao nhiêu kg?`,
        answer: weightKg,
        unit: 'kg',
        parameters: { product, weightKg, unitPrice, totalPrice },
      })
    }

    case 'kg-to-grams': {
      const product = String(pickListValue(family, 'product', random))
      const weightKg = Number(pickListValue(family, 'weightKg', random))
      const answer = weightKg * 1000

      return finalize({
        ...base,
        prompt: `Một túi ${product} nặng ${weightKg} kg. Khối lượng đó bằng bao nhiêu gam?`,
        answer,
        unit: 'g',
        parameters: { product, weightKg },
      })
    }

    case 'portion-count': {
      const item = String(pickListValue(family, 'item', random))
      const people = pickRangeValue(family, 'people', random)
      const portionPerPerson = Number(pickListValue(family, 'portionPerPerson', random))
      const answer = people * portionPerPerson

      return finalize({
        ...base,
        prompt: `Có ${people} người. Mỗi người cần ${portionPerPerson} ${item}. Cần chuẩn bị tất cả bao nhiêu ${item}?`,
        answer,
        unit: item,
        parameters: { item, people, portionPerPerson },
      })
    }

    case 'pack-count': {
      const item = String(pickListValue(family, 'item', random))
      const packSize = Number(pickListValue(family, 'packSize', random))
      const packCount = Number(pickListValue(family, 'packCount', random))
      const totalItems = packSize * packCount

      return finalize({
        ...base,
        prompt: `Cần ${totalItems} ${item}. Mỗi gói có ${packSize} ${item}. Cần mua bao nhiêu gói?`,
        answer: packCount,
        unit: 'gói',
        parameters: { item, packSize, packCount, totalItems },
      })
    }

    case 'equal-share': {
      const item = String(pickListValue(family, 'item', random))
      const groupCount = Number(pickListValue(family, 'groupCount', random))
      const perGroup = Number(pickListValue(family, 'perGroup', random))
      const totalItems = groupCount * perGroup

      return finalize({
        ...base,
        prompt: `Có ${totalItems} ${item} chia đều cho ${groupCount} nhóm. Mỗi nhóm nhận được bao nhiêu ${item}?`,
        answer: perGroup,
        unit: item,
        parameters: { item, groupCount, perGroup, totalItems },
      })
    }

    case 'cash-change': {
      const cashGiven = Number(pickListValue(family, 'cashGiven', random))
      const billTotal = pickRangeValue(family, 'billTotal', random, cashGiven - 1000)
      const answer = cashGiven - billTotal

      return finalize({
        ...base,
        prompt: `Hóa đơn là ${formatMoney(billTotal)}đ. Khách đưa ${formatMoney(cashGiven)}đ. Em cần trả lại bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { billTotal, cashGiven },
      })
    }

    case 'quantity-total': {
      const drink = String(pickListValue(family, 'drink', random))
      const quantity = Number(pickListValue(family, 'quantity', random))
      const unitPrice = pickRangeValue(family, 'unitPrice', random)
      const answer = quantity * unitPrice

      return finalize({
        ...base,
        prompt: `Một ${drink} giá ${formatMoney(unitPrice)}đ. Mua ${quantity} hộp/chai như vậy hết bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { drink, quantity, unitPrice },
      })
    }

    case 'two-item-total': {
      const drinkA = String(pickListValue(family, 'drinkA', random))
      const drinkB = String(pickListValue(family, 'drinkB', random))
      const quantityA = Number(pickListValue(family, 'quantityA', random))
      const quantityB = Number(pickListValue(family, 'quantityB', random))
      const priceA = pickRangeValue(family, 'priceA', random)
      const priceB = pickRangeValue(family, 'priceB', random)
      const answer = quantityA * priceA + quantityB * priceB

      return finalize({
        ...base,
        prompt: `Mua ${quantityA} ${drinkA}, mỗi món ${formatMoney(priceA)}đ và ${quantityB} ${drinkB}, mỗi món ${formatMoney(priceB)}đ. Tổng hóa đơn là bao nhiêu?`,
        answer,
        unit: 'đ',
        parameters: { drinkA, drinkB, quantityA, quantityB, priceA, priceB },
      })
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

      return finalize({
        ...base,
        prompt: `Em có ${formatMoney(budget)}đ. Một ${itemA} giá ${formatMoney(priceA)}đ và một ${itemB} giá ${formatMoney(priceB)}đ. Mua cả hai xong em còn bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { itemA, itemB, budget, priceA, priceB },
      })
    }

    case 'price-difference': {
      const item = String(pickListValue(family, 'item', random))
      const lowerPrice = pickRangeValue(family, 'lowerPrice', random)
      const difference = Number(pickListValue(family, 'difference', random))
      const higherPrice = lowerPrice + difference

      return finalize({
        ...base,
        prompt: `Hai cửa hàng bán cùng một ${item}. Nơi A giá ${formatMoney(lowerPrice)}đ, nơi B giá ${formatMoney(higherPrice)}đ. Nơi A rẻ hơn bao nhiêu tiền?`,
        answer: difference,
        unit: 'đ',
        parameters: { item, lowerPrice, higherPrice, difference },
      })
    }

    case 'max-quantity-budget': {
      const item = String(pickListValue(family, 'item', random))
      const unitPrice = Number(pickListValue(family, 'unitPrice', random))
      const budget = Number(pickListValue(family, 'budget', random))
      const answer = Math.floor(budget / unitPrice)

      return finalize({
        ...base,
        prompt: `Em có ${formatMoney(budget)}đ. Mỗi ${item} giá ${formatMoney(unitPrice)}đ. Em mua được nhiều nhất bao nhiêu ${item}?`,
        answer,
        unit: item,
        parameters: { item, unitPrice, budget },
      })
    }

    case 'discount-final-price': {
      const product = String(pickListValue(family, 'product', random))
      const originalPrice = pickRangeValue(family, 'originalPrice', random)
      const discountRate = Number(pickListValue(family, 'discountRate', random))
      const discountAmount = (originalPrice * discountRate) / 100
      const answer = originalPrice - discountAmount

      return finalize({
        ...base,
        prompt: `Một ${product} giá ${formatMoney(originalPrice)}đ, đang giảm ${discountRate}%. Sau khi giảm giá, sản phẩm còn bao nhiêu tiền?`,
        answer,
        unit: 'đ',
        parameters: { product, originalPrice, discountRate, discountAmount },
      })
    }

    case 'discount-amount': {
      const product = String(pickListValue(family, 'product', random))
      const originalPrice = pickRangeValue(family, 'originalPrice', random)
      const discountRate = Number(pickListValue(family, 'discountRate', random))
      const answer = (originalPrice * discountRate) / 100

      return finalize({
        ...base,
        prompt: `Một ${product} giá ${formatMoney(originalPrice)}đ và được giảm ${discountRate}%. Số tiền được giảm là bao nhiêu?`,
        answer,
        unit: 'đ',
        parameters: { product, originalPrice, discountRate },
      })
    }

    case 'price-increase': {
      const product = String(pickListValue(family, 'product', random))
      const originalPrice = pickRangeValue(family, 'originalPrice', random)
      const increaseRate = Number(pickListValue(family, 'increaseRate', random))
      const increaseAmount = (originalPrice * increaseRate) / 100
      const answer = originalPrice + increaseAmount

      return finalize({
        ...base,
        prompt: `Một ${product} đang có giá ${formatMoney(originalPrice)}đ. Giá tăng thêm ${increaseRate}%. Giá mới là bao nhiêu?`,
        answer,
        unit: 'đ',
        parameters: { product, originalPrice, increaseRate, increaseAmount },
      })
    }

    default:
      throw new Error(`Unsupported generator type: ${family.generatorType}`)
  }
}
