import { useEffect, useRef } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleDot,
} from 'lucide-react'
import Phaser from 'phaser'
import type { StallId } from '../domain/types'
import { SmartMartScene } from './SmartMartScene'

interface SmartMartGameProps {
  unlockedStalls: StallId[]
  paused?: boolean
  onInteractStall: (stallId: StallId) => void
  onNearStallChange?: (stallId: StallId | null) => void
}

export default function SmartMartGame({
  unlockedStalls,
  paused = false,
  onInteractStall,
  onNearStallChange,
}: SmartMartGameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<SmartMartScene | null>(null)
  const interactRef = useRef(onInteractStall)
  const nearRef = useRef(onNearStallChange)
  const pausedRef = useRef(paused)

  const applyPausedState = () => {
    const game = gameRef.current
    const scene = sceneRef.current

    if (!game || !scene) return

    const sceneKey = 'SmartMartScene'

    if (pausedRef.current) {
      scene.setVirtualMove(0, 0)

      if (game.scene.isActive(sceneKey)) {
        game.scene.pause(sceneKey)
      }

      return
    }

    if (game.scene.isPaused(sceneKey)) {
      game.scene.resume(sceneKey)
    }
  }

  useEffect(() => {
    interactRef.current = onInteractStall
  }, [onInteractStall])

  useEffect(() => {
    nearRef.current = onNearStallChange
  }, [onNearStallChange])

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return

    const scene = new SmartMartScene({
      unlockedStalls,
      onInteractStall: (stallId) => interactRef.current(stallId),
      onNearStallChange: (stallId) => nearRef.current?.(stallId),
      onReady: () => applyPausedState(),
    })

    sceneRef.current = scene

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 800,
      height: 740,
      backgroundColor: '#e8efe5',
      scene: [scene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
      },
      banner: false,
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.setUnlockedStalls(unlockedStalls)
  }, [unlockedStalls])

  useEffect(() => {
    pausedRef.current = paused
    applyPausedState()
  }, [paused])

  const startMove = (
    event: React.PointerEvent<HTMLButtonElement>,
    x: number,
    y: number,
  ) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    sceneRef.current?.setVirtualMove(x, y)
  }

  const stopMove = () => {
    sceneRef.current?.setVirtualMove(0, 0)
  }

  return (
    <div className="smartmart-game-wrapper">
      <div
        ref={hostRef}
        className="smartmart-phaser-host"
        aria-label="Không gian SmartMart tương tác. Dùng WASD hoặc phím mũi tên để di chuyển."
      />

      <div className="smartmart-touch-controls" aria-label="Điều khiển cảm ứng">
        <div className="smartmart-dpad">
          <button
            type="button"
            className="move-up"
            aria-label="Đi lên"
            onPointerDown={(event) => startMove(event, 0, -1)}
            onPointerUp={stopMove}
            onPointerCancel={stopMove}
          >
            <ArrowUp size={22} />
          </button>
          <button
            type="button"
            className="move-left"
            aria-label="Đi sang trái"
            onPointerDown={(event) => startMove(event, -1, 0)}
            onPointerUp={stopMove}
            onPointerCancel={stopMove}
          >
            <ArrowLeft size={22} />
          </button>
          <button
            type="button"
            className="move-right"
            aria-label="Đi sang phải"
            onPointerDown={(event) => startMove(event, 1, 0)}
            onPointerUp={stopMove}
            onPointerCancel={stopMove}
          >
            <ArrowRight size={22} />
          </button>
          <button
            type="button"
            className="move-down"
            aria-label="Đi xuống"
            onPointerDown={(event) => startMove(event, 0, 1)}
            onPointerUp={stopMove}
            onPointerCancel={stopMove}
          >
            <ArrowDown size={22} />
          </button>
        </div>

        <button
          type="button"
          className="smartmart-touch-action"
          aria-label="Tương tác với gian hàng"
          onPointerDown={(event) => {
            event.preventDefault()
            sceneRef.current?.triggerInteraction()
          }}
        >
          <CircleDot size={26} />
          <span>Tương tác</span>
        </button>
      </div>
    </div>
  )
}
