import type {
  WorkScenarioDefinition,
  WorkShiftDefinition,
} from '../domain/types'

export const workScenarios: WorkScenarioDefinition[] = [
  {
    id: 'SCENARIO_DAMAGED_DRINK',
    version: 2,
    category: 'product-quality',
    difficulty: 1,
    title: 'Hộp nước bị móp',
    description:
      'Khi chuẩn bị giao hàng cho khách, em phát hiện một hộp nước ép bị móp khá rõ.',
    choices: [
      {
        id: 'replace-and-inform',
        label: 'Báo cho khách và đổi sang hộp nguyên vẹn.',
        billDelta: 0,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.2,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Khách biết rõ tình trạng sản phẩm và nhận được hộp nguyên vẹn. Cửa hàng giảm nguy cơ khiếu nại.',
      },
      {
        id: 'sell-as-normal',
        label: 'Báo rõ tình trạng và hỏi khách có muốn giữ hộp này với mức giảm 10.000đ.',
        billDelta: -10000,
        employeeRatingDelta: 0.12,
        storeReputationDelta: 0.08,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Khách được biết rõ tình trạng và tự chọn giữa đổi hàng hoặc nhận mức giá thấp hơn. Cửa hàng giảm doanh thu một chút nhưng hạn chế lãng phí.',
      },
      {
        id: 'silent-discount',
        label: 'Giữ sản phẩm lại và nhờ quản lý xác nhận cách xử lý trước khi tiếp tục.',
        billDelta: 0,
        employeeRatingDelta: 0.15,
        storeReputationDelta: 0.18,
        customerSatisfactionDelta: -0.05,
        feedback:
          'Quy trình được kiểm tra kỹ hơn nhưng khách phải chờ lâu hơn. Đây là lựa chọn an toàn khi nhân viên chưa chắc chính sách xử lý hàng lỗi.',
      },
    ],
  },
  {
    id: 'SCENARIO_VALID_VOUCHER',
    version: 1,
    category: 'promotion',
    difficulty: 1,
    title: 'Voucher 20.000đ',
    description:
      'Khách đưa voucher giảm 20.000đ. Quy định ghi rõ voucher dùng cho hóa đơn từ 100.000đ và hóa đơn hiện tại đủ điều kiện.',
    choices: [
      {
        id: 'apply-voucher',
        label: 'Kiểm tra điều kiện và áp dụng voucher 20.000đ.',
        billDelta: -20000,
        employeeRatingDelta: 0.15,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Voucher được áp dụng đúng quy định. Khách nhận đúng quyền lợi và hóa đơn minh bạch.',
      },
      {
        id: 'reject-voucher',
        label: 'Từ chối voucher để tránh thao tác nhầm.',
        billDelta: 0,
        employeeRatingDelta: -0.25,
        storeReputationDelta: -0.15,
        customerSatisfactionDelta: -0.3,
        feedback:
          'Khách đủ điều kiện nhưng không nhận được ưu đãi. Trải nghiệm phục vụ giảm dù cửa hàng không thất thoát tiền.',
      },
      {
        id: 'apply-double',
        label: 'Giảm 40.000đ để khách vui hơn.',
        billDelta: -40000,
        employeeRatingDelta: -0.35,
        storeReputationDelta: -0.25,
        customerSatisfactionDelta: 0.15,
        feedback:
          'Khách được lợi hơn nhưng ưu đãi không đúng quy định, làm sai lệch doanh thu và chính sách cửa hàng.',
      },
    ],
  },
  {
    id: 'SCENARIO_NEAR_EXPIRY_YOGURT',
    version: 1,
    category: 'product-quality',
    difficulty: 2,
    title: 'Sữa chua gần hết hạn',
    description:
      'Một lốc sữa chua còn hạn sử dụng nhưng chỉ còn 2 ngày. Khách chưa biết thông tin này.',
    choices: [
      {
        id: 'inform-and-offer-choice',
        label: 'Báo rõ hạn dùng và để khách quyết định giữ hay đổi sản phẩm.',
        billDelta: 0,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.15,
        customerSatisfactionDelta: 0.15,
        feedback:
          'Khách được cung cấp đủ thông tin để tự quyết định. Giao dịch minh bạch hơn.',
      },
      {
        id: 'discount-with-consent',
        label: 'Báo rõ tình trạng và đề nghị giảm 10.000đ nếu khách vẫn muốn mua.',
        billDelta: -10000,
        employeeRatingDelta: 0.15,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Khách biết rõ hạn dùng và được lựa chọn mức giá phù hợp với sản phẩm.',
      },
      {
        id: 'hide-expiry',
        label: 'Không nhắc đến hạn dùng vì sản phẩm vẫn còn hạn.',
        billDelta: 0,
        employeeRatingDelta: -0.3,
        storeReputationDelta: -0.45,
        customerSatisfactionDelta: -0.3,
        feedback:
          'Khách thiếu thông tin quan trọng trước khi mua. Nếu phát hiện sau đó, khả năng khiếu nại tăng.',
      },
    ],
  },
  {
    id: 'SCENARIO_WRONG_SHELF_PRICE',
    version: 1,
    category: 'transparency',
    difficulty: 2,
    title: 'Giá trên kệ khác máy POS',
    description:
      'Nhãn trên kệ ghi 45.000đ nhưng máy POS hiện 50.000đ. Khách hỏi vì sao giá khác nhau.',
    choices: [
      {
        id: 'honor-shelf-price',
        label: 'Xác nhận sai lệch và áp dụng mức 45.000đ cho khách.',
        billDelta: -5000,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.15,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Sai lệch giá được xử lý minh bạch và khách không phải chịu hậu quả từ lỗi hiển thị của cửa hàng.',
      },
      {
        id: 'charge-pos-price',
        label: 'Thu 50.000đ vì máy POS là giá chính thức.',
        billDelta: 0,
        employeeRatingDelta: -0.2,
        storeReputationDelta: -0.35,
        customerSatisfactionDelta: -0.3,
        feedback:
          'Khách nhìn thấy giá thấp hơn trên kệ nhưng phải trả cao hơn. Uy tín về niêm yết giá giảm.',
      },
      {
        id: 'ask-manager-hold-line',
        label: 'Tạm dừng giao dịch và nhờ quản lý xác minh trước khi thu tiền.',
        billDelta: 0,
        employeeRatingDelta: 0.1,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: -0.05,
        feedback:
          'Khách phải chờ lâu hơn một chút nhưng giá được xác minh trước khi thanh toán.',
      },
    ],
  },
  {
    id: 'SCENARIO_DUPLICATE_SCAN',
    version: 2,
    category: 'billing',
    difficulty: 1,
    title: 'Quét trùng một sản phẩm',
    description:
      'Em phát hiện máy POS đã quét một lốc sữa hai lần dù khách chỉ mua một lốc.',
    choices: [
      {
        id: 'remove-duplicate',
        label: 'Xóa dòng quét trùng trước khi khách thanh toán.',
        billDelta: -36000,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Hóa đơn được sửa trước khi thu tiền. Khách chỉ trả đúng số sản phẩm đã mua.',
      },
      {
        id: 'leave-duplicate',
        label: 'Giữ nguyên vì khách chưa phát hiện.',
        billDelta: 0,
        employeeRatingDelta: -0.45,
        storeReputationDelta: -0.4,
        customerSatisfactionDelta: -0.45,
        feedback:
          'Khách bị tính thừa một sản phẩm. Khi phát hiện, giao dịch dễ dẫn tới khiếu nại và hoàn tiền.',
      },
      {
        id: 'refund-later',
        label: 'Tạm dừng một chút, kiểm lại toàn bộ giỏ rồi mới xóa dòng bị quét trùng.',
        billDelta: -36000,
        employeeRatingDelta: 0.18,
        storeReputationDelta: 0.15,
        customerSatisfactionDelta: 0.05,
        feedback:
          'Hóa đơn được kiểm lại kỹ hơn nên khách phải chờ thêm một chút, đổi lại nguy cơ còn sót lỗi khác giảm xuống.',
      },
    ],
  },
  {
    id: 'SCENARIO_EXPIRED_VOUCHER',
    version: 2,
    category: 'promotion',
    difficulty: 2,
    title: 'Voucher đã hết hạn',
    description:
      'Khách đưa voucher giảm 20.000đ nhưng ngày sử dụng đã hết từ hôm qua.',
    choices: [
      {
        id: 'explain-expired',
        label: 'Giải thích rõ voucher đã hết hạn và không áp dụng.',
        billDelta: 0,
        employeeRatingDelta: 0.15,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: -0.05,
        feedback:
          'Khách không được giảm giá nhưng hiểu lý do và chính sách được áp dụng nhất quán.',
      },
      {
        id: 'apply-expired',
        label: 'Vẫn áp dụng giảm 20.000đ để tránh khách không vui.',
        billDelta: -20000,
        employeeRatingDelta: -0.2,
        storeReputationDelta: -0.2,
        customerSatisfactionDelta: 0.15,
        feedback:
          'Khách hài lòng hơn trong ngắn hạn nhưng chính sách khuyến mãi bị áp dụng sai.',
      },
      {
        id: 'reject-without-explanation',
        label: 'Giải thích voucher hết hạn và kiểm tra xem khách có ưu đãi hiện hành nào khác.',
        billDelta: -10000,
        employeeRatingDelta: 0.16,
        storeReputationDelta: 0.08,
        customerSatisfactionDelta: 0.18,
        feedback:
          'Voucher cũ không được dùng sai quy định, nhưng nhân viên dành thêm thời gian để tìm một ưu đãi hợp lệ khác cho khách.',
      },
    ],
  },
  {
    id: 'SCENARIO_CUSTOMER_BUDGET',
    version: 2,
    category: 'customer-needs',
    difficulty: 2,
    title: 'Khách chỉ có 120.000đ',
    description:
      'Tổng giỏ hiện vượt 120.000đ. Khách hỏi em có thể giúp giảm chi phí mà vẫn giữ đồ uống và đồ ăn không.',
    choices: [
      {
        id: 'suggest-cheaper-option',
        label: 'Đề xuất đổi một món sang lựa chọn rẻ hơn để giảm 15.000đ.',
        billDelta: -15000,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.05,
        customerSatisfactionDelta: 0.25,
        feedback:
          'Phương án mới phù hợp ngân sách hơn mà vẫn giữ được nhu cầu chính của khách.',
      },
      {
        id: 'remove-random-item',
        label: 'Hỏi khách món nào ít ưu tiên nhất rồi bỏ món đó để giảm khoảng 35.000đ.',
        billDelta: -35000,
        employeeRatingDelta: 0.15,
        storeReputationDelta: 0.05,
        customerSatisfactionDelta: 0.18,
        feedback:
          'Giỏ giảm nhiều hơn và vẫn tôn trọng ưu tiên của khách, nhưng khách phải đánh đổi một món họ đã chọn ban đầu.',
      },
      {
        id: 'tell-customer-pay-more',
        label: 'Giữ nguyên giỏ và yêu cầu khách chuẩn bị thêm tiền.',
        billDelta: 0,
        employeeRatingDelta: -0.15,
        storeReputationDelta: 0,
        customerSatisfactionDelta: -0.2,
        feedback:
          'Giao dịch không thay đổi nhưng yêu cầu ngân sách của khách chưa được hỗ trợ.',
      },
    ],
  },
  {
    id: 'SCENARIO_LOW_STOCK_SUBSTITUTE',
    version: 2,
    category: 'inventory',
    difficulty: 2,
    title: 'Sản phẩm khách chọn đã hết',
    description:
      'Một loại sữa khách chọn đã hết hàng. Có sản phẩm tương đương rẻ hơn 6.000đ.',
    choices: [
      {
        id: 'offer-substitute',
        label: 'Báo hết hàng và hỏi khách có muốn đổi sang sản phẩm rẻ hơn.',
        billDelta: -6000,
        employeeRatingDelta: 0.15,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: 0.15,
        feedback:
          'Khách được biết tình trạng tồn kho và chủ động chọn sản phẩm thay thế.',
      },
      {
        id: 'swap-without-asking',
        label: 'Tự đổi sang sản phẩm khác vì chức năng gần giống nhau.',
        billDelta: -6000,
        employeeRatingDelta: -0.25,
        storeReputationDelta: -0.1,
        customerSatisfactionDelta: -0.3,
        feedback:
          'Giá thấp hơn nhưng khách không được hỏi trước về việc thay đổi sản phẩm.',
      },
      {
        id: 'charge-original',
        label: 'Giữ đơn tại quầy và kiểm tra kho/chi nhánh gần đó trước khi đề nghị sản phẩm thay thế.',
        billDelta: 0,
        employeeRatingDelta: 0.14,
        storeReputationDelta: 0.15,
        customerSatisfactionDelta: -0.08,
        feedback:
          'Khả năng tìm đúng sản phẩm tăng lên nhưng giao dịch chậm hơn. Lựa chọn phù hợp khi khách ưu tiên đúng sản phẩm hơn tốc độ.',
      },
    ],
  },
  {
    id: 'SCENARIO_EXTRA_CASH',
    version: 2,
    category: 'billing',
    difficulty: 1,
    title: 'Khách đưa dư tiền',
    description:
      'Khách vô tình đưa thêm một tờ 50.000đ và dường như chưa nhận ra.',
    choices: [
      {
        id: 'return-extra-cash',
        label: 'Báo khách và trả lại ngay 50.000đ dư.',
        billDelta: 0,
        employeeRatingDelta: 0.25,
        storeReputationDelta: 0.15,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Số tiền khách đưa được kiểm tra và phần dư được trả lại rõ ràng.',
      },
      {
        id: 'keep-extra-cash',
        label: 'Cho số tiền dư vào ngăn kéo vì khách đã rời mắt khỏi quầy.',
        billDelta: 0,
        employeeRatingDelta: -0.5,
        storeReputationDelta: -0.45,
        customerSatisfactionDelta: -0.5,
        feedback:
          'Giao dịch thu nhiều hơn số tiền cần thiết. Nếu đối soát hoặc khách phát hiện, hậu quả với cửa hàng tăng cao.',
      },
      {
        id: 'wait-until-customer-notices',
        label: 'Dừng lại, đếm lại tiền cùng khách rồi trả phần dư sau khi hai bên cùng xác nhận.',
        billDelta: 0,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.18,
        customerSatisfactionDelta: 0.08,
        feedback:
          'Mất thêm một chút thời gian nhưng cả khách và nhân viên cùng xác nhận số tiền, giảm nguy cơ nhầm lẫn về sau.',
      },
    ],
  },
  {
    id: 'SCENARIO_PROMO_SIGN_MISSING',
    version: 2,
    category: 'transparency',
    difficulty: 3,
    title: 'Biển khuyến mãi chưa được tháo',
    description:
      'Biển “giảm 20%” vẫn còn trên kệ dù chương trình đã kết thúc sáng nay. Khách chọn sản phẩm vì nhìn thấy biển đó.',
    choices: [
      {
        id: 'honor-visible-promo',
        label: 'Báo quản lý và áp dụng giảm 20% cho giao dịch này.',
        billDelta: -20000,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.2,
        customerSatisfactionDelta: 0.25,
        feedback:
          'Khách không phải chịu hậu quả từ thông tin khuyến mãi chưa được cập nhật tại cửa hàng.',
      },
      {
        id: 'deny-visible-promo',
        label: 'Từ chối vì chương trình đã hết dù biển vẫn còn.',
        billDelta: 0,
        employeeRatingDelta: -0.15,
        storeReputationDelta: -0.4,
        customerSatisfactionDelta: -0.35,
        feedback:
          'Thông tin tại quầy và chính sách thực tế không thống nhất, làm giảm niềm tin của khách.',
      },
      {
        id: 'remove-sign-only',
        label: 'Tạm dừng để quản lý xác nhận, đồng thời tháo biển trước khi phục vụ khách tiếp theo.',
        billDelta: -10000,
        employeeRatingDelta: 0.14,
        storeReputationDelta: 0.18,
        customerSatisfactionDelta: 0,
        feedback:
          'Cửa hàng xử lý nguyên nhân gốc và kiểm tra quyền lợi của khách hiện tại, nhưng quầy bị chậm trong lúc xác minh.',
      },
    ],
  },
]

