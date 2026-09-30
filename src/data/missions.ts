import type { MissionDefinition } from '../domain/types'

export const missions: MissionDefinition[] = [
  {
    id: 'mission-class-party-01',
    version: 2,
    title: 'Chuẩn bị liên hoan lớp',
    shortDescription: 'Mua đủ đồ cho 20 bạn nhưng vẫn giữ lại ít nhất 30.000đ.',
    story:
      'Cô giao cho em chuẩn bị liên hoan cho cả lớp. Nếu hoàn thành chuyến mua sắm thật gọn gàng và đạt 5 sao, cô có một phần quà đặc biệt.',
    people: 20,
    budget: 500000,
    reserveRequired: 30000,
    requiredStalls: ['produce', 'food', 'drinks'],
    rewardTitle: 'Huy hiệu Người mua sắm thông minh',
    unlockLevel: 1,
    targetTimeSeconds: 300,
    xpReward: 75,
    softGoals: [
      {
        id: 'class-party-variety',
        title: 'Cô nhắn thêm',
        description:
          'Nếu có thể, hãy chuẩn bị đa dạng món để các bạn có nhiều lựa chọn hơn.',
        revealAfterItems: 3,
        kind: 'min-distinct-products',
        target: 5,
      },
    ],
    teacherChallenge: {
      id: 'teacher-five-star-class-party',
      requiredStars: 5,
      coinReward: 100,
      label: 'Thử thách của cô: đạt 5/5 sao',
    },
  },
  {
    id: 'mission-weekend-picnic-01',
    version: 1,
    title: 'Picnic cuối tuần',
    shortDescription: 'Chuẩn bị đồ cho 8 bạn, đủ ăn uống và vẫn còn khoản dự phòng.',
    story:
      'Nhóm bạn chuẩn bị đi picnic. Em phụ trách giỏ đồ chung và cần cân bằng số lượng, giá và khoản dự phòng.',
    people: 8,
    budget: 320000,
    reserveRequired: 40000,
    requiredStalls: ['produce', 'food', 'drinks'],
    rewardTitle: 'Huy hiệu Người lập kế hoạch',
    unlockLevel: 3,
    prerequisiteMissionId: 'mission-class-party-01',
    targetTimeSeconds: 260,
    xpReward: 80,
    softGoals: [
      {
        id: 'picnic-no-dairy',
        title: 'Tin nhắn từ nhóm',
        description:
          'Có 2 bạn không dùng sữa. Hãy cân nhắc giỏ đồ để mọi người dễ dùng chung.',
        revealAfterItems: 2,
        kind: 'avoid-products',
        productIds: ['food-yogurt-pack', 'drinks-milk-pack'],
      },
    ],
  },
  {
    id: 'mission-smart-basket-01',
    version: 1,
    title: 'Giỏ hàng tiết kiệm',
    shortDescription: 'Chuẩn bị đủ cho 6 người và cố gắng giữ lại ít nhất 50.000đ.',
    story:
      'Gia đình nhờ em chuẩn bị một giỏ hàng gọn gàng cho cuối tuần. Không cần mua nhiều nhất, cần mua hợp lý nhất.',
    people: 6,
    budget: 250000,
    reserveRequired: 50000,
    requiredStalls: ['food', 'drinks', 'supplies'],
    rewardTitle: 'Huy hiệu Giỏ hàng thông minh',
    unlockLevel: 4,
    prerequisiteMissionId: 'mission-weekend-picnic-01',
    targetTimeSeconds: 240,
    xpReward: 90,
    softGoals: [
      {
        id: 'smart-basket-existing-cups',
        title: 'Nhà vừa nhắn',
        description:
          'Ở nhà vẫn còn đủ cốc giấy. Đừng mua thêm nếu không thực sự cần.',
        revealAfterItems: 2,
        kind: 'avoid-products',
        productIds: ['supplies-paper-cups'],
      },
    ],
  },
  {
    id: 'mission-promo-planner-01',
    version: 1,
    title: 'Ngày khuyến mãi',
    shortDescription: 'Lập giỏ hàng cho 10 người trong ngày nhiều ưu đãi.',
    story:
      'SmartMart có ngày khuyến mãi. Em cần chọn đúng thứ cần mua thay vì bị cuốn theo mọi biển giảm giá.',
    people: 10,
    budget: 360000,
    reserveRequired: 45000,
    requiredStalls: ['produce', 'food', 'drinks', 'supplies'],
    rewardTitle: 'Huy hiệu Thợ săn ưu đãi tỉnh táo',
    unlockLevel: 5,
    prerequisiteMissionId: 'mission-smart-basket-01',
    targetTimeSeconds: 300,
    xpReward: 100,
    softGoals: [
      {
        id: 'promo-variety',
        title: 'Nhắc nhỏ trước khi thanh toán',
        description:
          'Đừng để biển giảm giá làm em mua quá nhiều một loại. Giỏ đa dạng thường hữu ích hơn.',
        revealAfterItems: 3,
        kind: 'min-distinct-products',
        target: 6,
      },
    ],
  },
]

export const firstMission = missions[0]

export function getMissionById(id: string) {
  const mission = missions.find((item) => item.id === id)
  if (!mission) throw new Error('Unknown mission: ' + id)
  return mission
}
