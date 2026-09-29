import type { StallDefinition } from '../domain/types'

export const stalls: StallDefinition[] = [
  {
    id: 'produce',
    order: 1,
    icon: '🍎',
    name: 'Rau củ & trái cây',
    description: 'Làm quen với khối lượng, đơn giá và chất lượng hàng hóa.',
    skills: ['multiplication', 'unit-price'],
    challenge: {
      id: 'unlock-produce-001',
      prompt: '3 kg cam giá 38.000đ/kg. Tổng tiền là bao nhiêu?',
      answer: 114000,
      unit: 'đ',
    },
  },
  {
    id: 'food',
    order: 2,
    icon: '🥚',
    name: 'Thực phẩm',
    description: 'Tính số lượng và định mức cho nhiều người.',
    skills: ['multiplication', 'budget'],
    challenge: {
      id: 'unlock-food-001',
      prompt: 'Mỗi người cần 2 quả trứng. Gia đình 4 người cần bao nhiêu quả?',
      answer: 8,
      unit: 'quả',
    },
  },
  {
    id: 'drinks',
    order: 3,
    icon: '🥛',
    name: 'Đồ uống',
    description: 'Tính hóa đơn và tiền thừa.',
    skills: ['addition', 'subtraction'],
    challenge: {
      id: 'unlock-drinks-001',
      prompt: 'Hóa đơn 137.000đ, khách đưa 200.000đ. Cần trả lại bao nhiêu?',
      answer: 63000,
      unit: 'đ',
    },
  },
  {
    id: 'supplies',
    order: 4,
    icon: '✏️',
    name: 'Đồ dùng',
    description: 'Lựa chọn trong giới hạn ngân sách.',
    skills: ['addition', 'budget'],
    challenge: {
      id: 'unlock-supplies-001',
      prompt: 'Vở 28.000đ và bút 17.000đ. Mua cả hai cần bao nhiêu?',
      answer: 45000,
      unit: 'đ',
    },
  },
  {
    id: 'promotion',
    order: 5,
    icon: '🏷️',
    name: 'Khuyến mãi',
    description: 'Tính giảm giá và phần trăm trước khi vào ca thật.',
    skills: ['percentage', 'subtraction'],
    challenge: {
      id: 'unlock-promotion-001',
      prompt: 'Balo 250.000đ giảm 20%. Giá sau giảm là bao nhiêu?',
      answer: 200000,
      unit: 'đ',
    },
  },
]
