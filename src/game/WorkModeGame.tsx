import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { defaultStudentAvatar, getNpcAvatarConfig } from '../avatar/avatarCatalog'
import { AVATAR_ART_SIZE, AvatarCharacter } from '../components/avatar/AvatarCharacter'
import type {
  WorkCustomerDefinition,
  WorkScenarioChoice,
  WorkWorldFlag,
} from '../domain/types'
import { collectAvatarSvgUrls } from './avatarSvg'
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
  const avatarSourceRef = useRef<HTMLDivElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<WorkModeScene | null>(null)

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return

    // Export the same catalog-driven characters used by the React work view.
    // Each supported expression is preloaded so stage changes only swap keys.
    const avatarSvgUrls = collectAvatarSvgUrls(avatarSourceRef.current!)

    const scene = new WorkModeScene({
      customers,
      customerIndex,
      stage,
      selectedChoice,
      worldFlags,
      avatarSvgUrls,
      fallbackAvatarSvgUrl: avatarSvgUrls.fallback,
      avatarArtSize: AVATAR_ART_SIZE,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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
    <div className="work-phaser-game-shell">
      <div ref={avatarSourceRef} hidden aria-hidden="true" data-work-avatar-sources>
        <span data-avatar-key="fallback">
          <AvatarCharacter
            config={defaultStudentAvatar}
            age="adult"
            expression="happy"
            decorative
          />
        </span>
        {customers.flatMap((customer, index) =>
          (['happy', 'neutral', 'concerned'] as const).map((expression) => (
            <span
              key={`${customer.id}-${expression}`}
              data-avatar-key={`customer-${index}-${expression}`}
            >
              <AvatarCharacter
                config={getNpcAvatarConfig(customer.id, index)}
                age="adult"
                expression={expression}
                decorative
              />
            </span>
          )),
        )}
      </div>
      <div
        ref={hostRef}
        className="work-phaser-host"
        aria-label="Mô phỏng quầy thu ngân SmartMart với khách hàng và sản phẩm trên băng chuyền."
      />
    </div>
  )
}
