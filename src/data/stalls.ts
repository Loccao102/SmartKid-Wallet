import type { StallDefinition } from '../domain/types'

export const stalls: StallDefinition[] = [
  {
    id: 'produce',
    order: 1,
    name: 'Rau củ & Hoa quả',
    description: 'Khối lượng, đơn giá, nhân/chia và đổi đơn vị.',
    skills: ['multiplication', 'division', 'unit-price', 'measurement'],
    unlockFamilyIds: [
      'PRODUCE_UNIT_PRICE',
      'PRODUCE_FIND_WEIGHT',
      'PRODUCE_KG_TO_GRAMS',
    ],
    exerciseFamilyIds: [
      'PRODUCE_UNIT_PRICE',
      'PRODUCE_FIND_WEIGHT',
      'PRODUCE_KG_TO_GRAMS',
      'PRODUCE_FIND_UNIT_PRICE',
    ],
  },
  {
    id: 'food',
    order: 2,
    name: 'Thực phẩm',
    description: 'Số lượng, chia đều, định mức và bài toán nhiều bước.',
    skills: ['multiplication', 'division', 'fraction'],
    unlockFamilyIds: [
      'FOOD_PORTION_COUNT',
      'FOOD_PACK_COUNT',
      'FOOD_EQUAL_SHARE',
    ],
    exerciseFamilyIds: [
      'FOOD_PORTION_COUNT',
      'FOOD_PACK_COUNT',
      'FOOD_EQUAL_SHARE',
      'FOOD_STOCK_REMAINING',
    ],
  },
  {
    id: 'drinks',
    order: 3,
    name: 'Đồ uống',
    description: 'Tổng tiền, hóa đơn và tiền thừa.',
    skills: ['addition', 'subtraction'],
    unlockFamilyIds: [
      'DRINKS_CHANGE',
      'DRINKS_QUANTITY_TOTAL',
      'DRINKS_TWO_ITEM_TOTAL',
    ],
    exerciseFamilyIds: [
      'DRINKS_CHANGE',
      'DRINKS_QUANTITY_TOTAL',
      'DRINKS_TWO_ITEM_TOTAL',
      'DRINKS_FIND_UNIT_PRICE',
    ],
  },
  {
    id: 'supplies',
    order: 4,
    name: 'Đồ dùng',
    description: 'Ngân sách, tổng nhiều món và so sánh phương án.',
    skills: ['addition', 'budget', 'comparison'],
    unlockFamilyIds: [
      'SUPPLIES_BUDGET',
      'SUPPLIES_PRICE_DIFFERENCE',
      'SUPPLIES_MAX_QUANTITY',
    ],
    exerciseFamilyIds: [
      'SUPPLIES_BUDGET',
      'SUPPLIES_PRICE_DIFFERENCE',
      'SUPPLIES_MAX_QUANTITY',
      'SUPPLIES_MULTI_ITEM_TOTAL',
    ],
  },
  {
    id: 'promotion',
    order: 5,
    name: 'Khuyến mãi',
    description: 'Phần trăm, tăng/giảm giá và voucher.',
    skills: ['percentage', 'subtraction', 'comparison'],
    unlockFamilyIds: [
      'PROMO_FINAL_PRICE',
      'PROMO_DISCOUNT_AMOUNT',
      'PROMO_PRICE_INCREASE',
    ],
    exerciseFamilyIds: [
      'PROMO_FINAL_PRICE',
      'PROMO_DISCOUNT_AMOUNT',
      'PROMO_PRICE_INCREASE',
      'PROMO_COMPARE_SAVINGS',
    ],
  },
]
