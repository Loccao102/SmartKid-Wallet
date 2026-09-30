import {
  createSeededRng,
  pickSeededInt,
  seededShuffle,
} from '../core/worldChapter/random'
import type {
  WorldChapterDefinition,
  WorldChapterLessonDefinition,
  WorldChapterQuestion,
} from '../core/worldChapter/types'

export type RestaurantLessonId =
  | 'share-table'
  | 'bill-counter'
  | 'zero-waste'
  | 'dinner-rush'

export interface RestaurantLessonDefinition {
  id: RestaurantLessonId
  title: string
  subtitle: string
  description: string
  skillLabel: string
  xpReward: number
}

export interface RestaurantQuestion {
  id: string
  prompt: string
  answer: number
  unit: string
  hint: string
}

export interface RestaurantRushChoice {
  id: string
  label: string
  description: string
  revenueDelta: number
  satisfactionDelta: number
  wasteDelta: number
  timeDelta: number
  consequence: string
}

export interface RestaurantRushRound {
  id: string
  title: string
  story: string
  choices: RestaurantRushChoice[]
}

export interface RestaurantRushRun {
  seed: number
  targetRevenue: number
  rounds: RestaurantRushRound[]
}

export const restaurantLessons: RestaurantLessonDefinition[] = [
  {
    id: 'share-table',
    title: 'Chia phần cho cả bàn',
    subtitle: 'Mỗi bạn nhận một phần vừa đủ',
    description:
      'Luyện chia đều, phân số và số phần để phục vụ cả bàn không thiếu ai.',
    skillLabel: 'Chia đều · Phân số',
    xpReward: 40,
  },
  {
    id: 'bill-counter',
    title: 'Tính hóa đơn',
    subtitle: 'Nhanh nhưng phải chính xác',
    description:
      'Nhân số lượng với đơn giá, cộng nhiều món và kiểm tra số tiền khách cần trả.',
    skillLabel: 'Nhân · Cộng · Nhiều bước',
    xpReward: 45,
  },
  {
    id: 'zero-waste',
    title: 'Bếp không lãng phí',
    subtitle: 'Nấu vừa đủ thay vì nấu thật nhiều',
    description:
      'Ước lượng khẩu phần, khối lượng và lượng nguyên liệu cần cho từng bàn.',
    skillLabel: 'Khối lượng · Ước lượng',
    xpReward: 45,
  },
  {
    id: 'dinner-rush',
    title: 'Mission giờ cao điểm',
    subtitle: 'Không thể tối ưu mọi thứ cùng lúc',
    description:
      'Phục vụ bốn tình huống liên tiếp và cân bằng doanh thu, khách hài lòng, thời gian và đồ ăn bỏ đi.',
    skillLabel: 'Trade-off · Trách nhiệm',
    xpReward: 110,
  },
]

export const happyRestaurantChapter: WorldChapterDefinition<RestaurantLessonId> = {
  mapId: 'happy-restaurant',
  version: 1,
  lessonOrder: ['share-table', 'bill-counter', 'zero-waste', 'dinner-rush'],
  finalLessonId: 'dinner-rush',
  finalMinStars: 3,
  seedBase: 20261001,
  chapterXpReward: 90,
  chapterCoinReward: 90,
}

