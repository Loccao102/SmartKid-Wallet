import type { WorkWorldEffect } from '../domain/types'

const effects: Record<string, WorkWorldEffect> = {
  'SCENARIO_DAMAGED_DRINK:replace-and-inform': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_DAMAGED_DRINK:sell-as-normal': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'damaged-item-complaint',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách quay lại khiếu nại hàng bị móp',
        description:
          'Khách trước quay lại sau khi phát hiện hộp nước bị móp. Quầy phải dừng lại để đổi hàng và xử lý khiếu nại.',
        employeeRatingDelta: -0.15,
        storeReputationDelta: -0.25,
        customerSatisfactionDelta: -0.1,
        clearFlags: ['complaint-risk'],
      },
    ],
  },
  'SCENARIO_DAMAGED_DRINK:silent-discount': {
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'silent-discount-reconciliation',
        trigger: 'shift-end',
        title: 'Đối soát phát hiện khoản giảm giá không có lý do',
        description:
          'Cuối ca, hệ thống đối soát phát hiện một giao dịch bị giảm giá nhưng không có ghi chú giải thích.',
        employeeRatingDelta: -0.1,
        storeReputationDelta: -0.1,
        customerSatisfactionDelta: 0,
        clearFlags: ['cash-discrepancy'],
      },
    ],
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
    setFlags: ['billing-dispute'],
    deferredConsequences: [
      {
        id: 'delayed-refund-queue',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Quầy bị gián đoạn để hoàn tiền',
        description:
          'Khách quay lại yêu cầu hoàn tiền cho dòng bị quét trùng, khiến hàng chờ tại quầy chậm lại.',
        employeeRatingDelta: -0.1,
        storeReputationDelta: -0.1,
        customerSatisfactionDelta: -0.15,
        clearFlags: ['billing-dispute'],
      },
    ],
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
    setFlags: ['inventory-pressure', 'pricing-mismatch'],
    deferredConsequences: [
      {
        id: 'substitute-price-dispute',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách phản hồi vì giá sản phẩm thay thế',
        description:
          'Khách nhận ra sản phẩm thay thế rẻ hơn nhưng vẫn bị tính theo giá cũ và yêu cầu kiểm tra lại hóa đơn.',
        employeeRatingDelta: -0.2,
        storeReputationDelta: -0.2,
        customerSatisfactionDelta: -0.2,
        clearFlags: ['pricing-mismatch'],
      },
      {
        id: 'stock-pressure-after-charge',
        trigger: 'after-customers',
        delayCustomers: 2,
        title: 'Tồn kho tiếp tục thiếu',
        description:
          'Sản phẩm cũ vẫn chưa được bổ sung, khiến một khách sau phải thay đổi lựa chọn.',
        employeeRatingDelta: 0,
        storeReputationDelta: -0.05,
        customerSatisfactionDelta: -0.1,
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
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'customer-returns-for-extra-cash',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách quay lại hỏi về tiền đưa dư',
        description:
          'Khách kiểm tra lại ví và quay lại quầy hỏi về tờ tiền đã đưa dư trong giao dịch trước.',
        employeeRatingDelta: -0.15,
        storeReputationDelta: -0.1,
        customerSatisfactionDelta: -0.2,
        clearFlags: ['cash-discrepancy'],
      },
    ],
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
