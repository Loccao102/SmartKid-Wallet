export type WeekendMarketLessonId =
  | 'unit-price'
  | 'profit-loss'
  | 'fair-bargain'
  | 'market-day'

export interface WeekendMarketLessonDefinition {
  id: WeekendMarketLessonId
  title: string
  subtitle: string
  description: string
  skillLabel: string
  xpReward: number
}

export interface WeekendMarketQuestion {
  id: string
  prompt: string
  answer: number
  unit: string
  hint: string
}

export interface MarketDayChoice {
  id: string
  label: string
  description: string
  cashDelta: number
  trustDelta: number
  stockDelta: number
  wasteDelta: number
  consequence: string
}

export interface MarketDayRound {
  id: string
  title: string
  story: string
  choices: MarketDayChoice[]
}

export interface MarketDayRun {
  seed: number
  targetCash: number
  startingStock: number
  rounds: MarketDayRound[]
}

export const weekendMarketLessons: WeekendMarketLessonDefinition[] = [
  {
    id: 'unit-price',
    title: 'So sánh đơn giá',
    subtitle: 'Rẻ hơn chưa chắc lời hơn',
    description:
      'So sánh giá theo kg, gói hoặc số lượng để biết phương án nào hợp lý hơn.',
    skillLabel: 'Đơn giá · So sánh',
    xpReward: 45,
  },
  {
    id: 'profit-loss',
    title: 'Quầy hàng có lời không?',
    subtitle: 'Doanh thu khác với lợi nhuận',
    description:
      'Tính tiền vốn, doanh thu và phần còn lại sau khi bán hàng.',
    skillLabel: 'Nhân · Cộng · Trừ',
    xpReward: 50,
  },
  {
    id: 'fair-bargain',
    title: 'Mặc cả cho công bằng',
    subtitle: 'Biết giá trị trước khi trả giá',
    description:
      'Tính mức giảm hợp lý và hiểu rằng ép giá quá thấp cũng có hậu quả.',
    skillLabel: 'Phần trăm · Công bằng',
    xpReward: 50,
  },
  {
    id: 'market-day',
    title: 'Mission một buổi chợ',
    subtitle: 'Bán được hàng nhưng vẫn giữ uy tín',
    description:
      'Xử lý khách trả giá, hàng gần hỏng và tồn kho trong một buổi chợ ngắn.',
    skillLabel: 'Trade-off · Kinh doanh nhỏ',
    xpReward: 120,
  },
]

function createRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickInt(rng: () => number, min: number, max: number, step = 1) {
  const count = Math.floor((max - min) / step) + 1
  return min + Math.floor(rng() * count) * step
}

function shuffle<T>(items: T[], rng: () => number) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}

