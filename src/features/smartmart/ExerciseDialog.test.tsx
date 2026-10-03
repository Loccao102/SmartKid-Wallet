// @vitest-environment happy-dom
import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ExerciseDialog } from './ExerciseDialog'
import { getExerciseFamilyById } from '../../data/exerciseFamilies'
import { stalls } from '../../data/stalls'
import { generateExercise } from '../../domain/exerciseEngine'
import { useLearningProfileStore } from '../../store/learningProfile'
import { useProgressionStore } from '../../store/progression'
import { useResearchLogStore } from '../../store/researchLog'

vi.mock('../../lib/audioEngine', () => ({ playGameSfx: vi.fn() }))
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const stall = stalls[0]
const exercise = generateExercise(getExerciseFamilyById(stall.unlockFamilyIds[0]), 'ui-test', 0)
let host: HTMLDivElement
let root: Root
const correct = vi.fn()
const close = vi.fn()

async function mount(mode: 'unlock' | 'practice' = 'unlock') {
  await act(async () => root.render(
    <StrictMode>
      <ExerciseDialog stall={stall} exercise={exercise} mode={mode}
        stepNumber={1} stepTotal={3} isFinalUnlock={false}
        onCorrect={correct} onClose={close} />
    </StrictMode>,
  ))
}
const input = () => host.querySelector<HTMLInputElement>('#exercise-answer')!
const button = (text: string) => {
  const result = [...host.querySelectorAll('button')].find(el => el.textContent?.includes(text))
  expect(result, `Missing button: ${text}`).toBeTruthy()
  return result!
}
async function answer(value: number) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input(), String(value))
    input().dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function click(text: string, twice = false) {
  const target = button(text)
  await act(async () => {
    target.click()
    if (twice) target.click()
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useProgressionStore.getState().resetProgression()
  useLearningProfileStore.getState().resetLearningProfile()
  useResearchLogStore.getState().clearEvents()
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

it('offers the existing free recovery when the wallet cannot cover a retry and keeps keyboard focus usable', async () => {
  useProgressionStore.setState({ coins: 0 })
  await mount()
  expect(document.activeElement).toBe(input())
  await answer(exercise.answer + 1)
  await click('Kiểm tra đáp án')
  expect(input().readOnly).toBe(true)
  expect(document.activeElement).toBe(button('Thử lại miễn phí'))
  await click('Thử lại miễn phí')
  expect(document.activeElement).toBe(input())
  expect(input().readOnly).toBe(false)
  expect(input().value).toBe('')
  expect(useProgressionStore.getState().coins).toBe(0)
  expect(host.textContent).toContain('Lượt hỗ trợ này miễn phí')
  await answer(exercise.answer)
  await click('Kiểm tra đáp án')
  expect(document.activeElement).toBe(button('Bài tiếp theo'))
})

it('records each attempt, charges each retry and advances a completed exercise only once on repeated activation', async () => {
  await mount()
  const startingCoins = useProgressionStore.getState().coins
  await answer(exercise.answer + 1)
  await click('Kiểm tra đáp án', true)
  expect(useResearchLogStore.getState().events).toHaveLength(1)
  await click('Thử lại · 5 xu', true)
  expect(useProgressionStore.getState().coins).toBe(startingCoins - 5)
  await answer(exercise.answer + 1)
  await click('Kiểm tra đáp án')
  await click('Thử lại · 10 xu', true)
  expect(useProgressionStore.getState().coins).toBe(startingCoins - 15)
  await answer(exercise.answer)
  await click('Kiểm tra đáp án', true)
  expect(useResearchLogStore.getState().events).toHaveLength(3)
  await click('Bài tiếp theo', true)
  expect(correct).toHaveBeenCalledTimes(1)
  expect(close).not.toHaveBeenCalled()
  expect(useProgressionStore.getState().totalXp).toBe(5)
})

it('keeps practice retries free and returns to the stall without awarding unlock XP', async () => {
  await mount('practice')
  const startingCoins = useProgressionStore.getState().coins
  await answer(exercise.answer + 1)
  await click('Kiểm tra đáp án')
  await click('Thử lại miễn phí')
  expect(useProgressionStore.getState().coins).toBe(startingCoins)
  await answer(exercise.answer)
  await click('Kiểm tra đáp án')
  await click('Quay lại gian hàng', true)
  expect(correct).toHaveBeenCalledTimes(1)
  expect(close).toHaveBeenCalledTimes(1)
  expect(useProgressionStore.getState().totalXp).toBe(0)
})
