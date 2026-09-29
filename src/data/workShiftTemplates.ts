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
      { name: '2 giỏ bánh mì mini', quantity: 2, unitPrice: 36000 },
      { name: '1 lốc sữa', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-fruit-drink',
    basket: [
      { name: '2 túi táo', quantity: 2, unitPrice: 30000 },
      { name: '2 lốc nước suối', quantity: 2, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-snack',
    basket: [
      { name: '2 hộp cupcake', quantity: 2, unitPrice: 40000 },
      { name: '1 lốc trà trái cây', quantity: 1, unitPrice: 35000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-class-supplies',
    basket: [
      { name: '2 gói cốc giấy', quantity: 2, unitPrice: 18000 },
      { name: '2 gói khăn giấy', quantity: 2, unitPrice: 15000 },
      { name: '1 lốc nước ép', quantity: 1, unitPrice: 42000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-fruit-box',
    basket: [
      { name: '2 hộp nho', quantity: 2, unitPrice: 42000 },
      { name: '1 lốc nước suối', quantity: 1, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  {
    key: 'normal-sandwich',
    basket: [
      { name: '2 hộp sandwich', quantity: 2, unitPrice: 45000 },
      { name: '1 lốc sữa', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 200000,
  },
]

export const scenarioCustomerBlueprints: Record<string, WorkCustomerBlueprint> = {
  SCENARIO_DAMAGED_DRINK: {
    key: 'damaged-drink',
    basket: [
      { name: '2 lốc nước ép', quantity: 2, unitPrice: 42000 },
      { name: '1 gói khăn giấy', quantity: 1, unitPrice: 15000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_VALID_VOUCHER: {
    key: 'valid-voucher',
    basket: [
      { name: '2 hộp cupcake', quantity: 2, unitPrice: 40000 },
      { name: '1 lốc trà trái cây', quantity: 1, unitPrice: 35000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_NEAR_EXPIRY_YOGURT: {
    key: 'near-expiry-yogurt',
    basket: [
      { name: '2 lốc sữa chua', quantity: 2, unitPrice: 42000 },
      { name: '1 giỏ bánh mì mini', quantity: 1, unitPrice: 36000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_WRONG_SHELF_PRICE: {
    key: 'wrong-shelf-price',
    basket: [
      { name: '1 bình nước', quantity: 1, unitPrice: 50000 },
      { name: '2 túi táo', quantity: 2, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_DUPLICATE_SCAN: {
    key: 'duplicate-scan',
    basket: [
      { name: '2 lốc sữa trên POS', quantity: 2, unitPrice: 36000 },
      { name: '1 túi táo', quantity: 1, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_EXPIRED_VOUCHER: {
    key: 'expired-voucher',
    basket: [
      { name: '2 hộp sandwich', quantity: 2, unitPrice: 45000 },
      { name: '1 lốc nước ép', quantity: 1, unitPrice: 42000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_CUSTOMER_BUDGET: {
    key: 'customer-budget',
    basket: [
      { name: '2 hộp cupcake', quantity: 2, unitPrice: 40000 },
      { name: '1 lốc nước ép', quantity: 1, unitPrice: 42000 },
      { name: '1 gói khăn giấy', quantity: 1, unitPrice: 15000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_LOW_STOCK_SUBSTITUTE: {
    key: 'low-stock-substitute',
    basket: [
      { name: '2 lốc sữa', quantity: 2, unitPrice: 36000 },
      { name: '1 hộp sandwich', quantity: 1, unitPrice: 45000 },
    ],
    cashGiven: 200000,
  },
  SCENARIO_EXTRA_CASH: {
    key: 'extra-cash',
    basket: [
      { name: '2 hộp nho', quantity: 2, unitPrice: 42000 },
      { name: '1 lốc nước ép', quantity: 1, unitPrice: 42000 },
    ],
    cashGiven: 250000,
  },
  SCENARIO_PROMO_SIGN_MISSING: {
    key: 'stale-promo-sign',
    basket: [
      { name: '1 balo', quantity: 1, unitPrice: 100000 },
      { name: '1 lốc nước suối', quantity: 1, unitPrice: 30000 },
    ],
    cashGiven: 200000,
  },
}
