import type {
  WorkBasketItem,
  WorkShiftTemplateDefinition,
} from '../domain/types'

export interface WorkCustomerBlueprint {
  key: string
  basket: WorkBasketItem[]
  cashGiven: number
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
}
