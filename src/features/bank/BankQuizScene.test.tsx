// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { TinyBankQuestion } from '../../data/tinyBank'
import type { WorldChapterQuizSceneState } from '../world/WorldChapterQuiz'
import { BankQuizScene } from './BankQuizScene'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let host: HTMLDivElement
let root: Root

const fixtures: { title: string; question: TinyBankQuestion; hiddenValues: number[] }[] = [
  {
    title: 'Hũ mục tiêu',
    question: {
      id: 'gap', prompt: 'Tính khoản còn thiếu.', answer: 336_000, unit: 'đ', hint: 'Trừ số đã có.',
      visual: { kind: 'saving-gap', goal: 467_000, current: 131_000 },
    },
    hiddenValues: [336_000],
  },
  {
    title: 'Hũ mục tiêu',
    question: {
      id: 'weekly', prompt: 'Tính khoản để dành mỗi tuần.', answer: 42_000, unit: 'đ', hint: 'Chia đều.',
      visual: { kind: 'saving-weekly', remaining: 294_000, weeks: 7 },
    },
    hiddenValues: [42_000],
  },
  {
    title: 'Quầy gửi · rút',
    question: {
      id: 'balance', prompt: 'Tính số dư sau gửi và rút.', answer: 210_000, unit: 'đ', hint: 'Cộng rồi trừ.',
      visual: { kind: 'balance', start: 173_000, deposit: 58_000, withdraw: 21_000 },
    },
    hiddenValues: [231_000, 210_000],
  },
  {
    title: 'Vườn phần trăm',
    question: {
      id: 'growth', prompt: 'Tính phần được cộng thêm.', answer: 13_000, unit: 'đ', hint: 'Tính 5%.',
      visual: { kind: 'growth', amount: 260_000, rate: 5 },
    },
    hiddenValues: [13_000, 273_000],
  },
]

async function render(question: TinyBankQuestion, patch: Partial<WorldChapterQuizSceneState> = {}) {
  const state: WorldChapterQuizSceneState = {
    questionIndex: 0, questionId: question.id, completedCount: 0, totalQuestions: 3,
    isCorrect: false, finished: false, celebrate: false, ...patch,
  }
  await act(async () => root.render(<BankQuizScene question={question} state={state} />))
}

beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe('Tiny Bank question scenes', () => {
  it.each(fixtures)('keeps $question.visual.kind answers and intermediate amounts hidden before a correct answer', async ({ question, title, hiddenValues }) => {
    await render(question)
    const scene = host.querySelector('figure')!
    expect(scene.getAttribute('aria-label')).toBe(title)
    expect(scene.getAttribute('data-kind')).toBe(question.visual.kind)
    expect(host.querySelector('.bank-scene-result')).toBeNull()
    expect(scene.classList.contains('bank-quiz-scene--revealed')).toBe(false)
    for (const value of hiddenValues) {
      // Include hidden attributes: concealing a calculated answer with CSS is insufficient.
      expect(host.innerHTML).not.toContain(value.toLocaleString('vi-VN'))
      expect(host.innerHTML).not.toContain(String(value))
    }
    expect(host.querySelector('.chapter-stars')).toBeNull()
  })

  it.each(fixtures)('reveals $question.visual.kind after success and restores it without replaying celebration', async ({ question }) => {
    await render(question, { completedCount: 1, isCorrect: true, celebrate: true })
    expect(host.querySelector('.bank-scene-result')?.textContent).toContain(question.answer.toLocaleString('vi-VN') + 'đ')
    expect(host.querySelector('figure')?.classList.contains('bank-quiz-scene--celebrate')).toBe(true)
    const result = host.querySelector('.bank-scene-result')!.textContent

    await act(async () => root.unmount())
    root = createRoot(host)
    await render(question, { completedCount: 1, isCorrect: true, celebrate: false })
    expect(host.querySelector('.bank-scene-result')?.textContent).toBe(result)
    expect(host.querySelector('figure')?.classList.contains('bank-quiz-scene--revealed')).toBe(true)
    expect(host.querySelector('figure')?.classList.contains('bank-quiz-scene--celebrate')).toBe(false)
    expect(host.querySelector('.chapter-stars')).toBeNull()
  })

  it('grows the garden with solved questions rather than the current question number', async () => {
    const question = fixtures[3].question
    await render(question, { questionIndex: 1, completedCount: 1 })
    expect(host.querySelector('[data-completed-count]')?.getAttribute('data-completed-count')).toBe('1')
    expect(host.querySelector('.bank-scene-result')).toBeNull()

    await render(question, { questionIndex: 1, completedCount: 2, isCorrect: true, celebrate: true })
    expect(host.querySelector('[data-completed-count]')?.getAttribute('data-completed-count')).toBe('2')
    await render(question, { questionIndex: 2, completedCount: 2 })
    expect(host.querySelector('[data-completed-count]')?.getAttribute('data-completed-count')).toBe('2')
    expect(host.querySelector('.bank-scene-result')).toBeNull()
  })
})
