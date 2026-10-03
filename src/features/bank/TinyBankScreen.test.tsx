// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TinyBankScreen } from './TinyBankScreen'
import { useTinyBankProgressStore } from '../../store/tinyBankProgress'
import { useProgressionStore } from '../../store/progression'
import { createTinyBankMission, createTinyBankQuiz, scoreTinyBankMission, tinyBankChapter, type TinyBankLessonId } from '../../data/tinyBank'
import { createChapterRunSeed } from '../../core/worldChapter/runtime'
import { summarizeBankPlan } from '../../domain/tinyBankMission'
import { resolveWorldUnlockState } from '../../core/worldChapter/unlock'
import { worldMaps } from '../../data/worldMaps'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let host: HTMLDivElement
let root: Root
const state = () => useTinyBankProgressStore.getState()
const text = () => host.textContent ?? ''
async function mount() {
  root = createRoot(host)
  await act(async () => root.render(<TinyBankScreen onBack={() => {}} />))
}
async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find(el => el.textContent?.trim() === label)
  expect(button, `Missing button: ${label}`).toBeTruthy()
  expect(button!.disabled).toBe(false)
  await act(async () => button!.click())
}
async function input(value: string) {
  const el = host.querySelector('input')!
  expect(el).toBeTruthy()
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function finishQuiz(id: Exclude<TinyBankLessonId, 'four-week-mission'>) {
  const run = state().savedRunsByLessonId[id]!
  const questions = createTinyBankQuiz(id, run.seed)
  for (const [index, question] of questions.entries()) {
    await input(String(question.answer))
    await click('Kiểm tra')
    await click(index < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả')
  }
  await click('Về sảnh ngân hàng')
}
beforeEach(async () => {
  localStorage.clear()
  useTinyBankProgressStore.getState().resetChapter()
  useProgressionStore.getState().resetProgression()
  host = document.createElement('div')
  document.body.append(host)
  await mount()
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe('Tiny Bank complete student flow', () => {
  it('keeps the level + mission gate and explains locked destinations', async () => {
    const map = worldMaps.find(map => map.id === 'tiny-bank')!
    for (const [level, missions, playable] of [[4, ['mission-class-party-01'], false], [5, [], false], [5, ['mission-class-party-01'], true]] as const) {
      expect(resolveWorldUnlockState(map, { level, completedMissionIds: [...missions], completedWorldChapterIds: [] }).playable).toBe(playable)
    }
    await click('CHẶNG 4 · CHƯA MỞKế hoạch 4 tuần')
    expect(text()).toContain('Hoàn thành 3 chặng Toán')
    expect(text()).not.toContain('Mở sổ kế hoạch')
  })

  it('resumes the same question, draft and mistakes after leaving and remounting', async () => {
    await click('Bắt đầu khám phá')
    const seed = state().savedRunsByLessonId['saving-goal']!.seed
    await input('1')
    await click('Kiểm tra')
    await input('12345')
    await act(async () => root.unmount())
    await mount()
    await click('Tiếp tục chặng này')
    expect(host.querySelector('input')!.value).toBe('12345')
    expect(text()).toContain(createTinyBankQuiz('saving-goal', seed)[0].prompt)
    expect(state().savedRunsByLessonId['saving-goal']!.checkpoint).toMatchObject({ mistakes: 1, index: 0 })
    expect(state().runCountByLessonId['saving-goal']).toBe(1)
    await finishQuiz('saving-goal')
    expect(state().bestStarsByLessonId['saving-goal']).toBe(4)
    expect(state().savedRunsByLessonId['saving-goal']).toBeUndefined()
  })

  it('unlocks all lessons, resumes a reviewed week and awards chapter rewards only once', async () => {
    for (const id of ['saving-goal', 'balance-counter', 'growth-bonus'] as const) {
      await click('Bắt đầu khám phá')
      await finishQuiz(id)
    }
    expect(state().completedLessonIds).toHaveLength(3)
    await click('Mở sổ kế hoạch')
    await click('Chia cân bằngĐể dành khoảng 60%, phần còn lại dùng cho nhu cầu nhỏ.')
    expect(document.activeElement?.textContent).toBe('Chia cân bằng')
    const checkpoint = state().savedRunsByLessonId['four-week-mission']!.checkpoint
    await click('Về sảnh ngân hàng')
    await click('Tiếp tục chặng này')
    expect(state().savedRunsByLessonId['four-week-mission']!.checkpoint).toEqual(checkpoint)
    expect(text()).toContain('Sổ theo dõi · 1 tuần đã chọn')
    await click('Sang tuần tiếp')
    expect(document.activeElement?.tagName).toBe('H2')
    expect(document.activeElement?.textContent).toContain('30.000đ')
    await click('Dùng tiền tuần nàyTrả 30.000đ từ tiền vừa nhận, không đụng quỹ dự phòng.')
    await click('Sang tuần tiếp')
    await click('Bỏ qua khuyến mãiGửi gần như toàn bộ tiền tuần này vào mục tiêu.')
    await click('Sang tuần tiếp')
    await click('Nước rút cho mục tiêuGiữ 5.000đ, gửi phần còn lại.')
    await click('Xem kết quả')
    expect(text()).toContain('Kế hoạch của em đã hoàn thành!')
    expect(document.activeElement?.id).toBe('bank-plan-title')
    expect(state().completedLessonIds).toHaveLength(4)
    expect(useProgressionStore.getState().completedWorldChapterIds).toContain('tiny-bank')
    expect(state().savedRunsByLessonId['four-week-mission']).toBeUndefined()
    const { totalXp, coins } = useProgressionStore.getState()
    await click('Về sảnh ngân hàng')
    await click('Luyện lại')
    await finishQuiz('saving-goal')
    expect(useProgressionStore.getState().totalXp).toBe(totalXp)
    expect(useProgressionStore.getState().coins).toBe(coins)
    expect(state().runCountByLessonId['saving-goal']).toBe(2)
  })

  it('keeps an unsuccessful plan replayable without completing the chapter', async () => {
    // Use an issued variant where this spending-heavy plan falls below 3 stars.
    const choiceIds = ['spend-more', 'use-reserve', 'buy-sale', 'finish-light']
    const failedSeed = Array.from({ length: 100 }, (_, i) => createChapterRunSeed(tinyBankChapter, 'four-week-mission', i + 1)).find(seed => {
      const run = createTinyBankMission(seed)
      const { savings, reserve, joy } = summarizeBankPlan(run, { choiceIds, reviewing: true })
      return scoreTinyBankMission(run, savings, reserve, joy) < 3
    })
    expect(failedSeed).toBeDefined()
    await act(async () => {
      for (const id of ['saving-goal', 'balance-counter', 'growth-bonus'] as const) state().completeLesson(id, 5)
      state().nextRun('four-week-mission')
      state().saveRun('four-week-mission', failedSeed!, null)
    })
    await click('Tiếp tục chặng này')
    await click('Tiêu thoải mái hơnChỉ gửi 25.000đ vào mục tiêu.')
    await click('Sang tuần tiếp')
    await click('Dùng quỹ dự phòngLấy 30.000đ từ quỹ dự phòng để giữ khoản gửi lớn hơn.')
    await click('Sang tuần tiếp')
    await click('Mua món đang giảmChi 35.000đ rồi gửi phần còn lại.')
    await click('Sang tuần tiếp')
    await click('Thư giãn tuần cuốiChỉ gửi 20.000đ vào mục tiêu.')
    await click('Xem kết quả')
    expect(text()).toContain('Cùng thử một kế hoạch khác nhé')
    expect(state().completedLessonIds).not.toContain('four-week-mission')
    expect(useProgressionStore.getState().completedWorldChapterIds).not.toContain('tiny-bank')
    expect(useProgressionStore.getState().totalXp).toBe(0)
    await click('Về sảnh ngân hàng')
    await click('Mở sổ kế hoạch')
    expect(text()).toContain('Tuần 1/4')
    expect(state().runCountByLessonId['four-week-mission']).toBe(2)
  })
})
