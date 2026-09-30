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
    followUps: [
      {
        id: 'near-expiry-customer-returns',
        delayCustomers: 1,
        title: 'Khách quay lại với lốc sữa chua',
        description:
          'Khách vừa phát hiện hạn dùng rất ngắn. Họ chưa dùng sản phẩm và hỏi em sẽ xử lý thế nào.',
        choices: [
          {
            id: 'apologize-and-replace',
            label: 'Xin lỗi, đổi sang sản phẩm hạn dài hơn và giải thích rõ.',
            employeeRatingDelta: 0.12,
            storeReputationDelta: 0.1,
            customerSatisfactionDelta: 0.2,
            feedback:
              'Em đã sửa sai bằng cách minh bạch và ưu tiên quyền lợi của khách.',
          },
          {
            id: 'offer-discount-only',
            label: 'Đề nghị giảm thêm giá nếu khách giữ sản phẩm.',
            employeeRatingDelta: 0.02,
            storeReputationDelta: -0.02,
            customerSatisfactionDelta: 0.04,
            feedback:
              'Khách có thêm lựa chọn, nhưng vấn đề thông tin ban đầu vẫn chưa được xử lý trọn vẹn.',
          },
          {
            id: 'refuse-because-valid',
            label: 'Từ chối vì sản phẩm vẫn chưa hết hạn.',
            employeeRatingDelta: -0.14,
            storeReputationDelta: -0.18,
            customerSatisfactionDelta: -0.22,
            feedback:
              'Đúng về hạn dùng nhưng chưa giải quyết được việc khách không được biết thông tin quan trọng trước khi mua.',
          },
        ],
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

  'SCENARIO_RETURN_NO_RECEIPT:check-purchase-history': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_RETURN_NO_RECEIPT:manager-store-credit': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_RETURN_NO_RECEIPT:refuse-immediately': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'return-policy-complaint',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách quay lại hỏi quản lý về chính sách đổi trả',
        description:
          'Khách cho biết họ vẫn muốn cửa hàng kiểm tra lịch sử mua thay vì từ chối ngay tại quầy.',
        employeeRatingDelta: -0.08,
        storeReputationDelta: -0.14,
        customerSatisfactionDelta: -0.12,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_DAMAGED_EGGS:replace-carton': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_DAMAGED_EGGS:remove-and-let-customer-decide': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_DAMAGED_EGGS:bag-damaged-eggs': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'damaged-eggs-return',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách phát hiện trứng nứt sau khi rời quầy',
        description:
          'Khách quay lại vì hộp trứng có sản phẩm bị nứt và cần đổi hàng, làm quầy phải xử lý lại giao dịch.',
        employeeRatingDelta: -0.12,
        storeReputationDelta: -0.18,
        customerSatisfactionDelta: -0.16,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_QUEUE_PRIORITY:ask-queue-consent': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_QUEUE_PRIORITY:call-support-counter': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_QUEUE_PRIORITY:ignore-request': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'queue-service-feedback',
        trigger: 'shift-end',
        title: 'Cuối ca có phản hồi về cách hỗ trợ khách tại hàng chờ',
        description:
          'Một khách ghi nhận rằng yêu cầu hỗ trợ ở hàng chờ đã bị từ chối mà không được giải thích.',
        employeeRatingDelta: -0.08,
        storeReputationDelta: -0.12,
        customerSatisfactionDelta: -0.08,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_UNIT_PRICE_COMPARISON:explain-unit-price': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_UNIT_PRICE_COMPARISON:recommend-cheaper-unit': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_UNIT_PRICE_COMPARISON:push-promo-pack': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'unit-price-followup',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách kiểm tra lại đơn giá sau khi mua',
        description:
          'Khách nhận ra gói có biển khuyến mãi không phải phương án rẻ nhất theo đơn vị và quay lại hỏi cách tư vấn tại quầy.',
        employeeRatingDelta: -0.08,
        storeReputationDelta: -0.15,
        customerSatisfactionDelta: -0.12,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_FROZEN_ITEM_LEFT_OUT:quarantine-and-replace': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_FROZEN_ITEM_LEFT_OUT:hold-for-manager': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_FROZEN_ITEM_LEFT_OUT:put-back-freezer': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'frozen-quality-incident',
        trigger: 'shift-end',
        title: 'Cuối ca phát hiện sản phẩm đông lạnh cần kiểm tra chất lượng',
        description:
          'Sản phẩm từng để ngoài lâu đã quay lại kệ, khiến cửa hàng phải rà soát lô hàng và quy trình bảo quản.',
        employeeRatingDelta: -0.2,
        storeReputationDelta: -0.3,
        customerSatisfactionDelta: -0.12,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_COUPON_STACKING:compare-coupons': {
    clearFlags: ['cash-discrepancy'],
  },
  'SCENARIO_COUPON_STACKING:let-customer-choose-coupon': {
    clearFlags: ['cash-discrepancy'],
  },
  'SCENARIO_COUPON_STACKING:stack-both-coupons': {
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'coupon-stack-audit',
        trigger: 'shift-end',
        title: 'Đối soát phát hiện hai coupon bị cộng dồn',
        description:
          'Cuối ca, hệ thống khuyến mãi phát hiện một hóa đơn áp dụng hai coupon dù chương trình chỉ cho phép dùng một.',
        employeeRatingDelta: -0.16,
        storeReputationDelta: -0.16,
        customerSatisfactionDelta: 0,
        clearFlags: ['cash-discrepancy'],
      },
    ],
  },

  'SCENARIO_SHORT_CASH:remove-optional-item': {
    clearFlags: ['cash-discrepancy'],
  },
  'SCENARIO_SHORT_CASH:unauthorized-discount': {
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'short-cash-discount-audit',
        trigger: 'shift-end',
        title: 'Cuối ca có khoản giảm không khớp chương trình',
        description:
          'Đối soát phát hiện một hóa đơn được giảm thủ công nhưng không gắn với chương trình hoặc quyền giảm hợp lệ.',
        employeeRatingDelta: -0.18,
        storeReputationDelta: -0.12,
        customerSatisfactionDelta: 0,
        clearFlags: ['cash-discrepancy'],
      },
    ],
  },
  'SCENARIO_SHORT_CASH:insist-full-payment': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'short-cash-service-feedback',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách góp ý về cách hỗ trợ ngân sách',
        description:
          'Khách cho biết họ chấp nhận phải trả đủ nhưng mong được hỗ trợ tìm món có thể bỏ hoặc thay thế.',
        employeeRatingDelta: -0.05,
        storeReputationDelta: -0.06,
        customerSatisfactionDelta: -0.08,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_CHANGE_DRAWER_SHORT:request-change-support': {
    clearFlags: ['cash-discrepancy'],
  },
  'SCENARIO_CHANGE_DRAWER_SHORT:ask-digital-change': {
    clearFlags: ['cash-discrepancy'],
  },
  'SCENARIO_CHANGE_DRAWER_SHORT:round-change': {
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'rounded-change-drawer-mismatch',
        trigger: 'shift-end',
        title: 'Ngăn kéo tiền mặt không khớp hoàn toàn',
        description:
          'Việc tự làm tròn tiền thừa khiến số tiền thực tế trong quầy không trùng với lịch sử giao dịch.',
        employeeRatingDelta: -0.2,
        storeReputationDelta: -0.12,
        customerSatisfactionDelta: 0,
        clearFlags: ['cash-discrepancy'],
      },
    ],
  },

  'SCENARIO_LAST_ITEM_RESERVED:verify-reservation': {
    clearFlags: ['inventory-pressure'],
  },
  'SCENARIO_LAST_ITEM_RESERVED:offer-alternative': {
    clearFlags: ['inventory-pressure'],
  },
  'SCENARIO_LAST_ITEM_RESERVED:sell-reserved-item': {
    setFlags: ['inventory-pressure', 'complaint-risk'],
    deferredConsequences: [
      {
        id: 'reserved-order-no-stock',
        trigger: 'after-customers',
        delayCustomers: 2,
        title: 'Khách đặt trước đến nhưng món đã hết',
        description:
          'Sản phẩm cuối cùng đã được bán tại quầy nên đơn nhận tại cửa hàng không còn đủ hàng khi khách đến.',
        employeeRatingDelta: -0.18,
        storeReputationDelta: -0.3,
        customerSatisfactionDelta: -0.18,
        clearFlags: ['inventory-pressure', 'complaint-risk'],
      },
    ],
    followUps: [
      {
        id: 'reserved-customer-arrives',
        delayCustomers: 2,
        title: 'Khách đặt trước đã đến nhận hàng',
        description:
          'Khách đưa mã đặt trước nhưng sản phẩm cuối cùng đã được bán. Em cần xử lý ngay tại quầy.',
        choices: [
          {
            id: 'own-mistake-and-solve',
            label: 'Nhận lỗi, kiểm tra chi nhánh/kho khác và đề xuất phương án thay thế.',
            employeeRatingDelta: 0.1,
            storeReputationDelta: 0.08,
            customerSatisfactionDelta: 0.12,
            feedback:
              'Không xóa được sai sót trước đó, nhưng cách xử lý chủ động giúp giảm thiệt hại và giữ niềm tin.',
          },
          {
            id: 'offer-voucher',
            label: 'Xin lỗi và đề xuất voucher bù nếu khách đồng ý.',
            employeeRatingDelta: 0.04,
            storeReputationDelta: 0.02,
            customerSatisfactionDelta: 0.08,
            feedback:
              'Khách được bù đắp phần nào, nhưng nhu cầu nhận đúng sản phẩm vẫn chưa được giải quyết.',
          },
          {
            id: 'blame-system',
            label: 'Nói hệ thống kho bị lỗi và yêu cầu khách quay lại hôm khác.',
            employeeRatingDelta: -0.16,
            storeReputationDelta: -0.2,
            customerSatisfactionDelta: -0.2,
            feedback:
              'Đẩy trách nhiệm sang hệ thống làm khách khó tin tưởng hơn và không tạo ra phương án giải quyết.',
          },
        ],
      },
    ],
  },

  'SCENARIO_MEMBER_PRICE:verify-member-account': {
    clearFlags: ['cash-discrepancy'],
  },
  'SCENARIO_MEMBER_PRICE:manual-member-discount': {
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'member-discount-audit',
        trigger: 'shift-end',
        title: 'Ưu đãi thành viên cần được đối soát',
        description:
          'Hệ thống phát hiện một mức giá thành viên được áp dụng mà giao dịch không có tài khoản thành viên đã xác minh.',
        employeeRatingDelta: -0.16,
        storeReputationDelta: -0.12,
        customerSatisfactionDelta: 0,
        clearFlags: ['cash-discrepancy'],
      },
    ],
  },
  'SCENARIO_MEMBER_PRICE:reject-member-price': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'member-price-followup',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách quay lại sau khi tìm được mã thành viên',
        description:
          'Khách đã tìm được thông tin tài khoản và muốn hỏi vì sao quầy chưa thử xác minh trước khi từ chối ưu đãi.',
        employeeRatingDelta: -0.06,
        storeReputationDelta: -0.08,
        customerSatisfactionDelta: -0.1,
        clearFlags: ['complaint-risk'],
      },
    ],
  },

  'SCENARIO_MISSING_PRICE_LABEL:scan-and-confirm-price': {
    clearFlags: ['pricing-mismatch'],
  },
  'SCENARIO_MISSING_PRICE_LABEL:guess-similar-price': {
    setFlags: ['pricing-mismatch', 'billing-dispute'],
    deferredConsequences: [
      {
        id: 'guessed-price-dispute',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách kiểm tra lại giá sản phẩm',
        description:
          'Giá được ước đoán tại quầy khác với giá hệ thống, khiến khách quay lại yêu cầu kiểm tra hóa đơn.',
        employeeRatingDelta: -0.16,
        storeReputationDelta: -0.22,
        customerSatisfactionDelta: -0.18,
        clearFlags: ['pricing-mismatch', 'billing-dispute'],
      },
    ],
    followUps: [
      {
        id: 'price-dispute-at-counter',
        delayCustomers: 1,
        title: 'Khách mang hóa đơn quay lại',
        description:
          'Giá em ước lượng lúc trước không trùng với giá hệ thống. Khách muốn biết cửa hàng sẽ xử lý phần chênh lệch thế nào.',
        choices: [
          {
            id: 'verify-and-refund-difference',
            label: 'Kiểm tra giá thật, xin lỗi và hoàn phần chênh lệch nếu khách bị tính cao.',
            employeeRatingDelta: 0.12,
            storeReputationDelta: 0.1,
            customerSatisfactionDelta: 0.18,
            feedback:
              'Em sửa lỗi dựa trên dữ liệu thực và giải quyết trực tiếp phần chênh lệch của khách.',
          },
          {
            id: 'manager-review',
            label: 'Mời quản lý xác minh hóa đơn và giá hệ thống trước khi điều chỉnh.',
            employeeRatingDelta: 0.06,
            storeReputationDelta: 0.08,
            customerSatisfactionDelta: 0.02,
            feedback:
              'Quy trình chậm hơn nhưng mọi điều chỉnh đều có căn cứ.',
          },
          {
            id: 'keep-guessed-price',
            label: 'Giữ nguyên giá đã tính vì khách đã thanh toán.',
            employeeRatingDelta: -0.18,
            storeReputationDelta: -0.22,
            customerSatisfactionDelta: -0.24,
            feedback:
              'Việc giao dịch đã kết thúc không làm mức giá ước lượng trở thành giá đúng.',
          },
        ],
      },
    ],
  },
  'SCENARIO_MISSING_PRICE_LABEL:remove-item-only': {
    setFlags: ['pricing-mismatch'],
    deferredConsequences: [
      {
        id: 'missing-label-remains',
        trigger: 'shift-end',
        title: 'Cuối ca vẫn còn sản phẩm thiếu nhãn giá',
        description:
          'Món hàng đã được bỏ khỏi giao dịch nhưng nguyên nhân trên kệ chưa được xử lý, nên khách khác vẫn có thể gặp cùng vấn đề.',
        employeeRatingDelta: -0.04,
        storeReputationDelta: -0.08,
        customerSatisfactionDelta: 0,
        clearFlags: ['pricing-mismatch'],
      },
    ],
  },

  'SCENARIO_BULK_PROMO_NEED:compare-total-and-need': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_BULK_PROMO_NEED:recommend-single-item': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_BULK_PROMO_NEED:push-bulk-promo': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'bulk-promo-regret',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách hỏi lại vì đã mua nhiều hơn nhu cầu',
        description:
          'Sau khi xem hóa đơn, khách nhận ra combo có đơn giá tốt hơn nhưng tổng tiền cao hơn nhiều so với món mình thực sự cần.',
        employeeRatingDelta: -0.07,
        storeReputationDelta: -0.1,
        customerSatisfactionDelta: -0.12,
        clearFlags: ['complaint-risk'],
      },
    ],
    followUps: [
      {
        id: 'bulk-promo-customer-reconsiders',
        delayCustomers: 1,
        title: 'Khách quay lại hỏi về combo',
        description:
          'Khách chưa mở sản phẩm và nói rằng lúc nãy mình chỉ cần một món. Em sẽ hỗ trợ thế nào?',
        choices: [
          {
            id: 'review-return-policy',
            label: 'Kiểm tra điều kiện đổi trả và hỗ trợ khách theo chính sách.',
            employeeRatingDelta: 0.08,
            storeReputationDelta: 0.08,
            customerSatisfactionDelta: 0.14,
            feedback:
              'Em không hứa vượt chính sách nhưng chủ động tìm cách khắc phục lựa chọn chưa phù hợp nhu cầu.',
          },
          {
            id: 'explain-unit-saving-only',
            label: 'Chỉ giải thích lại rằng combo có đơn giá thấp hơn.',
            employeeRatingDelta: -0.02,
            storeReputationDelta: -0.04,
            customerSatisfactionDelta: -0.08,
            feedback:
              'Thông tin đơn giá đúng nhưng chưa phản hồi vào vấn đề khách đang quan tâm là tổng chi và nhu cầu sử dụng.',
          },
          {
            id: 'dismiss-regret',
            label: 'Từ chối trao đổi vì khách đã tự đồng ý mua combo.',
            employeeRatingDelta: -0.12,
            storeReputationDelta: -0.14,
            customerSatisfactionDelta: -0.18,
            feedback:
              'Quyết định cuối cùng là của khách, nhưng trải nghiệm tư vấn trước đó vẫn có thể được xem lại và hỗ trợ.',
          },
        ],
      },
    ],
  },

  'SCENARIO_END_DAY_BREAD:disclose-and-discount': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_END_DAY_BREAD:remove-for-end-day-process': {
    clearFlags: ['complaint-risk'],
  },
  'SCENARIO_END_DAY_BREAD:sell-without-disclosure': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'end-day-bread-return',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách phát hiện hạn dùng sau khi thanh toán',
        description:
          'Khách quay lại vì chỉ sau khi mua mới biết sản phẩm hết hạn vào cuối ngày và muốn đổi sang sản phẩm khác.',
        employeeRatingDelta: -0.1,
        storeReputationDelta: -0.18,
        customerSatisfactionDelta: -0.16,
        clearFlags: ['complaint-risk'],
      },
    ],
    followUps: [
      {
        id: 'bread-customer-returns',
        delayCustomers: 1,
        title: 'Khách quay lại với bánh mì cuối ngày',
        description:
          'Khách chưa dùng bánh và muốn đổi vì không được báo trước hạn dùng ngắn.',
        choices: [
          {
            id: 'replace-and-apologize',
            label: 'Xin lỗi và đổi sang sản phẩm phù hợp hơn theo chính sách.',
            employeeRatingDelta: 0.1,
            storeReputationDelta: 0.08,
            customerSatisfactionDelta: 0.16,
            feedback:
              'Em thừa nhận thiếu sót về thông tin và chủ động sửa trải nghiệm của khách.',
          },
          {
            id: 'offer-approved-discount',
            label: 'Giải thích và đề xuất mức giảm hợp lệ nếu khách muốn giữ bánh.',
            employeeRatingDelta: 0.04,
            storeReputationDelta: 0.02,
            customerSatisfactionDelta: 0.06,
            feedback:
              'Khách được quyền lựa chọn lại sau khi đã có thông tin rõ ràng.',
          },
          {
            id: 'refuse-return',
            label: 'Từ chối vì bánh vẫn còn hạn trong ngày.',
            employeeRatingDelta: -0.14,
            storeReputationDelta: -0.18,
            customerSatisfactionDelta: -0.22,
            feedback:
              'Sản phẩm chưa hết hạn nhưng khách vẫn bị thiếu thông tin quan trọng tại thời điểm mua.',
          },
        ],
      },
    ],
  },

  'SCENARIO_PRICE_MATCH_REQUEST:verify-price-match-policy': {
    clearFlags: ['pricing-mismatch'],
  },
  'SCENARIO_PRICE_MATCH_REQUEST:match-without-checking': {
    setFlags: ['cash-discrepancy'],
    deferredConsequences: [
      {
        id: 'unchecked-price-match-audit',
        trigger: 'shift-end',
        title: 'Mức giảm đối chiếu giá không có căn cứ',
        description:
          'Cuối ca, hệ thống phát hiện một hóa đơn được giảm theo giá bên ngoài nhưng không có bước xác minh chính sách.',
        employeeRatingDelta: -0.16,
        storeReputationDelta: -0.14,
        customerSatisfactionDelta: 0,
        clearFlags: ['cash-discrepancy'],
      },
    ],
  },
  'SCENARIO_PRICE_MATCH_REQUEST:reject-price-match': {
    setFlags: ['complaint-risk'],
    deferredConsequences: [
      {
        id: 'price-match-policy-question',
        trigger: 'after-customers',
        delayCustomers: 1,
        title: 'Khách hỏi lại quản lý về chính sách đối chiếu giá',
        description:
          'Khách muốn biết liệu cửa hàng có quy trình kiểm tra giá trên kênh khác thay vì từ chối ngay tại quầy.',
        employeeRatingDelta: -0.05,
        storeReputationDelta: -0.08,
        customerSatisfactionDelta: -0.1,
        clearFlags: ['complaint-risk'],
      },
    ],
  },
}

export function getWorkWorldEffect(
  scenarioId: string,
  choiceId: string,
): WorkWorldEffect | undefined {
  return effects[`${scenarioId}:${choiceId}`]
}

export const workWorldEffects = effects
