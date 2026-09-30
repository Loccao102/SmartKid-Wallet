import type {
  WorkBasketItem,
  WorkShiftTemplateDefinition,
} from '../domain/types'

export interface WorkCustomerBlueprint {
  key: string
  basket: WorkBasketItem[]
  cashGiven: number
}

export const traineeShiftTemplate: WorkShiftTemplateDefinition = {
  id: 'work-shift-trainee-01',
  version: 2,
  title: 'Ca làm việc 01',
  subtitle: 'Phục vụ 3 khách đầu tiên với dữ kiện thay đổi sau mỗi lượt chơi.',
  roleTitle: 'Nhân viên tập sự',
  customerCount: 3,
  scenarioCount: 2,
  minScenarioDifficulty: 1,
  maxScenarioDifficulty: 1,
  mathDifficulty: 1,
  startingEmployeeRating: 4,
  startingStoreReputation: 4,
  startingCustomerSatisfaction: 4,
}

export const advancedShiftTemplate: WorkShiftTemplateDefinition = {
  id: 'work-shift-counter-rush-02',
  version: 1,
  title: 'Ca làm việc 02',
  subtitle: 'Quầy đông khách: phục vụ 6 khách với các tình huống được sinh theo seed.',
  roleTitle: 'Nhân viên tập sự',
  customerCount: 6,
  scenarioCount: 4,
  minScenarioDifficulty: 1,
  maxScenarioDifficulty: 2,
  mathDifficulty: 2,
  startingEmployeeRating: 4,
  startingStoreReputation: 4,
  startingCustomerSatisfaction: 4,
}

export const expertShiftTemplate: WorkShiftTemplateDefinition = {
  id: 'work-shift-weekend-peak-03',
  version: 1,
  title: 'Ca làm việc 03 · Cuối tuần cao điểm',
  subtitle:
    '8 khách, 5 tình huống và cả các sự cố khó hơn của một ca SmartMart đông người.',
  roleTitle: 'Thu ngân SmartMart',
  customerCount: 8,
  scenarioCount: 5,
  minScenarioDifficulty: 1,
  maxScenarioDifficulty: 3,
  mathDifficulty: 3,
  startingEmployeeRating: 4,
  startingStoreReputation: 4,
  startingCustomerSatisfaction: 4,
}

export const workCustomerNames = [
  'Cô Hương',
  'Chú Nam',
  'Chị Mai',
  'Anh Dũng',
  'Cô Hoa',
  'Chú Bình',
  'Chị Linh',
  'Anh Tuấn',
  'Cô Nga',
  'Chú Sơn',
  'Chị Vân',
  'Anh Khoa',
] as const

