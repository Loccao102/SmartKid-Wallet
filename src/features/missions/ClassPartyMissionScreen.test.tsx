// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { missions, firstMission } from '../../data/missions'
import { stalls } from '../../data/stalls'
import { useMissionCartStore } from '../../store/missionCart'
import { useProgressionStore } from '../../store/progression'
import { ClassPartyMissionScreen } from './ClassPartyMissionScreen'

vi.mock('../../lib/audioEngine', () => ({ playGameSfx: vi.fn() }))
vi.mock('../../lib/activityRemote', () => ({
  submitStudentActivity: vi.fn().mockResolvedValue({ status: 'skipped' }),
}))

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let host: HTMLDivElement
let root: Root

async function mount(missionId = firstMission.id, initialStall?: 'supplies') {
  await act(async () => root.render(
    <ClassPartyMissionScreen
      missionId={missionId}
      initialStall={initialStall}
      onBack={() => {}}
      onWork={() => {}}
    />,
  ))
}

async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find(
    element => element.textContent?.trim() === label,
  )
  expect(button, `Missing button: ${label}`).toBeTruthy()
  expect(button!.disabled).toBe(false)
  await act(async () => {
    button!.focus()
    button!.click()
  })
}

beforeEach(() => {
  localStorage.clear()
  useProgressionStore.getState().resetProgression()
  useProgressionStore.setState({
    level: 10,
    unlockedStalls: stalls.map(stall => stall.id),
  })
  useMissionCartStore.setState({ carts: {}, revealedEventIdsByMission: {} })
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe('shopping mission identity and focus', () => {
  it('shows the selected mission instead of labeling every mission as the class party', async () => {
    useProgressionStore.setState({
      completedMissionIds: missions.map(mission => mission.id),
    })
    for (const mission of missions) {
      await mount(mission.id)
      expect(host.querySelector('h1')?.textContent).toBe(mission.title)
      expect(document.activeElement).toBe(host.querySelector('h1'))
      expect(host.textContent).toContain(mission.story)
      expect(host.textContent).not.toContain('NHIỆM VỤ 01')
      expect(host.textContent).not.toContain('Chọn món trên kệ để chuẩn bị liên hoan.')
    }
  })

  it('describes supplies as required when the selected mission needs them', async () => {
    const mission = missions.find(item => item.id === 'mission-smart-basket-01')!
    useProgressionStore.setState({ completedMissionIds: [mission.prerequisiteMissionId!] })
    await mount(mission.id, 'supplies')
    expect(host.querySelector('.shelf-heading')?.textContent).toContain(
      `Chọn đủ phần cho ${mission.people} người.`,
    )
    expect(host.querySelector('.shelf-heading')?.textContent).not.toContain('chọn thêm')
  })

  it.each(['desktop basket', 'basket dialog'] as const)(
    'focuses completion and replay headings after checkout from the %s',
    async surface => {
      useMissionCartStore.setState({
        carts: {
          [firstMission.id]: [
            { productId: 'produce-banana-bunch', quantity: 6 },
            { productId: 'food-bread-basket', quantity: 5 },
            { productId: 'drinks-water-pack', quantity: 4 },
          ],
        },
      })
      await mount()
      if (surface === 'basket dialog') {
        await click('Xem giỏ hàng')
        expect(host.querySelector('dialog')?.open).toBe(true)
      }
      await click('Thanh toán & kiểm tra')
      const resultHeading = host.querySelector('.mission-result h1')
      expect(resultHeading).toBeTruthy()
      expect(document.activeElement).toBe(resultHeading)
      expect(host.querySelector('dialog')).toBeNull()
      expect(useProgressionStore.getState().completedMissionIds).toContain(firstMission.id)

      await click('Chơi lại để nâng sao')
      expect(document.activeElement).toBe(host.querySelector('.party-brief h1'))
      expect(document.activeElement?.textContent).toBe(firstMission.title)
    },
  )
})
