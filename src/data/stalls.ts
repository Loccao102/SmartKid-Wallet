import type { StallDefinition } from '../domain/types'

export const stalls: StallDefinition[] = [
  {
    id: 'produce',
    order: 1,
    name: 'Rau củ & Hoa quả',
    description: 'Khối lượng, đơn giá, nhân/chia và đổi đơn vị.',
    skills: ['multiplication', 'division', 'unit-price', 'measurement'],
    exerciseFamilyIds: [
      'PRODUCE_UNIT_PRICE',
      'PRODUCE_FIND_WEIGHT',
      'PRODUCE_KG_TO_GRAMS',
    ],
  },
  {
    id: 'food',
    order: 2,
    name: 'Thực phẩm',
    description: 'Số lượng, chia đều, định mức và bài toán nhiều bước.',
    skills: ['multiplication', 'division', 'fraction'],
    exerciseFamilyIds: [
      'FOOD_PORTION_COUNT',
      'FOOD_PACK_COUNT',
      'FOOD_EQUAL_SHARE',
    ],
  },
  {
    id: 'drinks',
    order: 3,
    name: 'Đồ uống',
    description: 'Tổng tiền, hóa đơn và tiền thừa.',
    skills: ['addition', 'subtraction'],
    exerciseFamilyIds: [
      'DRINKS_CHANGE',
      'DRINKS_QUANTITY_TOTAL',
      'DRINKS_TWO_ITEM_TOTAL',
    ],
  },
  {
    id: 'supplies',
    order: 4,
    name: 'Đồ dùng',
    description: 'Ngân sách, tổng nhiều món và so sánh phương án.',
    skills: ['addition', 'budget', 'comparison'],
    exerciseFamilyIds: [
      'SUPPLIES_BUDGET',
      'SUPPLIES_PRICE_DIFFERENCE',
      'SUPPLIES_MAX_QUANTITY',
    ],
  },
  {
    id: 'promotion',
    order: 5,
    name: 'Khuyến mãi',
    description: 'Phần trăm, tăng/giảm giá và voucher.',
    skills: ['percentage', 'subtraction', 'comparison'],
    exerciseFamilyIds: [
      'PROMO_FINAL_PRICE',
      'PROMO_DISCOUNT_AMOUNT',
      'PROMO_PRICE_INCREASE',
    ],
  },
]
