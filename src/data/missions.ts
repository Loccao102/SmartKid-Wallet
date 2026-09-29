import type { MissionDefinition } from '../domain/types'

export const missions: MissionDefinition[] = [
  {
    id: 'mission-class-party-01',
    title: 'Chuẩn bị liên hoan lớp',
    shortDescription: 'Mua đủ đồ cho 20 bạn nhưng vẫn giữ lại ít nhất 30.000đ.',
    story:
      'Lớp sắp tổ chức một buổi liên hoan nhỏ. Em được giao quản lý ngân sách và chọn đồ cho cả lớp.',
    people: 20,
    budget: 500000,
    reserveRequired: 30000,
    requiredStalls: ['produce', 'food', 'drinks'],
    rewardTitle: 'Huy hiệu Người mua sắm thông minh',
  },
]

export const firstMission = missions[0]