export function createRestaurantQuiz(
  lessonId: Exclude<RestaurantLessonId, 'dinner-rush'>,
  seed: number,
): RestaurantQuestion[] {
  const rng = createSeededRng(seed)

  if (lessonId === 'share-table') {
    return Array.from({ length: 3 }, (_, index) => {
      const people = pickSeededInt(rng, 4, 8)
      const each = pickSeededInt(rng, 2, 5)
      const total = people * each
      return {
        id: `share-${seed}-${index}`,
        prompt:
          index % 2 === 0
            ? `Một bàn có ${people} bạn. Mỗi bạn cần ${each} miếng bánh. Cần chuẩn bị tất cả bao nhiêu miếng?`
            : `Có ${total} miếng bánh chia đều cho ${people} bạn. Mỗi bạn nhận mấy miếng?`,
        answer: index % 2 === 0 ? total : each,
        unit: 'miếng',
        hint:
          index % 2 === 0
            ? 'Số bạn × số miếng mỗi bạn.'
            : 'Tổng số miếng ÷ số bạn.',
      }
    })
  }

  if (lessonId === 'bill-counter') {
    return Array.from({ length: 3 }, (_, index) => {
      const priceA = pickSeededInt(rng, 20_000, 45_000, 5_000)
      const qtyA = pickSeededInt(rng, 2, 4)
      const priceB = pickSeededInt(rng, 15_000, 35_000, 5_000)
      const qtyB = pickSeededInt(rng, 1, 3)
      const answer = priceA * qtyA + priceB * qtyB
      return {
        id: `bill-${seed}-${index}`,
        prompt: `Bàn gọi ${qtyA} món giá ${priceA.toLocaleString('vi-VN')}đ và ${qtyB} món giá ${priceB.toLocaleString('vi-VN')}đ. Tổng hóa đơn là bao nhiêu?`,
        answer,
        unit: 'đ',
        hint: 'Tính tiền từng loại món rồi cộng hai kết quả.',
      }
    })
  }

  return Array.from({ length: 3 }, (_, index) => {
    const people = pickSeededInt(rng, 4, 10)
    const gramsEach = pickSeededInt(rng, 100, 250, 25)
    const total = people * gramsEach
    return {
      id: `waste-${seed}-${index}`,
      prompt: `Có ${people} khách. Mỗi suất cần khoảng ${gramsEach}g nguyên liệu chính. Bếp nên chuẩn bị khoảng bao nhiêu gam?`,
      answer: total,
      unit: 'g',
      hint: 'Số khách × số gam cho mỗi suất.',
    }
  })
}

