import type { StallDefinition } from '../domain/types'

export const stalls: StallDefinition[] = [
  {
    id: 'produce',
    order: 1,
    icon: '🍎',
    name: 'Rau củ & Hoa quả',
    description: 'Khối lượng, đơn giá, nhân/chia và đổi đơn vị.',
    skills: ['multiplication', 'division', 'unit-price', 'measurement'],
    exerciseFamilyIds: ['PRODUCE_UNIT_PRICE'],
  },
  {
    id: 'food',
    order: 2,
    icon: '🥚',
    name: 'Thực phẩm',
    description: 'Số lượng, chia đều, định mức và bài toán nhiều bước.',
    skills: ['multiplication', 'division', 'fraction'],
    exerciseFamilyIds: ['FOOD_PORTION_COUNT'],
  },
  {
    id: 'drinks',
    order: 3,
    icon: '🥛',
    name: 'Đồ uống',
    description: 'Tổng tiền, hóa đơn và tiền thừa.',
    skills: ['addition', 'subtraction'],
    exerciseFamilyIds: ['DRINKS_CHANGE'],
  },
  {
    id: 'supplies',
    order: 4,
    icon: '✏️',
    name: 'Đồ dùng',
    description: 'Ngân sách, tổng nhiều món và so sánh phương án.',
    skills: ['addition', 'budget', 'comparison'],
    exerciseFamilyIds: ['SUPPLIES_BUDGET'],
  },
  {
    id: 'promotion',
    order: 5,
    icon: '🏷️',
    name: 'Khuyến mãi',
    description: 'Phần trăm, tăng/giảm giá và voucher.',
    skills: ['percentage', 'subtraction', 'comparison'],
    exerciseFamilyIds: ['PROMO_FINAL_PRICE'],
  },
]
