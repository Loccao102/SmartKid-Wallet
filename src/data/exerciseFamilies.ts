import type { ExerciseFamilyDefinition } from '../domain/types'

export const exerciseFamilies: ExerciseFamilyDefinition[] = [
  {
    id: 'PRODUCE_UNIT_PRICE',
    stallId: 'produce',
    name: 'Khối lượng × đơn giá',
    description: 'Tính tổng tiền từ khối lượng và đơn giá.',
    skills: ['multiplication', 'unit-price', 'measurement'],
    difficulty: 1,
    generatorType: 'unit-price-total',
    parameters: [
      { kind: 'list', key: 'weightKg', values: [1, 2, 3, 4, 5] },
      { kind: 'range', key: 'unitPrice', min: 12000, max: 60000, step: 1000 },
    ],
  },
  {
    id: 'FOOD_PORTION_COUNT',
    stallId: 'food',
    name: 'Định mức theo số người',
    description: 'Tính số lượng cần mua dựa trên số người và định mức.',
    skills: ['multiplication', 'division'],
    difficulty: 1,
    generatorType: 'portion-count',
    parameters: [
      { kind: 'range', key: 'people', min: 4, max: 30, step: 1 },
      { kind: 'list', key: 'portionPerPerson', values: [1, 2, 3, 4] },
    ],
  },
  {
    id: 'DRINKS_CHANGE',
    stallId: 'drinks',
    name: 'Tính tiền thừa',
    description: 'Tính số tiền cần trả lại sau khi thanh toán.',
    skills: ['addition', 'subtraction'],
    difficulty: 1,
    generatorType: 'cash-change',
    parameters: [
      { kind: 'range', key: 'billTotal', min: 20000, max: 450000, step: 1000 },
      { kind: 'list', key: 'cashGiven', values: [50000, 100000, 200000, 500000] },
    ],
  },
  {
    id: 'SUPPLIES_BUDGET',
    stallId: 'supplies',
    name: 'Mua trong ngân sách',
    description: 'Tính tổng nhiều món và kiểm tra giới hạn ngân sách.',
    skills: ['addition', 'budget', 'comparison'],
    difficulty: 2,
    generatorType: 'budget-basket',
    parameters: [
      { kind: 'range', key: 'budget', min: 100000, max: 500000, step: 10000 },
      { kind: 'list', key: 'itemCount', values: [2, 3, 4] },
    ],
  },
  {
    id: 'PROMO_FINAL_PRICE',
    stallId: 'promotion',
    name: 'Giá sau giảm',
    description: 'Tính số tiền được giảm và giá phải trả sau khuyến mãi.',
    skills: ['percentage', 'subtraction'],
    difficulty: 2,
    generatorType: 'discount-final-price',
    parameters: [
      { kind: 'range', key: 'originalPrice', min: 100000, max: 500000, step: 10000 },
      { kind: 'list', key: 'discountRate', values: [10, 20, 25, 30] },
    ],
  },
]
