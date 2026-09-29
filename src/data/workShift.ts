import type {
  WorkScenarioDefinition,
  WorkShiftDefinition,
} from '../domain/types'

export const workScenarios: WorkScenarioDefinition[] = [
  {
    id: 'SCENARIO_DAMAGED_DRINK',
    title: 'Hộp nước bị móp',
    description:
      'Khi chuẩn bị giao hàng cho khách, em phát hiện một hộp nước ép bị móp khá rõ.',
    choices: [
      {
        id: 'replace-and-inform',
        label: 'Báo cho khách và đổi sang hộp nguyên vẹn.',
        employeeRatingDelta: 0.2,
        storeReputationDelta: 0.2,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Khách biết rõ tình trạng sản phẩm và nhận được hộp nguyên vẹn. Cửa hàng giảm nguy cơ khiếu nại.',
      },
      {
        id: 'sell-as-normal',
        label: 'Cho vào túi như bình thường vì sản phẩm vẫn chưa hết hạn.',
        employeeRatingDelta: -0.4,
        storeReputationDelta: -0.5,
        customerSatisfactionDelta: -0.4,
        feedback:
          'Khách có thể phát hiện sản phẩm bị móp sau khi rời quầy. Khả năng khiếu nại và đổi trả tăng lên.',
      },
      {
        id: 'silent-discount',
        label: 'Tự giảm một ít tiền nhưng không nói rõ lý do.',
        employeeRatingDelta: -0.1,
        storeReputationDelta: -0.2,
        customerSatisfactionDelta: 0,
        feedback:
          'Giá thấp hơn nhưng khách vẫn không được biết tình trạng sản phẩm. Thông tin giao dịch chưa minh bạch.',
      },
    ],
  },
  {
    id: 'SCENARIO_VALID_VOUCHER',
    title: 'Voucher 20.000đ',
    description:
      'Khách đưa voucher giảm 20.000đ. Quy định ghi rõ voucher dùng cho hóa đơn từ 100.000đ và hóa đơn hiện tại đủ điều kiện.',
    choices: [
      {
        id: 'apply-voucher',
        label: 'Kiểm tra điều kiện và áp dụng voucher 20.000đ.',
        employeeRatingDelta: 0.15,
        storeReputationDelta: 0.1,
        customerSatisfactionDelta: 0.2,
        feedback:
          'Voucher được áp dụng đúng quy định. Khách nhận đúng quyền lợi và hóa đơn minh bạch.',
      },
      {
        id: 'reject-voucher',
        label: 'Từ chối voucher để tránh thao tác nhầm.',
        employeeRatingDelta: -0.25,
        storeReputationDelta: -0.15,
        customerSatisfactionDelta: -0.3,
        feedback:
          'Khách đủ điều kiện nhưng không nhận được ưu đãi. Trải nghiệm phục vụ giảm dù cửa hàng không thất thoát tiền.',
      },
      {
        id: 'apply-double',
        label: 'Giảm 40.000đ để khách vui hơn.',
        employeeRatingDelta: -0.35,
        storeReputationDelta: -0.25,
        customerSatisfactionDelta: 0.15,
        feedback:
          'Khách được lợi hơn nhưng ưu đãi không đúng quy định, làm sai lệch doanh thu và chính sách cửa hàng.',
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
        { name: '2 lốc sữa', quantity: 2, unitPrice: 36000 },
        { name: '1 túi táo', quantity: 1, unitPrice: 30000 },
      ],
      cashGiven: 200000,
    },
    {
      id: 'customer-minh',
      name: 'Anh Minh',
      basket: [
        { name: '3 lốc nước ép', quantity: 3, unitPrice: 42000 },
        { name: '1 gói khăn giấy', quantity: 1, unitPrice: 15000 },
      ],
      cashGiven: 200000,
      scenarioId: 'SCENARIO_DAMAGED_DRINK',
    },
    {
      id: 'customer-thao',
      name: 'Chị Thảo',
      basket: [
        { name: '2 hộp cupcake', quantity: 2, unitPrice: 40000 },
        { name: '1 lốc trà trái cây', quantity: 1, unitPrice: 35000 },
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
