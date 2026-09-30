import type { WorkWorldEffect } from '../domain/types'

const effects: Record<string, WorkWorldEffect> = {
  'SCENARIO_DAMAGED_DRINK:replace-and-inform': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_DAMAGED_DRINK:sell-as-normal': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_DAMAGED_DRINK:silent-discount': {
    clearFlags: ['complaint-risk', 'cash-discrepancy'],
  },

  'SCENARIO_NEAR_EXPIRY_YOGURT:inform-and-offer-choice': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_NEAR_EXPIRY_YOGURT:discount-with-consent': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_NEAR_EXPIRY_YOGURT:hide-expiry': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'near-expiry-return',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách phản hồi về sản phẩm gần hết hạn',
        description:
          'Khách trước liên hệ lại vì phát hiện hạn dùng còn rất ngắn và cho biết họ muốn đổi sản phẩm.',
        employeeRatingDelta: -0.1,
        storeReputationDelta: -0.25,
        customerSatisfactionDelta: -0.15,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_WRONG_SHELF_PRICE:honor-shelf-price': {
    clearFlags: ['pricing-mismatch'],
  },
  'SCENARIO_WRONG_SHELF_PRICE:charge-pos-price': {
    setFlags: ['pricing-mismatch'],
    deferredConsequences: [
      {
        id: 'repeat-price-dispute',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách sau tiếp tục gặp sai lệch giá',
        description:
          'Biển giá chưa được xử lý nên một khách tiếp theo lại thắc mắc vì giá trên kệ khác giá tại POS.',
        employeeRatingDelta: -0.1,
        storeReputationDelta: -0.25,
        customerSatisfactionDelta: -0.15,
        clearFlags: ['pricing-mismatch'],
      },
    ],
  },
  'SCENARIO_WRONG_SHELF_PRICE:ask-manager-hold-line': {
    clearFlags: ['pricing-mismatch'],
  },

  'SCENARIO_DUPLICATE_SCAN:remove-duplicate': {
    clearFlags: ['billing-dispute'],
  },
  'SCENARIO_DUPLICATE_SCAN:leave-duplicate': {
    setFlags: ['billing-dispute'],
    deferredConsequences: [
      {
        id: 'duplicate-charge-dispute',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách phát hiện bị tính trùng',
        description:
          'Khách kiểm tra hóa đơn và quay lại báo rằng một sản phẩm đã bị quét hai lần.',
        employeeRatingDelta: -0.2,
        storeReputationDelta: -0.2,
        customerSatisfactionDelta: -0.2,
        clearFlags: ['billing-dispute'],
      },
    ],
  },
  'SCENARIO_DUPLICATE_SCAN:refund-later': {
    clearFlags: ['billing-dispute'],
  },

  'SCENARIO_LOW_STOCK_SUBSTITUTE:offer-substitute': {
    setFlags: ['inventory-pressure'],
    deferredConsequences: [
      {
        id: 'stock-pressure-followup',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách sau không tìm thấy sản phẩm cũ',
        description:
          'Tồn kho vẫn thiếu nên một khách sau phải đổi sang sản phẩm khác trước khi nhân viên kho kịp bổ sung.',
        employeeRatingDelta: 0,
        storeReputationDelta: -0.05,
        customerSatisfactionDelta: -0.1,
        clearFlags: ['inventory-pressure'],
      },
    ],
  },
  'SCENARIO_LOW_STOCK_SUBSTITUTE:swap-without-asking': {
    setFlags: ['inventory-pressure', 'complaint-risk'],
    deferredConsequences: [
      {
        id: 'unapproved-substitute-complaint',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách không đồng ý với sản phẩm thay thế',
        description:
          'Khách trước phát hiện sản phẩm đã bị đổi mà không hỏi ý kiến và quay lại yêu cầu đổi hàng.',
        employeeRatingDelta: -0.15,
        storeReputationDelta: -0.15,
        customerSatisfactionDelta: -0.2,
        clearFlags: ['complaint-risk'],
      },
      {
        id: 'stock-pressure-after-swap',
        trigger: 'after-customers',
        delayCustomers: 2,
        title: 'Kệ hàng vẫn thiếu sản phẩm',
        description:
          'Tồn kho chưa được bổ sung nên khách sau tiếp tục không mua được đúng sản phẩm cần.',
        employeeRatingDelta: 0,
        storeReputationDelta: -0.05,
        customerSatisfactionDelta: -0.1,
        clearFlags: ['inventory-pressure'],
      },
    ],
  },
  'SCENARIO_LOW_STOCK_SUBSTITUTE:charge-original': {
    setFlags: ['inventory-pressure'],
    deferredConsequences: [
      {
        id: 'stock-check-delay',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Kiểm tra kho làm quầy chậm hơn một chút',
        description:
          'Việc tìm đúng sản phẩm giúp khách có thêm cơ hội mua món họ cần, nhưng hàng chờ phải đợi trong lúc nhân viên kiểm tra kho.',
        employeeRatingDelta: 0,
        storeReputationDelta: 0.02,
        customerSatisfactionDelta: -0.04,
        clearFlags: ['inventory-pressure'],
      },
    ],
  },

  'SCENARIO_EXTRA_CASH:return-extra-cash': {
    clearFlags: ['cash-discrepancy'],
  },
  'SCENARIO_EXTRA_CASH:keep-extra-cash': {
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'cash-drawer-audit',
        trigger: 'shift-end',
        title: 'Cuối ca phát hiện chênh lệch tiền mặt',
        description:
          'Đối soát cuối ca cho thấy ngăn kéo có khoản tiền thừa không khớp với các giao dịch đã ghi nhận.',
        employeeRatingDelta: -0.35,
        storeReputationDelta: -0.2,
        customerSatisfactionDelta: 0,
        clearFlags: ['cash-discrepancy'],
      },
    ],
  },
  'SCENARIO_EXTRA_CASH:wait-until-customer-notices': {
    clearFlags: ['cash-discrepancy'],
  },

  'SCENARIO_PROMO_SIGN_MISSING:honor-visible-promo': {
    clearFlags: ['stale-promo-sign'],
  },
  'SCENARIO_PROMO_SIGN_MISSING:deny-visible-promo': {
    setFlags: ['stale-promo-sign'],
    deferredConsequences: [
      {
        id: 'second-stale-promo-dispute',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách sau cũng nhìn thấy biển khuyến mãi cũ',
        description:
          'Biển chưa được tháo nên một khách tiếp theo tiếp tục yêu cầu áp dụng mức giảm đã hết hạn.',
        employeeRatingDelta: -0.05,
        storeReputationDelta: -0.25,
        customerSatisfactionDelta: -0.15,
        clearFlags: ['stale-promo-sign'],
      },
    ],
  },
  'SCENARIO_PROMO_SIGN_MISSING:remove-sign-only': {
    clearFlags: ['stale-promo-sign'],
  },
}

export function getWorkWorldEffect(
  scenarioId: string,
  choiceId: string,
): WorkWorldEffect | undefined {
  return effects[`${scenarioId}:${choiceId}`]
}

export const workWorldEffects = effects
