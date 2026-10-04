// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTinyBankMission, scoreTinyBankMission } from '../../data/tinyBank'
import { summarizeBankPlan, type BankPlanProgress } from '../../domain/tinyBankMission'
import { BankMission } from './BankMission'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
const run = createTinyBankMission(42)
let host: HTMLDivElement
let root: Root
const onCheckpoint = vi.fn<(value: BankPlanProgress) => void>()
const onExit = vi.fn()
const onFinish = vi.fn()

async function mount(checkpoint: unknown = null) {
  root = createRoot(host)
  await act(async () => root.render(<BankMission run={run} checkpoint={checkpoint}
    onCheckpoint={onCheckpoint} onExit={onExit} onFinish={onFinish} />))
}
function button(label: string) {
  const result = [...host.querySelectorAll('button')].find(el =>
    (el.getAttribute('aria-label') ?? el.textContent?.trim()) === label,
  )
  expect(result, `Missing button: ${label}`).toBeTruthy()
  return result!
}
async function click(label: string, twice = false) {
  const target = button(label)
  expect(target.disabled).toBe(false)
  await act(async () => {
    target.focus()
    target.click()
    if (twice) target.click()
  })
}
function recordedSavings() {
  return Number(host.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow'))
}

beforeEach(async () => {
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
  await mount()
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe('Tiny Bank planning desk', () => {
  it('previews changed choices without recording money, then confirms only once', async () => {
    const [first, second] = run.rounds[0].choices
    expect(button('Xác nhận kế hoạch').disabled).toBe(true)
    await click(first.label)
    await click(second.label)
    expect(button(first.label).getAttribute('aria-pressed')).toBe('false')
    expect(button(second.label).getAttribute('aria-pressed')).toBe('true')
    expect(recordedSavings()).toBe(run.startingSavings)
    expect(host.textContent).toContain('Chưa xác nhận lựa chọn')
    expect(host.textContent).toContain('0 tuần đã chọn')
    expect(onCheckpoint).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()

    await click('Xác nhận kế hoạch', true)
    expect(onCheckpoint).toHaveBeenCalledTimes(1)
    expect(onCheckpoint).toHaveBeenLastCalledWith({ choiceIds: [second.id], reviewing: true })
    expect(recordedSavings()).toBe(run.startingSavings + second.savingsDelta)
    expect(document.activeElement?.textContent).toBe(second.label)
    expect(host.textContent).toContain('1 tuần đã chọn')
    expect(host.querySelector('.bank-plan-options')).toBeNull()

    const saved = onCheckpoint.mock.calls[0][0]
    await click('Về sảnh ngân hàng')
    expect(onExit).toHaveBeenCalledTimes(1)
    await act(async () => root.unmount())
    await mount(saved)
    expect(recordedSavings()).toBe(run.startingSavings + second.savingsDelta)
    expect(document.activeElement?.textContent).toBe(second.label)
    await click('Sang tuần tiếp', true)
    expect(onCheckpoint).toHaveBeenCalledTimes(2)
    expect(onCheckpoint).toHaveBeenLastCalledWith({ choiceIds: [second.id], reviewing: false })
    expect(button('Xác nhận kế hoạch').disabled).toBe(true)
    expect(document.activeElement?.textContent).toBe(run.rounds[1].story)
  })

  it('discards an unconfirmed selection when leaving and resuming', async () => {
    await click(run.rounds[0].choices[0].label)
    await click('Về sảnh ngân hàng')
    await act(async () => root.unmount())
    await mount()
    expect(onCheckpoint).not.toHaveBeenCalled()
    expect(recordedSavings()).toBe(run.startingSavings)
    expect(host.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(0)
    expect(button('Xác nhận kế hoạch').disabled).toBe(true)
  })

  it('reveals the unchanged score only at the end and finishes once on repeated clicks', async () => {
    const ids: string[] = []
    for (const [index, round] of run.rounds.entries()) {
      const choice = round.choices[0]
      ids.push(choice.id)
      await click(choice.label)
      await click('Xác nhận kế hoạch', true)
      expect(onFinish).not.toHaveBeenCalled()
      expect(host.querySelector('.chapter-stars')).toBeNull()
      await click(index < run.rounds.length - 1 ? 'Sang tuần tiếp' : 'Xem kết quả', true)
    }
    const { savings, reserve, joy } = summarizeBankPlan(run, { choiceIds: ids, reviewing: true })
    expect(onCheckpoint).toHaveBeenCalledTimes(7)
    expect(onFinish).toHaveBeenCalledExactlyOnceWith(scoreTinyBankMission(run, savings, reserve, joy))
    expect(recordedSavings()).toBe(Math.min(savings, run.goal))
    expect(document.activeElement?.id).toBe('bank-plan-title')
    expect(host.querySelector('details')!.open).toBe(true)
    expect(host.querySelectorAll('.bank-passbook li')).toHaveLength(4)
  })
})