export const normalCustomerBlueprints: WorkCustomerBlueprint[] = [
  {
    key: 'normal-breakfast',
    basket: [
      { name: 'giỏ bánh mì mini', quantity: 2, unitPrice: 36000 },
      { name: 'lốc sữa', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-fruit-drink',
    basket: [
      { name: 'túi táo', quantity: 2, unitPrice: 30000 },
      { name: 'lốc nước suối', quantity: 2, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-snack',
    basket: [
      { name: 'hộp cupcake', quantity: 2, unitPrice: 40000 },
      { name: 'lốc trà trái cây', quantity: 1, unitPrice: 35000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-class-supplies',
    basket: [
      { name: 'gói cốc giấy', quantity: 2, unitPrice: 18000 },
      { name: 'gói khăn giấy', quantity: 2, unitPrice: 15000 },
      { name: 'lốc nước ép', quantity: 1, unitPrice: 42000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-fruit-box',
    basket: [
      { name: 'hộp nho', quantity: 2, unitPrice: 42000 },
      { name: 'lốc nước suối', quantity: 1, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-sandwich',
    basket: [
      { name: 'hộp sandwich', quantity: 2, unitPrice: 45000 },
      { name: 'lốc sữa', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 200000,
  },
]

export const scenarioCustomerBlueprints: Record<string, WorkCustomerBlueprint> = {
  SCENARIO_DAMAGED_DRINK: {
    key: 'damaged-drink',
    basket: [
      { name: 'lốc nước ép', quantity: 2, unitPrice: 42000 },
      { name: 'gói khăn giấy', quantity: 1, unitPrice: 15000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_VALID_VOUCHER: {
    key: 'valid-voucher',
    basket: [
      { name: 'hộp cupcake', quantity: 2, unitPrice: 40000 },
      { name: 'lốc trà trái cây', quantity: 1, unitPrice: 35000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_NEAR_EXPIRY_YOGURT: {
    key: 'near-expiry-yogurt',
    basket: [
      { name: 'lốc sữa chua', quantity: 2, unitPrice: 42000 },
      { name: 'giỏ bánh mì mini', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_WRONG_SHELF_PRICE: {
    key: 'wrong-shelf-price',
    basket: [
      { name: 'bình nước', quantity: 1, unitPrice: 50000 },
      { name: 'túi táo', quantity: 2, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_DUPLICATE_SCAN: {
    key: 'duplicate-scan',
    basket: [
      { name: 'lốc sữa trên POS', quantity: 2, unitPrice: 36000 },
      { name: 'túi táo', quantity: 1, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_EXPIRED_VOUCHER: {
    key: 'expired-voucher',
    basket: [
      { name: 'hộp sandwich', quantity: 2, unitPrice: 45000 },
      { name: 'lốc nước ép', quantity: 1, unitPrice: 42000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_CUSTOMER_BUDGET: {
    key: 'customer-budget',
    basket: [
      { name: 'hộp cupcake', quantity: 2, unitPrice: 40000 },
      { name: 'lốc nước suối', quantity: 1, unitPrice: 30000 },
      { name: 'gói khăn giấy', quantity: 1, unitPrice: 15000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_LOW_STOCK_SUBSTITUTE: {
    key: 'low-stock-substitute',
    basket: [
      { name: 'lốc sữa', quantity: 2, unitPrice: 36000 },
      { name: 'hộp sandwich', quantity: 1, unitPrice: 45000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_EXTRA_CASH: {
    key: 'extra-cash',
    basket: [
      { name: 'hộp nho', quantity: 2, unitPrice: 42000 },
      { name: 'lốc nước ép', quantity: 1, unitPrice: 42000 },
    ],
    cashGiven: 250000,
  },
  SCENARIO_PROMO_SIGN_MISSING: {
    key: 'stale-promo-sign',
    basket: [
      { name: 'balo', quantity: 1, unitPrice: 100000 },
      { name: 'lốc nước suối', quantity: 1, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_RETURN_NO_RECEIPT: {
    key: 'return-no-receipt',
    basket: [
      { name: 'túi cam', quantity: 1, unitPrice: 36000 },
      { name: 'gói khăn giấy', quantity: 1, unitPrice: 15000 },
    ],
    cashGiven: 100000,
  },
  SCENARIO_DAMAGED_EGGS: {
    key: 'damaged-eggs',
    basket: [
      { name: 'hộp trứng', quantity: 1, unitPrice: 42000 },
      { name: 'giỏ bánh mì mini', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 100000,
  },
  SCENARIO_QUEUE_PRIORITY: {
    key: 'queue-priority',
    basket: [
      { name: 'lốc nước suối', quantity: 1, unitPrice: 30000 },
      { name: 'gói khăn giấy', quantity: 1, unitPrice: 15000 },
    ],
    cashGiven: 100000,
  },
  SCENARIO_UNIT_PRICE_COMPARISON: {
    key: 'unit-price-comparison',
    basket: [
      { name: 'gói ngũ cốc lớn', quantity: 1, unitPrice: 78000 },
      { name: 'lốc sữa', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_FROZEN_ITEM_LEFT_OUT: {
    key: 'frozen-item-left-out',
    basket: [
      { name: 'gói thực phẩm đông lạnh', quantity: 1, unitPrice: 68000 },
      { name: 'lốc nước ép', quantity: 1, unitPrice: 42000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_COUPON_STACKING: {
    key: 'coupon-stacking',
    basket: [
      { name: 'balo', quantity: 1, unitPrice: 100000 },
      { name: 'hộp sandwich', quantity: 1, unitPrice: 45000 },
    ],
    cashGiven: 200000,
  },

}