export function createWeekendMarketQuiz(
  lessonId: Exclude<WeekendMarketLessonId, 'market-day'>,
  seed: number,
): WeekendMarketQuestion[] {
  const rng = createRng(seed)

  if (lessonId === 'unit-price') {
    return Array.from({ length: 3 }, (_, index) => {
      const units = pickInt(rng, 2, 5)
      const unitPrice = pickInt(rng, 8_000, 20_000, 1_000)
      const total = units * unitPrice
      return {
        id: `unit-${seed}-${index}`,
        prompt:
          index % 2 === 0
            ? `Một túi có ${units} phần giống nhau, tổng giá ${total.toLocaleString('vi-VN')}đ. Mỗi phần có giá bao nhiêu?`
            : `${units} kg hàng có giá ${total.toLocaleString('vi-VN')}đ. Giá mỗi kg là bao nhiêu?`,
        answer: unitPrice,
        unit: 'đ',
        hint: 'Lấy tổng giá chia cho số phần hoặc số kg.',
      }
    })
  }

  if (lessonId === 'profit-loss') {
    return Array.from({ length: 3 }, (_, index) => {
      const qty = pickInt(rng, 5, 10)
      const cost = pickInt(rng, 10_000, 20_000, 2_000)
      const sell = cost + pickInt(rng, 3_000, 8_000, 1_000)
      const profit = qty * (sell - cost)
      return {
        id: `profit-${seed}-${index}`,
        prompt: `Em nhập ${qty} món, vốn ${cost.toLocaleString('vi-VN')}đ/món và bán ${sell.toLocaleString('vi-VN')}đ/món. Nếu bán hết, lãi bao nhiêu?`,
        answer: profit,
        unit: 'đ',
        hint: 'Tính lãi mỗi món trước, rồi nhân với số món bán được.',
      }
    })
  }

  const rates = [10, 20, 25]
  return Array.from({ length: 3 }, (_, index) => {
    const price = pickInt(rng, 80_000, 200_000, 20_000)
    const rate = rates[index]
    const discount = Math.round((price * rate) / 100)
    return {
      id: `bargain-${seed}-${index}`,
      prompt: `Một món giá ${price.toLocaleString('vi-VN')}đ. Nếu người bán đồng ý giảm ${rate}%, số tiền được giảm là bao nhiêu?`,
      answer: discount,
      unit: 'đ',
      hint:
        rate === 10
          ? '10% là một phần mười của giá.'
          : rate === 20
            ? '20% bằng hai lần 10%.'
            : '25% là một phần tư.',
    }
  })
}

