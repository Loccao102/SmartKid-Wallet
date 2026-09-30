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
,
  {
    id: 'SCENARIO_RETURN_NO_RECEIPT',
    version: 1,
    category: 'customer-needs',
    difficulty: 2,
    title: 'Đổi hàng nhưng không có hóa đơn',
    description:
      'Khách mang một sản phẩm còn nguyên tem đến quầy và muốn đổi, nhưng không tìm thấy hóa đơn giấy.',
    choices: [
      {
        id: 'check-purchase-history',
        label: 'Hỏi thông tin giao dịch và kiểm tra lịch sử mua trước khi xử lý.',
        billDelta: 0,
        employeeRatingDelta: 0.18,
        storeReputationDelta: 0.16,
        customerSatisfactionDelta: 0.08,
        feedback:
          'Mất thêm thời gian nhưng cửa hàng có cơ sở xác minh giao dịch và khách vẫn có cơ hội được hỗ trợ.',
      },
      {
        id: 'manager-store-credit',
        label: 'Nhờ quản lý xác nhận và đề xuất phiếu mua hàng nếu chính sách cho phép.',
        billDelta: 0,
        employeeRatingDelta: 0.14,
        storeReputationDelta: 0.18,
        customerSatisfactionDelta: 0.14,
        feedback:
          'Khách có phương án thay thế mà cửa hàng vẫn kiểm soát được rủi ro đổi trả không có hóa đơn.',
      },
      {
        id: 'refuse-immediately',
        label: 'Từ chối ngay vì khách không có hóa đơn.',
        billDelta: 0,
        employeeRatingDelta: -0.18,
        storeReputationDelta: -0.18,
        customerSatisfactionDelta: -0.28,
        feedback:
          'Quầy xử lý nhanh nhưng chưa kiểm tra các cách xác minh khác, nên khách có thể cảm thấy chưa được hỗ trợ đầy đủ.',
      },
    ],
  },
  {
    id: 'SCENARIO_DAMAGED_EGGS',
    version: 1,
    category: 'product-quality',
    difficulty: 1,
    title: 'Hộp trứng có một quả bị nứt',
    description:
      'Ngay trước khi thanh toán, em thấy một quả trứng trong hộp của khách đã bị nứt.',
    choices: [
      {
        id: 'replace-carton',
        label: 'Báo khách và đổi sang hộp trứng nguyên vẹn.',
        billDelta: 0,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.16,
        customerSatisfactionDelta: 0.16,
        feedback:
          'Khách nhận sản phẩm nguyên vẹn, nhưng quầy cần thêm một chút thời gian để đổi hàng.',
      },
      {
        id: 'remove-and-let-customer-decide',
        label: 'Báo khách, bỏ hộp bị nứt khỏi hóa đơn và hỏi khách có muốn lấy hộp khác không.',
        billDelta: -42000,
        employeeRatingDelta: 0.16,
        storeReputationDelta: 0.12,
        customerSatisfactionDelta: 0.12,
        feedback:
          'Giao dịch minh bạch và khách tự quyết định có chờ lấy hộp mới hay không.',
      },
      {
        id: 'bag-damaged-eggs',
        label: 'Đóng túi cẩn thận hơn và không nhắc vì chỉ nứt một quả.',
        billDelta: 0,
        employeeRatingDelta: -0.32,
        storeReputationDelta: -0.3,
        customerSatisfactionDelta: -0.3,
        feedback:
          'Khách có thể phát hiện sản phẩm hỏng sau khi rời quầy và phải quay lại xử lý.',
      },
    ],
  },
  {
    id: 'SCENARIO_QUEUE_PRIORITY',
    version: 1,
    category: 'customer-needs',
    difficulty: 2,
    title: 'Khách lớn tuổi xin thanh toán trước',
    description:
      'Quầy đang đông. Một khách lớn tuổi chỉ có hai món và hỏi liệu có thể được thanh toán trước không.',
    choices: [
      {
        id: 'ask-queue-consent',
        label: 'Hỏi nhanh những khách đang chờ xem mọi người có đồng ý nhường lượt không.',
        billDelta: 0,
        employeeRatingDelta: 0.18,
        storeReputationDelta: 0.12,
        customerSatisfactionDelta: 0.14,
        feedback:
          'Quyết định được trao đổi công khai với hàng chờ, giảm cảm giác ưu tiên tùy tiện nhưng tốn thêm vài giây.',
      },
      {
        id: 'call-support-counter',
        label: 'Gọi hỗ trợ mở quầy phụ hoặc nhờ nhân viên khác thanh toán hai món.',
        billDelta: 0,
        employeeRatingDelta: 0.14,
        storeReputationDelta: 0.2,
        customerSatisfactionDelta: 0.12,
        feedback:
          'Hàng chờ hiện tại giữ nguyên thứ tự, nhưng cửa hàng phải điều phối thêm nhân sự.',
      },
      {
        id: 'ignore-request',
        label: 'Yêu cầu khách tiếp tục chờ như mọi người mà không giải thích thêm.',
        billDelta: 0,
        employeeRatingDelta: -0.12,
        storeReputationDelta: -0.12,
        customerSatisfactionDelta: -0.24,
        feedback:
          'Thứ tự hàng chờ được giữ nguyên nhưng nhu cầu hỗ trợ của khách chưa được xem xét hoặc giải thích.',
      },
    ],
  },
  {
    id: 'SCENARIO_UNIT_PRICE_COMPARISON',
    version: 1,
    category: 'transparency',
    difficulty: 2,
    title: 'Gói lớn chưa chắc rẻ hơn',
    description:
      'Khách hỏi gói đang gắn biển khuyến mãi có thực sự tiết kiệm hơn gói nhỏ khi tính theo đơn vị hay không.',
    choices: [
      {
        id: 'explain-unit-price',
        label: 'Tính giá theo đơn vị của cả hai gói, giải thích rồi để khách tự chọn.',
        billDelta: 0,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.18,
        customerSatisfactionDelta: 0.16,
        feedback:
          'Khách có đủ dữ kiện để tự chọn theo nhu cầu thay vì chỉ dựa vào biển khuyến mãi.',
      },
      {
        id: 'recommend-cheaper-unit',
        label: 'Tính nhanh và đề xuất gói có giá theo đơn vị thấp hơn.',
        billDelta: -6000,
        employeeRatingDelta: 0.14,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: 0.18,
        feedback:
          'Khách tiết kiệm thời gian và chi phí đơn vị, nhưng quyết định dựa nhiều hơn vào đề xuất của nhân viên.',
      },
      {
        id: 'push-promo-pack',
        label: 'Khuyên khách lấy gói có biển khuyến mãi mà không so sánh đơn giá.',
        billDelta: 0,
        employeeRatingDelta: -0.2,
        storeReputationDelta: -0.22,
        customerSatisfactionDelta: -0.2,
        feedback:
          'Biển khuyến mãi được dùng như lý do chính dù chưa kiểm tra lựa chọn nào thực sự tiết kiệm hơn.',
      },
    ],
  },
  {
    id: 'SCENARIO_FROZEN_ITEM_LEFT_OUT',
    version: 1,
    category: 'product-quality',
    difficulty: 3,
    title: 'Hàng đông lạnh đã để ngoài lâu',
    description:
      'Một gói thực phẩm đông lạnh bị bỏ ngoài quầy khá lâu. Không ai chắc sản phẩm còn được giữ đúng nhiệt độ.',
    choices: [
      {
        id: 'quarantine-and-replace',
        label: 'Tách sản phẩm khỏi hàng bán và lấy sản phẩm khác cho khách.',
        billDelta: 0,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.22,
        customerSatisfactionDelta: 0.14,
        feedback:
          'Cửa hàng chịu thêm chi phí xử lý nhưng tránh bán sản phẩm có điều kiện bảo quản không chắc chắn.',
      },
      {
        id: 'hold-for-manager',
        label: 'Giữ sản phẩm riêng, nhờ quản lý kiểm tra quy trình rồi mới quyết định.',
        billDelta: 0,
        employeeRatingDelta: 0.16,
        storeReputationDelta: 0.2,
        customerSatisfactionDelta: -0.05,
        feedback:
          'Quy trình thận trọng hơn nhưng khách và hàng chờ phải đợi trong lúc xác minh.',
      },
      {
        id: 'put-back-freezer',
        label: 'Cho lại vào tủ đông vì bao bì vẫn còn lạnh.',
        billDelta: 0,
        employeeRatingDelta: -0.4,
        storeReputationDelta: -0.45,
        customerSatisfactionDelta: -0.28,
        feedback:
          'Sản phẩm quay lại kệ dù điều kiện bảo quản trước đó chưa được xác minh.',
      },
    ],
  },
  {
    id: 'SCENARIO_COUPON_STACKING',
    version: 1,
    category: 'promotion',
    difficulty: 3,
    title: 'Hai coupon không được cộng dồn',
    description:
      'Khách có hai coupon đều hợp lệ riêng lẻ, nhưng điều kiện chương trình ghi rằng chỉ được dùng một coupon cho mỗi hóa đơn.',
    choices: [
      {
        id: 'compare-coupons',
        label: 'Tính cả hai phương án và giúp khách chọn coupon tiết kiệm hơn.',
        billDelta: -30000,
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.16,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Quy định được giữ đúng và khách vẫn nhận phương án có lợi hơn sau khi so sánh.',
      },
      {
        id: 'let-customer-choose-coupon',
        label: 'Giải thích không được cộng dồn và để khách tự chọn coupon muốn dùng.',
        billDelta: -20000,
        employeeRatingDelta: 0.16,
        storeReputationDelta: 0.14,
        customerSatisfactionDelta: 0.14,
        feedback:
          'Khách giữ quyền quyết định, dù họ có thể không chọn phương án tiết kiệm tối đa.',
      },
      {
        id: 'stack-both-coupons',
        label: 'Áp dụng cả hai coupon để khách vui hơn.',
        billDelta: -50000,
        employeeRatingDelta: -0.3,
        storeReputationDelta: -0.28,
        customerSatisfactionDelta: 0.12,
        feedback:
          'Khách được lợi trong giao dịch này nhưng chính sách khuyến mãi bị áp dụng sai và đối soát có thể phát hiện chênh lệch.',
      },
    ],
  }
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
      scenarioVersion: 2,
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
      scenarioVersion: 1,
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
