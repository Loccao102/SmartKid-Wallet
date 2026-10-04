// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CircleDollarSign } from 'lucide-react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WorldChapterQuiz, type WorldChapterQuizSceneState, type WorldChapterQuizTheme } from './WorldChapterQuiz'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
const questions = [
  { id: 'one', prompt: 'Câu thứ nhất', answer: 20, unit: 'đ', hint: 'Gợi ý một' },
  { id: 'two', prompt: 'Câu thứ hai', answer: 30, unit: 'đ', hint: 'Gợi ý hai' },
]
const copy = {
  exitLabel: 'Về sảnh', counterLabel: 'Câu', inputLabel: 'Số tiền', inputPlaceholder: 'Nhập số',
  idleTip: 'Cùng tính nhé', correctFeedback: 'Chính xác', completeEyebrow: 'Hoàn thành',
  completeDescription: 'Đã xong bài luyện', backLabel: 'Quay lại',
}
let host: HTMLDivElement
let root: Root
let latestScene: WorldChapterQuizSceneState | undefined
const onComplete = vi.fn()
const onCheckpoint = vi.fn()

async function mount(theme: WorldChapterQuizTheme, withScene = false, checkpoint?: unknown) {
  await act(async () => root.render(<WorldChapterQuiz theme={theme} lessonTitle="Bài luyện"
    skillLabel="Tính toán" questions={questions} icon={CircleDollarSign} copy={copy}
    onExit={() => {}} onComplete={onComplete} checkpoint={checkpoint} onCheckpoint={onCheckpoint}
    renderScene={withScene ? state => { latestScene = state; return <aside aria-label="Cảnh minh họa" /> } : undefined} />))
}
async function input(value: string) {
  const el = host.querySelector('input')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function click(label: string, twice = false) {
  const target = [...host.querySelectorAll('button')].find(el => el.textContent?.trim() === label)!
  expect(target, `Missing ${label}`).toBeTruthy()
  expect(target.disabled).toBe(false)
  await act(async () => { target.click(); if (twice) target.click() })
}
beforeEach(() => {
  vi.clearAllMocks()
  latestScene = undefined
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe('shared chapter quiz with optional illustrations', () => {
  it.each(['bank', 'restaurant', 'market'] as const)('preserves %s quiz scoring and focus without a scene', async theme => {
    await mount(theme)
    expect(host.querySelector('.chapter-quiz-play')).toBeNull()
    expect(document.activeElement).toBe(host.querySelector('input'))
    await input('1')
    await click('Kiểm tra')
    expect(host.textContent).toContain('Gợi ý một')
    await input('20')
    await act(async () => host.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })))
    expect(host.textContent).toContain('Chính xác')
    expect(onComplete).not.toHaveBeenCalled()
    await click('Câu tiếp theo')
    expect(document.activeElement).toBe(host.querySelector('input'))
    await input('30')
    await click('Kiểm tra')
    await click('Xem kết quả', true)
    expect(onComplete).toHaveBeenCalledExactlyOnceWith(4)
    expect(host.querySelector('.chapter-stars')?.getAttribute('aria-label')).toBe('4 trên 5 sao')
    expect(document.activeElement?.tagName).toBe('H2')
  })

  it('restores a solved scene quietly and keeps animation state out of checkpoints', async () => {
    await mount('bank', true, { index: 0, answer: '20', mistakes: 1, feedback: 'correct' })
    expect(latestScene).toMatchObject({ questionId: 'one', completedCount: 1, isCorrect: true, celebrate: false, finished: false })
    expect(host.querySelector('.chapter-stars')).toBeNull()
    expect(onCheckpoint).not.toHaveBeenCalled()
    await click('Câu tiếp theo')
    expect(latestScene).toMatchObject({ questionId: 'two', completedCount: 1, isCorrect: false, celebrate: false })
    await input('30')
    await click('Kiểm tra')
    expect(latestScene).toMatchObject({ questionId: 'two', completedCount: 2, isCorrect: true, celebrate: true })
    expect(onCheckpoint).toHaveBeenLastCalledWith({ index: 1, answer: '30', mistakes: 1, feedback: 'correct' })
    await click('Xem kết quả')
    expect(latestScene).toMatchObject({ completedCount: 2, totalQuestions: 2, finished: true, celebrate: false })
    expect(onComplete).toHaveBeenCalledExactlyOnceWith(4)
    expect(document.activeElement?.tagName).toBe('H2')
  })
})