export function createRestaurantRush(seed: number): RestaurantRushRun {
  const rng = createSeededRng(seed)
  const baseRevenue = pickSeededInt(rng, 520_000, 620_000, 10_000)

  const rounds: RestaurantRushRound[] = [
    {
      id: 'large-table',
      title: 'Bàn đông khách',
      story: 'Một nhóm 8 bạn đến cùng lúc. Bếp đang bận và họ muốn đồ ăn ra sớm.',
      choices: [
        {
          id: 'full-fast',
          label: 'Làm tất cả thật nhanh',
          description: 'Ưu tiên tốc độ, chuẩn bị nhiều để không ai phải chờ.',
          revenueDelta: 170_000,
          satisfactionDelta: 2,
          wasteDelta: 3,
          timeDelta: -2,
          consequence: 'Khách vui vì nhanh, nhưng bếp làm dư khá nhiều món.',
        },
        {
          id: 'portion-check',
          label: 'Hỏi lại khẩu phần',
          description: 'Mất thêm ít phút để xác nhận số phần thật sự cần.',
          revenueDelta: 150_000,
          satisfactionDelta: 1,
          wasteDelta: 0,
          timeDelta: 1,
          consequence: 'Phục vụ chậm hơn chút nhưng lượng đồ thừa giảm rõ rệt.',
        },
        {
          id: 'split-order',
          label: 'Ra món theo hai đợt',
          description: 'Cho món nhanh ra trước, món còn lại ra sau.',
          revenueDelta: 160_000,
          satisfactionDelta: 1,
          wasteDelta: 1,
          timeDelta: 0,
          consequence: 'Bàn không phải chờ toàn bộ, bếp cũng đỡ quá tải.',
        },
      ],
    },
    {
      id: 'wrong-dish',
      title: 'Món bị làm nhầm',
      story: 'Bếp vừa làm nhầm một món vẫn còn nguyên và an toàn.',
      choices: [
        {
          id: 'throw-away',
          label: 'Bỏ đi và làm lại ngay',
          description: 'Nhanh gọn, nhưng món cũ bị bỏ.',
          revenueDelta: 110_000,
          satisfactionDelta: 2,
          wasteDelta: 3,
          timeDelta: 0,
          consequence: 'Khách được xử lý nhanh, đổi lại lượng lãng phí tăng mạnh.',
        },
        {
          id: 'reuse-safe',
          label: 'Chuyển cho đơn phù hợp',
          description: 'Giữ món an toàn để dùng cho bàn vừa gọi đúng món đó.',
          revenueDelta: 115_000,
          satisfactionDelta: 1,
          wasteDelta: 0,
          timeDelta: 1,
          consequence: 'Bếp mất công sắp xếp lại nhưng tránh bỏ một món còn tốt.',
        },
        {
          id: 'staff-meal',
          label: 'Để làm suất nhân viên',
          description: 'Không bán lại, cũng không bỏ đi.',
          revenueDelta: 105_000,
          satisfactionDelta: 1,
          wasteDelta: 0,
          timeDelta: 0,
          consequence: 'Món không tạo thêm doanh thu nhưng cũng không trở thành rác.',
        },
      ],
    },
    {
      id: 'budget-family',
      title: 'Gia đình có ngân sách',
      story: 'Một gia đình nói rõ họ chỉ muốn chi trong khoảng 180.000đ.',
      choices: [
        {
          id: 'upsell',
          label: 'Gợi ý combo lớn hơn',
          description: 'Combo hấp dẫn hơn nhưng vượt ngân sách của họ.',
          revenueDelta: 190_000,
          satisfactionDelta: -1,
          wasteDelta: 1,
          timeDelta: 0,
          consequence: 'Doanh thu tăng nhưng khách hơi khó chịu vì bị đẩy quá ngân sách.',
        },
        {
          id: 'fit-budget',
          label: 'Ghép món đúng ngân sách',
          description: 'Ưu tiên đủ ăn và nằm trong mức khách mong muốn.',
          revenueDelta: 175_000,
          satisfactionDelta: 2,
          wasteDelta: 0,
          timeDelta: 1,
          consequence: 'Khách hài lòng vì được tư vấn đúng nhu cầu.',
        },
        {
          id: 'two-options',
          label: 'Đưa hai phương án',
          description: 'Một phương án tiết kiệm và một phương án đầy đủ hơn.',
          revenueDelta: 180_000,
          satisfactionDelta: 2,
          wasteDelta: 0,
          timeDelta: 1,
          consequence: 'Khách chủ động chọn và cảm thấy được tôn trọng.',
        },
      ],
    },
    {
      id: 'closing-time',
      title: 'Gần giờ đóng cửa',
      story: 'Cuối ca vẫn còn một ít nguyên liệu tươi cần dùng sớm.',
      choices: [
        {
          id: 'cook-all',
          label: 'Nấu hết thành món sẵn',
          description: 'Có thể bán thêm nếu còn khách.',
          revenueDelta: 125_000,
          satisfactionDelta: 0,
          wasteDelta: 2,
          timeDelta: 1,
          consequence: 'Một phần bán được, nhưng vẫn có nguy cơ dư món đã nấu.',
        },
        {
          id: 'small-special',
          label: 'Làm suất đặc biệt vừa đủ',
          description: 'Chỉ dùng lượng nguyên liệu phù hợp với số khách còn lại.',
          revenueDelta: 115_000,
          satisfactionDelta: 1,
          wasteDelta: 0,
          timeDelta: 1,
          consequence: 'Doanh thu vừa phải nhưng bếp kết ca gọn và ít đồ bỏ.',
        },
        {
          id: 'store-correctly',
          label: 'Bảo quản phần còn dùng được',
          description: 'Không cố bán bằng mọi giá nếu không cần.',
          revenueDelta: 95_000,
          satisfactionDelta: 1,
          wasteDelta: 0,
          timeDelta: 0,
          consequence: 'Doanh thu thấp hơn nhưng nguyên liệu được xử lý có trách nhiệm.',
        },
      ],
    },
  ]

  return {
    seed,
    targetRevenue: baseRevenue,
    rounds: rounds.map((round) => ({
      ...round,
      choices: seededShuffle(round.choices, rng),
    })),
  }
}

export function scoreRestaurantRush(
  run: RestaurantRushRun,
  revenue: number,
  satisfaction: number,
  waste: number,
  time: number,
) {
  let stars = 1
  if (revenue >= run.targetRevenue) stars += 1
  if (satisfaction >= 4) stars += 1
  if (waste <= 2) stars += 1
  if (time <= 3) stars += 1
  return Math.min(5, stars)
}
