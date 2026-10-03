// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { WorldMapScreen } from './WorldMapScreen'
import { useProgressionStore } from '../../store/progression'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

it('features the next bank chapter only after both requirements and keeps SmartMart reachable', async () => {
  useProgressionStore.getState().resetProgression()
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const open = vi.fn()
  try {
    await act(async () => root.render(<WorldMapScreen onOpenMap={open} onEditAvatar={() => {}} />))
    const featuredButton = () => host.querySelector<HTMLButtonElement>('.chapter-start')!
    expect(featuredButton().textContent).toContain('Bắt đầu khám phá')
    await act(async () => useProgressionStore.setState({ level: 5 }))
    expect(featuredButton().textContent).toContain('Bắt đầu khám phá')
    await act(async () => useProgressionStore.getState().completeMission('mission-class-party-01'))
    expect(featuredButton().textContent).toContain('Đến Ngân hàng tí hon')
    await act(async () => featuredButton().click())
    expect(open).toHaveBeenLastCalledWith('tiny-bank')
    const smartMart = host.querySelector<HTMLButtonElement>('[aria-label="Khám phá SmartMart"]')!
    expect(smartMart).toBeTruthy()
    await act(async () => smartMart.click())
    expect(open).toHaveBeenLastCalledWith('smartmart')
  } finally {
    await act(async () => root.unmount())
    host.remove()
    useProgressionStore.getState().resetProgression()
  }
})
