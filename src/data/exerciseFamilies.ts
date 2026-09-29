import type { ExerciseFamilyDefinition } from '../domain/types'

export const exerciseFamilies: ExerciseFamilyDefinition[] = [
  // Produce
  {
    id: 'PRODUCE_UNIT_PRICE',
    stallId: 'produce',
    name: 'Khối lượng × đơn giá',
    description: 'Tính tổng tiền từ khối lượng và đơn giá.',
    skills: ['multiplication', 'unit-price', 'measurement'],
    difficulty: 1,
    generatorType: 'unit-price-total',
    parameters: [
      { kind: 'list', key: 'product', values: ['cam', 'táo', 'lê', 'nho'] },
      { kind: 'list', key: 'weightKg', values: [1, 2, 3, 4, 5] },
      { kind: 'range', key: 'unitPrice', min: 12000, max: 60000, step: 1000 },
    ],
  },
  {
    id: 'PRODUCE_FIND_WEIGHT',
    stallId: 'produce',
    name: 'Tìm khối lượng',
    description: 'Tìm số kg khi biết đơn giá và tổng tiền.',
    skills: ['division', 'unit-price', 'measurement'],
    difficulty: 1,
    generatorType: 'find-weight-from-total',
    parameters: [
      { kind: 'list', key: 'product', values: ['cam', 'táo', 'lê', 'nho'] },
      { kind: 'list', key: 'weightKg', values: [2, 3, 4, 5, 6] },
      { kind: 'range', key: 'unitPrice', min: 12000, max: 50000, step: 1000 },
    ],
  },
  {
    id: 'PRODUCE_KG_TO_GRAMS',
    stallId: 'produce',
    name: 'Đổi kg sang gam',
    description: 'Đổi khối lượng từ kg sang gam.',
    skills: ['multiplication', 'measurement'],
    difficulty: 1,
    generatorType: 'kg-to-grams',
    parameters: [
      { kind: 'list', key: 'product', values: ['cam', 'táo', 'khoai tây', 'cà chua'] },
      { kind: 'list', key: 'weightKg', values: [1, 2, 3, 4, 5] },
    ],
  },
  {
    id: 'PRODUCE_FIND_UNIT_PRICE',
    stallId: 'produce',
    name: 'Tìm đơn giá',
    description: 'Tìm giá mỗi kg khi biết khối lượng và tổng tiền.',
    skills: ['division', 'unit-price', 'measurement'],
    difficulty: 2,
    generatorType: 'find-unit-price-from-total',
    parameters: [
      { kind: 'list', key: 'product', values: ['cam', 'táo', 'lê', 'nho'] },
      { kind: 'list', key: 'weightKg', values: [2, 3, 4, 5] },
      { kind: 'range', key: 'unitPrice', min: 12000, max: 50000, step: 1000 },
    ],
  },

  // Food
  {
    id: 'FOOD_PORTION_COUNT',
    stallId: 'food',
    name: 'Định mức theo số người',
    description: 'Tính số lượng cần mua dựa trên số người và định mức.',
    skills: ['multiplication', 'division'],
    difficulty: 1,
    generatorType: 'portion-count',
    parameters: [
      { kind: 'list', key: 'item', values: ['quả trứng', 'hộp sữa chua', 'chiếc bánh mì'] },
      { kind: 'range', key: 'people', min: 4, max: 30, step: 1 },
      { kind: 'list', key: 'portionPerPerson', values: [1, 2, 3, 4] },
    ],
  },
  {
    id: 'FOOD_PACK_COUNT',
    stallId: 'food',
    name: 'Tính số gói cần mua',
    description: 'Tìm số gói khi biết tổng số món cần và số món mỗi gói.',
    skills: ['division'],
    difficulty: 1,
    generatorType: 'pack-count',
    parameters: [
      { kind: 'list', key: 'item', values: ['bánh', 'xúc xích', 'hộp sữa'] },
      { kind: 'list', key: 'packSize', values: [2, 3, 4, 5, 6] },
      { kind: 'list', key: 'packCount', values: [2, 3, 4, 5, 6] },
    ],
  },
  {
    id: 'FOOD_EQUAL_SHARE',
    stallId: 'food',
    name: 'Chia đều',
    description: 'Chia đều một số lượng món ăn cho các nhóm.',
    skills: ['division'],
    difficulty: 1,
    generatorType: 'equal-share',
    parameters: [
      { kind: 'list', key: 'item', values: ['chiếc bánh', 'quả trứng', 'hộp sữa chua'] },
      { kind: 'list', key: 'groupCount', values: [2, 3, 4, 5, 6] },
      { kind: 'list', key: 'perGroup', values: [2, 3, 4, 5] },
    ],
  },
  {
    id: 'FOOD_STOCK_REMAINING',
    stallId: 'food',
    name: 'Số lượng còn lại',
    description: 'Tính lượng hàng còn lại sau khi đã bán một phần.',
    skills: ['subtraction'],
    difficulty: 1,
    generatorType: 'stock-remaining',
    parameters: [
      { kind: 'list', key: 'item', values: ['hộp sữa chua', 'chiếc bánh', 'quả trứng'] },
      { kind: 'list', key: 'sold', values: [5, 10, 12, 15, 20] },
      { kind: 'list', key: 'remaining', values: [5, 8, 10, 12, 15, 20] },
    ],
  },

  // Drinks
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
    id: 'DRINKS_QUANTITY_TOTAL',
    stallId: 'drinks',
    name: 'Số lượng × đơn giá',
    description: 'Tính tổng tiền của nhiều chai cùng loại.',
    skills: ['multiplication', 'addition'],
    difficulty: 1,
    generatorType: 'quantity-total',
    parameters: [
      { kind: 'list', key: 'drink', values: ['nước suối', 'sữa hộp', 'nước ép', 'trà trái cây'] },
      { kind: 'list', key: 'quantity', values: [2, 3, 4, 5, 6, 8] },
      { kind: 'range', key: 'unitPrice', min: 8000, max: 30000, step: 1000 },
    ],
  },
  {
    id: 'DRINKS_TWO_ITEM_TOTAL',
    stallId: 'drinks',
    name: 'Hóa đơn hai loại đồ uống',
    description: 'Tính tổng hóa đơn từ hai loại đồ uống.',
    skills: ['addition', 'multiplication'],
    difficulty: 2,
    generatorType: 'two-item-total',
    parameters: [
      { kind: 'list', key: 'drinkA', values: ['nước suối', 'sữa hộp'] },
      { kind: 'list', key: 'drinkB', values: ['nước ép', 'trà trái cây'] },
      { kind: 'list', key: 'quantityA', values: [2, 3, 4] },
      { kind: 'list', key: 'quantityB', values: [2, 3, 4] },
      { kind: 'range', key: 'priceA', min: 8000, max: 20000, step: 1000 },
      { kind: 'range', key: 'priceB', min: 12000, max: 30000, step: 1000 },
    ],
  },
  {
    id: 'DRINKS_FIND_UNIT_PRICE',
    stallId: 'drinks',
    name: 'Tìm giá mỗi chai',
    description: 'Tìm đơn giá khi biết số lượng và tổng tiền.',
    skills: ['division', 'unit-price'],
    difficulty: 2,
    generatorType: 'find-drink-unit-price',
    parameters: [
      { kind: 'list', key: 'drink', values: ['nước suối', 'sữa hộp', 'nước ép', 'trà trái cây'] },
      { kind: 'list', key: 'quantity', values: [2, 3, 4, 5, 6] },
      { kind: 'range', key: 'unitPrice', min: 8000, max: 30000, step: 1000 },
    ],
  },

  // Supplies
  {
    id: 'SUPPLIES_BUDGET',
    stallId: 'supplies',
    name: 'Mua trong ngân sách',
    description: 'Tính tổng nhiều món và số tiền còn lại trong ngân sách.',
    skills: ['addition', 'subtraction', 'budget', 'comparison'],
    difficulty: 2,
    generatorType: 'budget-basket',
    parameters: [
      { kind: 'list', key: 'itemA', values: ['vở', 'bút chì', 'bút mực', 'thước'] },
      { kind: 'list', key: 'itemB', values: ['tẩy', 'bút màu', 'hộp bút', 'giấy màu'] },
      { kind: 'range', key: 'priceA', min: 10000, max: 90000, step: 1000 },
      { kind: 'range', key: 'priceB', min: 5000, max: 100000, step: 1000 },
      { kind: 'list', key: 'budget', values: [100000, 150000, 200000, 300000, 500000] },
    ],
  },
  {
    id: 'SUPPLIES_PRICE_DIFFERENCE',
    stallId: 'supplies',
    name: 'So sánh hai mức giá',
    description: 'Tính chênh lệch giữa hai lựa chọn.',
    skills: ['subtraction', 'comparison'],
    difficulty: 1,
    generatorType: 'price-difference',
    parameters: [
      { kind: 'list', key: 'item', values: ['hộp bút', 'balo', 'bộ bút màu', 'quyển vở'] },
      { kind: 'range', key: 'lowerPrice', min: 10000, max: 120000, step: 5000 },
      { kind: 'list', key: 'difference', values: [5000, 10000, 15000, 20000, 25000] },
    ],
  },
  {
    id: 'SUPPLIES_MAX_QUANTITY',
    stallId: 'supplies',
    name: 'Mua tối đa bao nhiêu món',
    description: 'Tìm số lượng tối đa có thể mua trong một ngân sách.',
    skills: ['division', 'budget'],
    difficulty: 2,
    generatorType: 'max-quantity-budget',
    parameters: [
      { kind: 'list', key: 'item', values: ['quyển vở', 'chiếc bút', 'thước kẻ', 'hộp màu'] },
      { kind: 'list', key: 'unitPrice', values: [10000, 12000, 15000, 20000, 25000] },
      { kind: 'list', key: 'budget', values: [50000, 80000, 100000, 120000, 150000, 200000] },
    ],
  },
  {
    id: 'SUPPLIES_MULTI_ITEM_TOTAL',
    stallId: 'supplies',
    name: 'Tổng tiền nhiều món',
    description: 'Tính tổng tiền khi mua nhiều số lượng của hai món.',
    skills: ['addition', 'multiplication', 'budget'],
    difficulty: 2,
    generatorType: 'supplies-multi-item-total',
    parameters: [
      { kind: 'list', key: 'itemA', values: ['vở', 'bút chì', 'bút mực'] },
      { kind: 'list', key: 'itemB', values: ['thước', 'tẩy', 'bút màu'] },
      { kind: 'list', key: 'quantityA', values: [2, 3, 4, 5] },
      { kind: 'list', key: 'quantityB', values: [2, 3, 4] },
      { kind: 'range', key: 'priceA', min: 5000, max: 30000, step: 1000 },
      { kind: 'range', key: 'priceB', min: 5000, max: 40000, step: 1000 },
    ],
  },

  // Promotion
  {
    id: 'PROMO_FINAL_PRICE',
    stallId: 'promotion',
    name: 'Giá sau giảm',
    description: 'Tính giá phải trả sau khuyến mãi.',
    skills: ['percentage', 'subtraction'],
    difficulty: 2,
    generatorType: 'discount-final-price',
    parameters: [
      { kind: 'list', key: 'product', values: ['áo khoác', 'balo', 'giày thể thao', 'hộp bút'] },
      { kind: 'range', key: 'originalPrice', min: 100000, max: 500000, step: 10000 },
      { kind: 'list', key: 'discountRate', values: [10, 20, 25, 30] },
    ],
  },
  {
    id: 'PROMO_DISCOUNT_AMOUNT',
    stallId: 'promotion',
    name: 'Số tiền được giảm',
    description: 'Tính số tiền giảm từ giá gốc và phần trăm giảm.',
    skills: ['percentage', 'multiplication'],
    difficulty: 2,
    generatorType: 'discount-amount',
    parameters: [
      { kind: 'list', key: 'product', values: ['áo khoác', 'balo', 'giày thể thao', 'hộp bút'] },
      { kind: 'range', key: 'originalPrice', min: 100000, max: 500000, step: 10000 },
      { kind: 'list', key: 'discountRate', values: [10, 20, 25, 30] },
    ],
  },
  {
    id: 'PROMO_PRICE_INCREASE',
    stallId: 'promotion',
    name: 'Giá sau tăng',
    description: 'Tính giá mới sau khi tăng theo phần trăm.',
    skills: ['percentage', 'addition'],
    difficulty: 2,
    generatorType: 'price-increase',
    parameters: [
      { kind: 'list', key: 'product', values: ['balo', 'hộp bút', 'bình nước', 'áo khoác'] },
      { kind: 'range', key: 'originalPrice', min: 100000, max: 400000, step: 10000 },
      { kind: 'list', key: 'increaseRate', values: [10, 20, 25] },
    ],
  },
  {
    id: 'PROMO_COMPARE_SAVINGS',
    stallId: 'promotion',
    name: 'So sánh hai ưu đãi',
    description: 'So sánh số tiền tiết kiệm giữa giảm phần trăm và voucher.',
    skills: ['percentage', 'comparison', 'subtraction'],
    difficulty: 3,
    generatorType: 'compare-promotion-savings',
    parameters: [
      { kind: 'list', key: 'product', values: ['balo', 'áo khoác', 'giày thể thao', 'bình nước'] },
      { kind: 'range', key: 'originalPrice', min: 100000, max: 400000, step: 10000 },
      { kind: 'list', key: 'discountRate', values: [10, 20, 25] },
      { kind: 'list', key: 'voucherValue', values: [10000, 20000, 30000, 40000, 50000] },
    ],
  },
]

export function getExerciseFamilyById(id: string) {
  const family = exerciseFamilies.find((item) => item.id === id)

  if (!family) {
    throw new Error('Unknown exercise family: ' + id)
  }

  return family
}
