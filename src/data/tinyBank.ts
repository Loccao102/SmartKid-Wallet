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

export type TinyBankLessonId =
  | 'saving-goal'
  | 'balance-counter'
  | 'growth-bonus'
  | 'four-week-mission'

export interface TinyBankLessonDefinition
  extends WorldChapterLessonDefinition<TinyBankLessonId> {}

/** Given values for illustrations; no extra RNG or persisted quiz state. */
export type TinyBankQuestionVisual =
  | { kind: 'saving-gap'; goal: number; current: number }
  | { kind: 'saving-weekly'; remaining: number; weeks: number }
  | { kind: 'balance'; start: number; deposit: number; withdraw: number }
  | { kind: 'growth'; amount: number; rate: number }

export interface TinyBankQuestion extends WorldChapterQuestion {
  visual: TinyBankQuestionVisual
}

export interface TinyBankMissionChoice {
  id: string
  label: string
  description: string
  savingsDelta: number
  reserveDelta: number
  joyDelta: number
  consequence: string
}

export interface TinyBankMissionRound {
  id: string
  title: string
  story: string
  income: number
  choices: TinyBankMissionChoice[]
}

export interface TinyBankMissionRun {
  seed: number
  goal: number
  startingSavings: number
  startingReserve: number
  rounds: TinyBankMissionRound[]
}

export const tinyBankLessons: TinyBankLessonDefinition[] = [
  {
    id: 'saving-goal',
    title: 'Hũ tiết kiệm mục tiêu',
    subtitle: 'Chia mục tiêu thành từng bước nhỏ',
    description:
      'Tính số tiền còn thiếu và số tiền nên để dành mỗi tuần để chạm mục tiêu.',
    skillLabel: 'Trừ · Chia đều · Lập kế hoạch',
    xpReward: 35,
  },
  {
    id: 'balance-counter',
    title: 'Quầy gửi · rút tiền',
    subtitle: 'Theo dõi số dư thật chính xác',
    description:
      'Tiền vào, tiền ra liên tục. Em cần tính số dư sau từng giao dịch.',
    skillLabel: 'Cộng · Trừ · Nhiều bước',
    xpReward: 40,
  },
  {
    id: 'growth-bonus',
    title: 'Tiền lớn lên thế nào?',
    subtitle: 'Làm quen với phần trăm',
    description:
      'Mô phỏng khoản thưởng theo tỉ lệ để hiểu 5%, 10% hay 20% nghĩa là bao nhiêu.',
    skillLabel: 'Phần trăm · So sánh',
    xpReward: 45,
  },
  {
    id: 'four-week-mission',
    title: 'Mission 4 tuần',
    subtitle: 'Tiết kiệm mà vẫn sống cân bằng',
    description:
      'Trong 4 tuần, em phải tiến gần mục tiêu, giữ quỹ dự phòng và xử lý vài lựa chọn bất ngờ.',
    skillLabel: 'Quyết định · Ưu tiên · Trách nhiệm',
    xpReward: 100,
  },
]

export const tinyBankChapter: WorldChapterDefinition<TinyBankLessonId> = {
  mapId: 'tiny-bank',
  version: 1,
  lessonOrder: ['saving-goal', 'balance-counter', 'growth-bonus', 'four-week-mission'],
  finalLessonId: 'four-week-mission',
  finalMinStars: 3,
  seedBase: 20260930,
  chapterXpReward: 80,
  chapterCoinReward: 80,
}

