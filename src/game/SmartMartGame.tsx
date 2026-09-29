import { useEffect, useRef } from 'react'
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
    const scene = sceneRef.current
    if (!scene) return

    if (paused) {
      scene.scene.pause()
    } else if (scene.scene.isPaused()) {
      scene.scene.resume()
    }
  }, [paused])

  return (
    <div
      ref={hostRef}
      className="smartmart-phaser-host"
      aria-label="Không gian SmartMart tương tác. Dùng WASD hoặc phím mũi tên để di chuyển."
    />
  )
}
