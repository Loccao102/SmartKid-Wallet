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
        employeeRatingDelta: 0,
        storeReputationDelta: 0,
        customerSatisfactionDelta: 0,
        clearFlags: ['complaint-risk'],
        storyDecision: {
          prompt:
            'Khách quay lại quầy với sản phẩm gần hết hạn. Em sẽ xử lý tiếp câu chuyện này như thế nào?',
          choices: [
            {
              id: 'replace-and-apologize',
              label: 'Xin lỗi, đổi sản phẩm hạn dài hơn và giải thích rõ.',
              employeeRatingDelta: 0.08,
              storeReputationDelta: 0.04,
              customerSatisfactionDelta: 0.12,
              feedback:
                'Việc sửa sai tốn thời gian và chi phí đổi hàng, nhưng khách cảm thấy được lắng nghe và vấn đề được khép lại minh bạch.',
              clearFlags: ['complaint-risk'],
            },
            {
              id: 'refund-without-discussion',
              label: 'Hoàn tiền nhanh để khách rời quầy sớm.',
              employeeRatingDelta: 0,
              storeReputationDelta: -0.05,
              customerSatisfactionDelta: 0.04,
              feedback:
                'Khách được hoàn tiền nhưng nguyên nhân vì sao thông tin hạn dùng không được nói từ đầu chưa được xử lý.',
              clearFlags: ['complaint-risk'],
            },
            {
              id: 'defend-original-sale',
              label: 'Giải thích sản phẩm vẫn còn hạn nên không cần đổi.',
              employeeRatingDelta: -0.12,
              storeReputationDelta: -0.22,
              customerSatisfactionDelta: -0.2,
              feedback:
                'Quầy giữ quan điểm giao dịch ban đầu nhưng làm mâu thuẫn kéo dài vì khách chưa được trao đủ thông tin khi mua.',
              setFlags: ['complaint-risk'],
            },
          ],
        },
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
        employeeRatingDelta: 0,
        storeReputationDelta: 0,
        customerSatisfactionDelta: 0,
        clearFlags: ['billing-dispute'],
        storyDecision: {
          prompt:
            'Khách mang hóa đơn quay lại và chỉ đúng dòng bị quét hai lần. Em sẽ xử lý ra sao?',
          choices: [
            {
              id: 'verify-and-refund',
              label: 'Kiểm tra hóa đơn, hoàn phần quét trùng và xin lỗi khách.',
              employeeRatingDelta: 0.06,
              storeReputationDelta: 0.02,
              customerSatisfactionDelta: 0.1,
              feedback:
                'Sai sót được xác minh và sửa ngay. Cửa hàng chịu thêm thao tác nhưng giảm nguy cơ tranh chấp kéo dài.',
              clearFlags: ['billing-dispute'],
            },
            {
              id: 'refund-first-check-later',
              label: 'Hoàn tiền ngay rồi mới ghi nhận lỗi sau.',
              employeeRatingDelta: -0.03,
              storeReputationDelta: -0.04,
              customerSatisfactionDelta: 0.06,
              feedback:
                'Khách được xử lý nhanh nhưng hồ sơ giao dịch thiếu bước xác minh rõ ràng.',
              clearFlags: ['billing-dispute'],
            },
            {
              id: 'ask-customer-to-return-later',
              label: 'Đề nghị khách quay lại lúc quầy vắng hơn.',
              employeeRatingDelta: -0.12,
              storeReputationDelta: -0.18,
              customerSatisfactionDelta: -0.2,
              feedback:
                'Hàng chờ hiện tại không bị chậm nhưng khách phải gánh thêm thời gian vì lỗi phát sinh từ quầy.',
              setFlags: ['billing-dispute', 'complaint-risk'],
            },
          ],
        },
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
        employeeRatingDelta: 0,
        storeReputationDelta: 0,
        customerSatisfactionDelta: 0,
        clearFlags: ['inventory-pressure', 'complaint-risk'],
        storyDecision: {
          prompt:
            'Khách đặt trước đã tới nhận hàng nhưng sản phẩm cuối cùng đã bị bán. Em phải xử lý tiếp thế nào?',
          choices: [
            {
              id: 'find-equivalent-and-compensate',
              label: 'Tìm sản phẩm tương đương, giải thích và xin quản lý hỗ trợ phần chênh lệch hợp lý.',
              employeeRatingDelta: 0.04,
              storeReputationDelta: 0.02,
              customerSatisfactionDelta: 0.08,
              feedback:
                'Không thể hoàn tác việc bán món đã giữ, nhưng cửa hàng chủ động tìm phương án thay thế và chịu trách nhiệm cho sai sót.',
              clearFlags: ['inventory-pressure', 'complaint-risk'],
            },
            {
              id: 'offer-later-pickup',
              label: 'Xin lỗi và hẹn khách nhận ngay khi lô mới về.',
              employeeRatingDelta: -0.02,
              storeReputationDelta: -0.06,
              customerSatisfactionDelta: -0.04,
              feedback:
                'Khách vẫn phải chờ thêm nhưng nhận được một cam kết rõ ràng thay vì bị từ chối.',
              clearFlags: ['complaint-risk'],
              setFlags: ['inventory-pressure'],
            },
            {
              id: 'cancel-reservation',
              label: 'Hủy đơn giữ hàng và đề nghị khách tự chọn sản phẩm khác.',
              employeeRatingDelta: -0.18,
              storeReputationDelta: -0.28,
              customerSatisfactionDelta: -0.24,
              feedback:
                'Cửa hàng chuyển phần lớn hậu quả của lỗi tồn kho sang khách đặt trước, làm uy tín giảm mạnh.',
              setFlags: ['complaint-risk'],
            },
          ],
        },
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
        employeeRatingDelta: 0,
        storeReputationDelta: 0,
        customerSatisfactionDelta: 0,
        clearFlags: ['pricing-mismatch', 'billing-dispute'],
        storyDecision: {
          prompt:
            'Khách quay lại vì giá trên hóa đơn không khớp giá hệ thống vừa kiểm tra. Em sẽ xử lý tiếp thế nào?',
          choices: [
            {
              id: 'verify-correct-and-refund',
              label: 'Xác minh giá đúng, hoàn phần chênh lệch và báo lại lỗi nhãn giá.',
              employeeRatingDelta: 0.06,
              storeReputationDelta: 0.04,
              customerSatisfactionDelta: 0.1,
              feedback:
                'Khách được trả đúng phần chênh lệch và nguyên nhân trên kệ cũng được đưa vào xử lý.',
              clearFlags: ['pricing-mismatch', 'billing-dispute'],
            },
            {
              id: 'refund-difference-only',
              label: 'Chỉ hoàn phần chênh lệch cho khách rồi tiếp tục phục vụ.',
              employeeRatingDelta: 0,
              storeReputationDelta: -0.04,
              customerSatisfactionDelta: 0.06,
              feedback:
                'Giao dịch của khách được sửa nhưng vấn đề thiếu nhãn hoặc sai dữ liệu trên kệ có thể còn lặp lại.',
              clearFlags: ['billing-dispute'],
              setFlags: ['pricing-mismatch'],
            },
            {
              id: 'defend-estimated-price',
              label: 'Giữ nguyên giá đã tính vì khách đã đồng ý thanh toán.',
              employeeRatingDelta: -0.16,
              storeReputationDelta: -0.24,
              customerSatisfactionDelta: -0.22,
              feedback:
                'Việc dựa vào giá ước đoán thay vì giá đã xác minh khiến tranh chấp tiếp tục và làm giảm niềm tin.',
              setFlags: ['pricing-mismatch', 'billing-dispute'],
            },
          ],
        },
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