export function createTinyBankQuiz(
  lessonId: Exclude<TinyBankLessonId, 'four-week-mission'>,
  seed: number,
): TinyBankQuestion[] {
  const rng = createSeededRng(seed)

  if (lessonId === 'saving-goal') {
    return Array.from({ length: 3 }, (_, index) => {
      const weeks = pickSeededInt(rng, 4, 8)
      const weekly = pickSeededInt(rng, 20_000, 50_000, 5_000)
      const current = pickSeededInt(rng, 50_000, 150_000, 10_000)
      const remaining = weeks * weekly
      const goal = current + remaining
      return {
        id: `saving-goal-${seed}-${index}`,
        visual: index % 2 === 0
          ? { kind: 'saving-gap', goal, current }
          : { kind: 'saving-weekly', remaining, weeks },
        prompt:
          index % 2 === 0
            ? `Em muốn có ${goal.toLocaleString('vi-VN')}đ. Hiện đã có ${current.toLocaleString('vi-VN')}đ. Em còn thiếu bao nhiêu?`
            : `Còn thiếu ${remaining.toLocaleString('vi-VN')}đ và có ${weeks} tuần. Nếu chia đều, mỗi tuần em cần để dành bao nhiêu?`,
        answer: index % 2 === 0 ? remaining : weekly,
        unit: 'đ',
        hint:
          index % 2 === 0
            ? 'Lấy mục tiêu trừ số tiền đang có.'
            : 'Lấy số tiền còn thiếu chia cho số tuần.',
      }
    })
  }

  if (lessonId === 'balance-counter') {
    return Array.from({ length: 3 }, (_, index) => {
      const start = pickSeededInt(rng, 80_000, 200_000, 10_000)
      const deposit = pickSeededInt(rng, 30_000, 90_000, 10_000)
      const withdraw = pickSeededInt(rng, 10_000, 50_000, 5_000)
      return {
        id: `balance-${seed}-${index}`,
        visual: { kind: 'balance', start, deposit, withdraw: index === 0 ? 0 : withdraw },
        prompt:
          index === 0
            ? `Tài khoản có ${start.toLocaleString('vi-VN')}đ. Em gửi thêm ${deposit.toLocaleString('vi-VN')}đ. Số dư mới là bao nhiêu?`
            : `Tài khoản có ${start.toLocaleString('vi-VN')}đ, gửi thêm ${deposit.toLocaleString('vi-VN')}đ rồi rút ${withdraw.toLocaleString('vi-VN')}đ. Còn lại bao nhiêu?`,
        answer: index === 0 ? start + deposit : start + deposit - withdraw,
        unit: 'đ',
        hint:
          index === 0
            ? 'Tiền gửi vào thì cộng vào số dư.'
            : 'Cộng tiền gửi trước, rồi trừ số tiền rút.',
      }
    })
  }

  const rates = [5, 10, 20]
  return Array.from({ length: 3 }, (_, index) => {
    const rate = rates[index]
    const amount = pickSeededInt(rng, 100_000, 400_000, 20_000)
    const bonus = Math.round((amount * rate) / 100)
    return {
      id: `bonus-${seed}-${index}`,
      visual: { kind: 'growth', amount, rate },
      prompt: `Trong mô phỏng, khoản ${amount.toLocaleString('vi-VN')}đ được cộng thêm ${rate}%. Phần được cộng thêm là bao nhiêu?`,
      answer: bonus,
      unit: 'đ',
      hint:
        rate === 10
          ? '10% là một phần mười.'
          : rate === 20
            ? '20% bằng hai lần 10%.'
            : '5% bằng một nửa của 10%.',
    }
  })
}

