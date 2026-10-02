import { useEffect, useRef } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleDot,
} from 'lucide-react'
import Phaser from 'phaser'
import { AVATAR_ART_SIZE, AvatarCharacter } from '../components/avatar/AvatarCharacter'
import { useAvatarProfileStore } from '../store/avatarProfile'
import type { StallId } from '../domain/types'
import { serializeAvatarSvg } from './avatarSvg'
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
  const avatar = useAvatarProfileStore((state) => state.avatar)
  const avatarSourceRef = useRef<HTMLDivElement | null>(null)
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

    // Reuse the React renderer, including every cosmetic layer, for the canvas.
    // The SVG contains only catalog-controlled shapes and colors, no remote media.
    const avatarSvg = avatarSourceRef.current?.querySelector('svg')
    if (!avatarSvg) return
    const avatarSvgUrl = serializeAvatarSvg(avatarSvg)

    const scene = new SmartMartScene({
      avatarSvgUrl,
      avatarArtSize: AVATAR_ART_SIZE,
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
      <div ref={avatarSourceRef} hidden aria-hidden="true" data-player-avatar-source>
        <AvatarCharacter config={avatar} decorative />
      </div>
      <div
        ref={hostRef}
        className="smartmart-phaser-host"
        tabIndex={0}
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