export const traineeShift: WorkShiftDefinition = {
  id: 'work-shift-trainee-01',
  title: 'Ca làm việc 01',
  subtitle: 'Phục vụ 3 khách đầu tiên tại quầy SmartMart.',
  roleTitle: 'Nhân viên tập sự',
  startingEmployeeRating: 4,
  startingStoreReputation: 4,
  startingCustomerSatisfaction: 4,
  customers: [
    {
      id: 'customer-lan',
      name: 'Cô Lan',
      basket: [
        { name: 'lốc sữa', quantity: 2, unitPrice: 36000 },
        { name: 'túi táo', quantity: 1, unitPrice: 30000 },
      ],
      cashGiven: 200000,
    },
    {
      id: 'customer-minh',
      name: 'Anh Minh',
      basket: [
        { name: '3 lốc nước ép', quantity: 3, unitPrice: 42000 },
        { name: 'gói khăn giấy', quantity: 1, unitPrice: 15000 },
      ],
      cashGiven: 200000,
      scenarioId: 'SCENARIO_DAMAGED_DRINK',
    },
    {
      id: 'customer-thao',
      name: 'Chị Thảo',
      basket: [
        { name: 'hộp cupcake', quantity: 2, unitPrice: 40000 },
        { name: 'lốc trà trái cây', quantity: 1, unitPrice: 35000 },
      ],
      cashGiven: 200000,
      scenarioId: 'SCENARIO_VALID_VOUCHER',
    },
  ],
}

export function getWorkScenario(id: string) {
  const scenario = workScenarios.find((item) => item.id === id)

  if (!scenario) {
    throw new Error('Unknown work scenario: ' + id)
  }

  return scenario
}