export function createTinyBankMission(seed: number): TinyBankMissionRun {
  const rng = createSeededRng(seed)
  const start = pickSeededInt(rng, 90_000, 120_000, 10_000)
  const reserve = 30_000
  const weeklyIncome = Array.from({ length: 4 }, () =>
    pickSeededInt(rng, 55_000, 75_000, 5_000),
  )
  const goal =
    start +
    weeklyIncome.reduce((sum, value) => sum + Math.round(value * 0.58), 0) -
    10_000

  const rounds: TinyBankMissionRound[] = [
    {
      id: 'week-1',
      title: 'Tuần 1 · Bắt đầu thật dễ',
      story: `Em có thêm ${weeklyIncome[0].toLocaleString('vi-VN')}đ. Không có chi phí bắt buộc tuần này.`,
      income: weeklyIncome[0],
      choices: [
        {
          id: 'save-heavy',
          label: 'Ưu tiên mục tiêu',
          description: 'Giữ lại 10.000đ để tiêu, phần còn lại cho vào mục tiêu.',
          savingsDelta: weeklyIncome[0] - 10_000,
          reserveDelta: 0,
          joyDelta: 0,
          consequence: 'Mục tiêu tiến rất nhanh, nhưng tuần này em chi tiêu khá ít.',
        },
        {
          id: 'balanced',
          label: 'Chia cân bằng',
          description: 'Để dành khoảng 60%, phần còn lại dùng cho nhu cầu nhỏ.',
          savingsDelta: Math.round(weeklyIncome[0] * 0.6 / 5_000) * 5_000,
          reserveDelta: 0,
          joyDelta: 1,
          consequence: 'Em vẫn tiến gần mục tiêu mà còn một khoản để dùng trong tuần.',
        },
        {
          id: 'spend-more',
          label: 'Tiêu thoải mái hơn',
          description: 'Chỉ gửi 25.000đ vào mục tiêu.',
          savingsDelta: 25_000,
          reserveDelta: 0,
          joyDelta: 2,
          consequence: 'Tuần này khá thoải mái, nhưng mục tiêu tiến chậm hơn.',
        },
      ],
    },
    {
      id: 'week-2',
      title: 'Tuần 2 · Có việc bất ngờ',
      story: `Em nhận ${weeklyIncome[1].toLocaleString('vi-VN')}đ nhưng cần mua một cuốn vở và đồ dùng hết 30.000đ.`,
      income: weeklyIncome[1],
      choices: [
        {
          id: 'weekly-money',
          label: 'Dùng tiền tuần này',
          description: 'Trả 30.000đ từ tiền vừa nhận, không đụng quỹ dự phòng.',
          savingsDelta: Math.max(0, weeklyIncome[1] - 40_000),
          reserveDelta: 0,
          joyDelta: 1,
          consequence: 'Quỹ dự phòng vẫn nguyên vẹn, nhưng khoản gửi tuần này ít hơn.',
        },
        {
          id: 'use-reserve',
          label: 'Dùng quỹ dự phòng',
          description: 'Lấy 30.000đ từ quỹ dự phòng để giữ khoản gửi lớn hơn.',
          savingsDelta: Math.max(0, weeklyIncome[1] - 10_000),
          reserveDelta: -30_000,
          joyDelta: 0,
          consequence: 'Mục tiêu tăng nhanh, đổi lại quỹ dự phòng đã cạn.',
        },
        {
          id: 'split-cost',
          label: 'Chia đôi nguồn tiền',
          description: 'Dùng 15.000đ tiền tuần này và 15.000đ quỹ dự phòng.',
          savingsDelta: Math.max(0, weeklyIncome[1] - 25_000),
          reserveDelta: -15_000,
          joyDelta: 1,
          consequence: 'Em chia áp lực ra hai nơi, cả mục tiêu và quỹ dự phòng đều còn.',
        },
      ],
    },
    {
      id: 'week-3',
      title: 'Tuần 3 · Món đồ đang giảm giá',
      story: `Em có thêm ${weeklyIncome[2].toLocaleString('vi-VN')}đ. Một món đồ em thích đang giảm còn 35.000đ.`,
      income: weeklyIncome[2],
      choices: [
        {
          id: 'skip-sale',
          label: 'Bỏ qua khuyến mãi',
          description: 'Gửi gần như toàn bộ tiền tuần này vào mục tiêu.',
          savingsDelta: weeklyIncome[2] - 5_000,
          reserveDelta: 0,
          joyDelta: 0,
          consequence: 'Em không mua chỉ vì giảm giá và mục tiêu tiến thêm một bước lớn.',
        },
        {
          id: 'small-treat',
          label: 'Chọn niềm vui nhỏ',
          description: 'Dành 20.000đ cho bản thân, phần còn lại để dành.',
          savingsDelta: Math.max(0, weeklyIncome[2] - 20_000),
          reserveDelta: 0,
          joyDelta: 1,
          consequence: 'Em vẫn tiết kiệm nhưng không bỏ hết những niềm vui nhỏ.',
        },
        {
          id: 'buy-sale',
          label: 'Mua món đang giảm',
          description: 'Chi 35.000đ rồi gửi phần còn lại.',
          savingsDelta: Math.max(0, weeklyIncome[2] - 35_000),
          reserveDelta: 0,
          joyDelta: 2,
          consequence: 'Em có món đồ mình thích, nhưng khoảng cách tới mục tiêu còn xa hơn.',
        },
      ],
    },
    {
      id: 'week-4',
      title: 'Tuần 4 · Nước rút',
      story: `Tuần cuối em nhận ${weeklyIncome[3].toLocaleString('vi-VN')}đ. Đây là cơ hội cuối để chạm mục tiêu.`,
      income: weeklyIncome[3],
      choices: [
        {
          id: 'finish-strong',
          label: 'Nước rút cho mục tiêu',
          description: 'Giữ 5.000đ, gửi phần còn lại.',
          savingsDelta: weeklyIncome[3] - 5_000,
          reserveDelta: 0,
          joyDelta: 0,
          consequence: 'Em kết thúc tháng với một cú nước rút rất mạnh.',
        },
        {
          id: 'finish-balanced',
          label: 'Vẫn giữ cân bằng',
          description: 'Gửi khoảng 60%, phần còn lại để dùng.',
          savingsDelta: Math.round(weeklyIncome[3] * 0.6 / 5_000) * 5_000,
          reserveDelta: 0,
          joyDelta: 1,
          consequence: 'Em giữ được nhịp đều đến tuần cuối.',
        },
        {
          id: 'finish-light',
          label: 'Thư giãn tuần cuối',
          description: 'Chỉ gửi 20.000đ vào mục tiêu.',
          savingsDelta: 20_000,
          reserveDelta: 0,
          joyDelta: 2,
          consequence: 'Tuần cuối nhẹ nhàng hơn, nhưng mục tiêu có thể chưa đủ.',
        },
      ],
    },
  ]

  return {
    seed,
    goal,
    startingSavings: start,
    startingReserve: reserve,
    rounds: rounds.map((round) => ({
      ...round,
      choices: seededShuffle(round.choices, rng),
    })),
  }
}

export function scoreTinyBankMission(
  mission: TinyBankMissionRun,
  savings: number,
  reserve: number,
  joy: number,
) {
  let stars = 1
  if (savings >= mission.goal) stars += 2
  else if (savings >= mission.goal * 0.9) stars += 1
  if (reserve >= 15_000) stars += 1
  if (joy >= 2) stars += 1
  return Math.min(5, stars)
}
