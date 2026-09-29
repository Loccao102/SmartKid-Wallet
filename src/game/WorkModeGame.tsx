import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import type {
  WorkCustomerDefinition,
  WorkScenarioChoice,
  WorkWorldFlag,
} from '../domain/types'
import {
  WorkModeScene,
  type WorkVisualStage,
} from './WorkModeScene'

interface WorkModeGameProps {
  customers: WorkCustomerDefinition[]
  customerIndex: number
  stage: WorkVisualStage
  selectedChoice?: WorkScenarioChoice
  worldFlags: WorkWorldFlag[]
}

export default function WorkModeGame({
  customers,
  customerIndex,
  stage,
  selectedChoice,
  worldFlags,
}: WorkModeGameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<WorkModeScene | null>(null)

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return

    const scene = new WorkModeScene({
      customers,
      customerIndex,
      stage,
      selectedChoice,
      worldFlags,
    })

    sceneRef.current = scene

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 900,
      height: 500,
      backgroundColor: '#edf3eb',
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
    sceneRef.current?.updateView({
      customerIndex,
      stage,
      selectedChoice,
      worldFlags,
    })
  }, [customerIndex, stage, selectedChoice?.id, worldFlags.join('|')])

  return (
    <div
      ref={hostRef}
      className="work-phaser-host"
      aria-label="Mô phỏng quầy thu ngân SmartMart với khách hàng và sản phẩm trên băng chuyền."
    />
  )
}