export function createMarketDay(seed: number): MarketDayRun {
  const rng = createRng(seed)
  const targetCash = pickInt(rng, 420_000, 500_000, 10_000)
  const startingStock = 18

  const rounds: MarketDayRound[] = [
    {
      id: 'first-customer',
      title: 'Khách đầu tiên trả giá',
      story: 'Một cô khách muốn mua nhiều nhưng đề nghị giảm giá khá mạnh.',
      choices: [
        {
          id: 'accept-low',
          label: 'Đồng ý ngay',
          description: 'Bán nhanh 5 món với giá thấp.',
          cashDelta: 105_000,
          trustDelta: 1,
          stockDelta: -5,
          wasteDelta: 0,
          consequence: 'Bán được nhiều hàng nhưng biên lợi nhuận khá mỏng.',
        },
        {
          id: 'counter-fair',
          label: 'Đề nghị mức giữa',
          description: 'Giải thích giá và giảm vừa phải nếu mua nhiều.',
          cashDelta: 125_000,
          trustDelta: 2,
          stockDelta: -5,
          wasteDelta: 0,
          consequence: 'Hai bên đều nhượng một chút và giao dịch diễn ra vui vẻ.',
        },
        {
          id: 'refuse-all',
          label: 'Không giảm chút nào',
          description: 'Giữ nguyên giá dù khách mua số lượng lớn.',
          cashDelta: 70_000,
          trustDelta: -1,
          stockDelta: -3,
          wasteDelta: 0,
          consequence: 'Em giữ giá tốt nhưng khách chỉ mua ít rồi rời quầy.',
        },
      ],
    },
    {
      id: 'near-expiry',
      title: 'Một số hàng nên bán sớm',
      story: 'Có 4 món vẫn an toàn nhưng chất lượng sẽ giảm nếu để sang ngày mai.',
      choices: [
        {
          id: 'hide-condition',
          label: 'Bán như hàng mới',
          description: 'Không nói gì để giữ giá.',
          cashDelta: 100_000,
          trustDelta: -3,
          stockDelta: -4,
          wasteDelta: 0,
          consequence: 'Tiền về nhanh nhưng nếu khách phát hiện, uy tín quầy giảm mạnh.',
        },
        {
          id: 'clear-discount',
          label: 'Nói rõ và giảm giá',
          description: 'Giải thích tình trạng rồi để khách tự quyết.',
          cashDelta: 80_000,
          trustDelta: 2,
          stockDelta: -4,
          wasteDelta: 0,
          consequence: 'Doanh thu thấp hơn chút nhưng khách biết mình đang mua gì.',
        },
        {
          id: 'throw-away',
          label: 'Bỏ hết cho chắc',
          description: 'Không bán nữa dù hàng vẫn còn dùng được.',
          cashDelta: 0,
          trustDelta: 1,
          stockDelta: -4,
          wasteDelta: 4,
          consequence: 'Không có rủi ro với khách nhưng lượng đồ bỏ đi tăng cao.',
        },
      ],
    },
    {
      id: 'busy-hour',
      title: 'Giờ chợ đông',
      story: 'Khách đến cùng lúc và quầy bắt đầu rối.',
      choices: [
        {
          id: 'fast-no-check',
          label: 'Thu tiền thật nhanh',
          description: 'Bỏ qua bước kiểm lại giá để giảm hàng chờ.',
          cashDelta: 140_000,
          trustDelta: -1,
          stockDelta: -5,
          wasteDelta: 0,
          consequence: 'Hàng chờ ngắn hơn nhưng có vài khách phải hỏi lại giá.',
        },
        {
          id: 'clear-line',
          label: 'Giữ thứ tự và báo giá rõ',
          description: 'Chậm hơn một chút nhưng mọi giao dịch đều rõ ràng.',
          cashDelta: 130_000,
          trustDelta: 2,
          stockDelta: -5,
          wasteDelta: 0,
          consequence: 'Quầy chạy ổn định và khách biết chính xác mình trả bao nhiêu.',
        },
        {
          id: 'bundle-deal',
          label: 'Gom thành combo đơn giản',
          description: 'Tạo combo dễ tính để phục vụ nhanh hơn.',
          cashDelta: 135_000,
          trustDelta: 1,
          stockDelta: -5,
          wasteDelta: 0,
          consequence: 'Quầy nhanh hơn mà giá vẫn dễ hiểu.',
        },
      ],
    },
    {
      id: 'closing-market',
      title: 'Chợ sắp tan',
      story: 'Cuối buổi vẫn còn hàng. Em cần quyết định xử lý số còn lại.',
      choices: [
        {
          id: 'deep-discount',
          label: 'Giảm mạnh cuối buổi',
          description: 'Bán nhanh phần còn lại để thu hồi tiền.',
          cashDelta: 90_000,
          trustDelta: 1,
          stockDelta: -4,
          wasteDelta: 0,
          consequence: 'Hàng đi nhanh, đổi lại giá bán cuối buổi khá thấp.',
        },
        {
          id: 'save-for-later',
          label: 'Giữ phần bảo quản được',
          description: 'Chỉ bán lượng hợp lý và cất phần còn giữ được.',
          cashDelta: 65_000,
          trustDelta: 1,
          stockDelta: -2,
          wasteDelta: 0,
          consequence: 'Doanh thu ít hơn nhưng không cần bán tháo mọi thứ.',
        },
        {
          id: 'donate-leftovers',
          label: 'Chia phần phù hợp để tặng',
          description: 'Với phần khó giữ, ưu tiên không để thành rác.',
          cashDelta: 40_000,
          trustDelta: 2,
          stockDelta: -4,
          wasteDelta: 0,
          consequence: 'Tiền về ít hơn nhưng quầy kết thúc ngày với uy tín tốt.',
        },
      ],
    },
  ]

  return {
    seed,
    targetCash,
    startingStock,
    rounds: rounds.map((round) => ({
      ...round,
      choices: shuffle(round.choices, rng),
    })),
  }
}

export function scoreMarketDay(
  run: MarketDayRun,
  cash: number,
  trust: number,
  stock: number,
  waste: number,
) {
  let stars = 1
  if (cash >= run.targetCash) stars += 1
  if (trust >= 4) stars += 1
  if (waste <= 1) stars += 1
  if (stock <= 3) stars += 1
  return Math.min(5, stars)
}
