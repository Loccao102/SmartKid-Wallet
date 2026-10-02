import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleDot,
} from 'lucide-react'
import Phaser from 'phaser'
import {
  AVATAR_ART_SIZE,
  AvatarCharacter,
} from '../components/avatar/AvatarCharacter'
import { useAvatarProfileStore } from '../store/avatarProfile'
import { stalls } from '../data/stalls'
import { type Position } from './smartMartNavigation'
import type { StallId } from '../domain/types'
import { serializeAvatarSvg } from './avatarSvg'
import { SmartMartScene } from './SmartMartScene'

interface SmartMartGameProps {
  unlockedStalls: StallId[]
  paused?: boolean
  initialPosition?: Position
  onPositionChange?: (position: Position) => void
  onInteractStall: (stallId: StallId) => void
  onNearStallChange?: (stallId: StallId | null) => void
}

export default function SmartMartGame({
  unlockedStalls,
  paused = false,
  initialPosition,
  onPositionChange,
  onInteractStall,
  onNearStallChange,
}: SmartMartGameProps) {
  const [nearStall, setNearStall] = useState<StallId | null>(null)
  const [ready, setReady] = useState(false)
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
      scene.setControlsEnabled(false)

      if (game.scene.isActive(sceneKey)) {
        game.scene.pause(sceneKey)
      }

      return
    }

    if (game.scene.isPaused(sceneKey)) {
      game.scene.resume(sceneKey)
    }
    scene.setControlsEnabled(document.activeElement === hostRef.current)
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
      initialPosition,
      onPositionChange,
      avatarSvgUrl,
      avatarArtSize: AVATAR_ART_SIZE,
      unlockedStalls,
      onInteractStall: (stallId) => interactRef.current(stallId),
      onNearStallChange: (stallId) => {
        setNearStall(stallId)
        nearRef.current?.(stallId)
      },
      onReady: () => {
        setReady(true)
        applyPausedState()
      },
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
      input: { keyboard: false },
      banner: false,
    })

    const resizeObserver = new ResizeObserver(() => {
      const host = hostRef.current
      if (host && host.clientWidth && host.clientHeight)
        gameRef.current?.scale.resize(host.clientWidth, host.clientHeight)
    })
    resizeObserver.observe(hostRef.current)
    const stop = () => scene.setControlsEnabled(false)
    const visibility = () => {
      if (document.hidden) stop()
    }
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', visibility)
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
    if (paused || !ready) return
    event.currentTarget.setPointerCapture(event.pointerId)
    sceneRef.current?.setVirtualMove(x, y)
  }

  const stopMove = () => {
    sceneRef.current?.setVirtualMove(0, 0)
  }

  const nextStall = stalls.find((stall) => !unlockedStalls.includes(stall.id))
  const canInteract =
    ready &&
    !paused &&
    nearStall !== null &&
    (unlockedStalls.includes(nearStall) || nextStall?.id === nearStall)
  const nearName = stalls.find((stall) => stall.id === nearStall)?.name

  return (
    <div className="smartmart-game-wrapper">
      <div
        ref={avatarSourceRef}
        hidden
        aria-hidden="true"
        data-player-avatar-source
      >
        <AvatarCharacter config={avatar} decorative />
      </div>
      <div
        ref={hostRef}
        className="smartmart-phaser-host"
        tabIndex={0}
        role="region"
        onKeyDown={(event) => {
          if (paused || !ready) return
          const key = event.key.toLowerCase()
          if (
            [
              'arrowup',
              'arrowdown',
              'arrowleft',
              'arrowright',
              'w',
              'a',
              's',
              'd',
              'e',
              ' ',
            ].includes(key)
          ) {
            event.preventDefault()
            sceneRef.current?.setControlsEnabled(true)
            if (key === 'e' || key === ' ') {
              if (!event.repeat) sceneRef.current?.triggerInteraction()
            } else sceneRef.current?.setKey(key, true)
          }
        }}
        onKeyUp={(event) => sceneRef.current?.setKey(event.key, false)}
        onFocus={() => {
          if (!paused) sceneRef.current?.setControlsEnabled(true)
        }}
        onBlur={() => sceneRef.current?.setControlsEnabled(false)}
        onPointerDown={() => {
          hostRef.current?.focus({ preventScroll: true })
          if (!paused) sceneRef.current?.setControlsEnabled(true)
        }}
        aria-label="Sân chơi SmartMart. Chạm để đi hoặc dùng WASD, phím mũi tên. Nhấn E để tương tác."
      />

      <div
        className="exploration-destinations"
        role="group"
        aria-label="Đi đến gian hàng"
      >
        {stalls.map((stall) => (
          <button
            key={stall.id}
            type="button"
            disabled={!ready || paused}
            onClick={() => sceneRef.current?.walkToStall(stall.id)}
          >
            <span>{stall.order}</span>
            {stall.name}
          </button>
        ))}
      </div>
      <div className="smartmart-touch-controls" aria-label="Điều khiển cảm ứng">
        <div className="smartmart-dpad">
          {[
            {
              className: 'move-up',
              label: 'Đi lên',
              x: 0,
              y: -1,
              Icon: ArrowUp,
            },
            {
              className: 'move-left',
              label: 'Đi sang trái',
              x: -1,
              y: 0,
              Icon: ArrowLeft,
            },
            {
              className: 'move-right',
              label: 'Đi sang phải',
              x: 1,
              y: 0,
              Icon: ArrowRight,
            },
            {
              className: 'move-down',
              label: 'Đi xuống',
              x: 0,
              y: 1,
              Icon: ArrowDown,
            },
          ].map(({ className, label, x, y, Icon }) => (
            <button
              key={className}
              type="button"
              className={className}
              aria-label={label}
              disabled={paused || !ready}
              onPointerDown={(event) => startMove(event, x, y)}
              onPointerUp={stopMove}
              onPointerCancel={stopMove}
              onLostPointerCapture={stopMove}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  if (!event.repeat) sceneRef.current?.setVirtualMove(x, y)
                }
              }}
              onKeyUp={stopMove}
              onBlur={stopMove}
            >
              <Icon size={22} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="exploration-action">
          <p role="status">
            {nearName
              ? nearStall &&
                (unlockedStalls.includes(nearStall) ||
                  nextStall?.id === nearStall)
                ? nearName
                : nearName + ' · Hoàn thành gian trước để mở'
              : 'Đến gần quầy để khám phá'}
          </p>
          <button
            type="button"
            className="smartmart-touch-action"
            disabled={!canInteract}
            onClick={() => sceneRef.current?.triggerInteraction()}
          >
            <CircleDot size={24} aria-hidden="true" />
            <span>
              {nearStall && unlockedStalls.includes(nearStall)
                ? 'Vào gian hàng'
                : 'Khám phá gian'}
              <small>E / Space</small>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
