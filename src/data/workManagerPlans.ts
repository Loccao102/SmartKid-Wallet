import type { WorkManagerPlanDefinition } from '../domain/types'

export const workManagerPlans: WorkManagerPlanDefinition[] = [
  {
    id: 'checkout-support',
    title: 'Tăng hỗ trợ quầy',
    description:
      'Bố trí thêm người kiểm tra hóa đơn và tiền mặt. Một sự cố vận hành hoặc đối soát đầu tiên có thể được chặn trước khi lan rộng.',
    protection: 'operations',
    employeeRatingDelta: 0.08,
    storeReputationDelta: 0.06,
    customerSatisfactionDelta: -0.03,
  },
  {
    id: 'stock-support',
    title: 'Tăng hỗ trợ kho',
    description:
      'Ưu tiên nhân sự kiểm tra tồn kho và hàng thay thế. Một áp lực tồn kho đầu tiên có thể được xử lý sớm.',
    protection: 'inventory',
    employeeRatingDelta: 0.04,
    storeReputationDelta: 0.08,
    customerSatisfactionDelta: 0,
  },
  {
    id: 'customer-care',
    title: 'Tăng chăm sóc khách',
    description:
      'Bố trí người hỗ trợ đổi trả và giải thích chính sách. Một rủi ro khiếu nại đầu tiên có thể được hấp thụ tốt hơn.',
    protection: 'service',
    employeeRatingDelta: 0.02,
    storeReputationDelta: 0.05,
    customerSatisfactionDelta: 0.1,
  },
]

export function getWorkManagerPlan(id: string) {
  const plan = workManagerPlans.find((item) => item.id === id)
  if (!plan) throw new Error('Unknown work manager plan: ' + id)
  return plan
}
