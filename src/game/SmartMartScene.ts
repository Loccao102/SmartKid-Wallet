import Phaser from 'phaser'
import { gameAssets } from '../assets/registry'
import type { StallId } from '../domain/types'
import {
  canWalk,
  findWalkingPath,
  movePlayer,
  spawnPosition,
  stallEntrance,
  stallLayout,
  type Position,
} from './smartMartNavigation'

type StallState = 'open' | 'available' | 'locked'

interface StallZone {
  id: StallId
  name: string
  x: number
  y: number
  width: number
  height: number
  booth: Phaser.GameObjects.Rectangle
  artwork: Phaser.GameObjects.Image
  label: Phaser.GameObjects.Text
  status: Phaser.GameObjects.Text
}

interface SmartMartSceneOptions {
  avatarSvgUrl: string
  avatarArtSize: { width: number; height: number }
  unlockedStalls: StallId[]
  onInteractStall: (stallId: StallId) => void
  onNearStallChange?: (stallId: StallId | null) => void
  onReady?: () => void
  initialPosition?: Position
  onPositionChange?: (position: Position) => void
}

const stallOrder: StallId[] = [
  'produce',
  'food',
  'drinks',
  'supplies',
  'promotion',
]

const stallDefinitions = stallLayout

const boothColors: Record<StallId, number> = {
  produce: 0xe77863,
  food: 0x72ad82,
  drinks: 0x69a7c3,
  supplies: 0xe0b844,
  promotion: 0xb37dbd,
}

export class SmartMartScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container
  private character!: Phaser.GameObjects.Image
  private destination!: Phaser.GameObjects.Arc
  private route: Position[] = []
  private controlsEnabled = false
  private readonly initialPosition: Position
  private readonly onPositionChange?: (position: Position) => void
  private readonly avatarSvgUrl: string
  private readonly avatarArtSize: { width: number; height: number }
  private heldKeys = new Set<string>()

  private stalls: StallZone[] = []
  private unlockedStalls = new Set<StallId>()
  private nearStall: StallId | null = null
  private readonly onInteractStall: (stallId: StallId) => void
  private readonly onNearStallChange?: (stallId: StallId | null) => void
  private readonly onReady?: () => void
  private helpText!: Phaser.GameObjects.Text
  private virtualMove = { x: 0, y: 0 }
  private readonly reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )

  constructor(options: SmartMartSceneOptions) {
    super({ key: 'SmartMartScene' })
    this.initialPosition =
      options.initialPosition && canWalk(options.initialPosition)
        ? options.initialPosition
        : spawnPosition
    this.onPositionChange = options.onPositionChange
    this.avatarSvgUrl = options.avatarSvgUrl
    this.avatarArtSize = options.avatarArtSize
    this.unlockedStalls = new Set(options.unlockedStalls)
    this.onInteractStall = options.onInteractStall
    this.onNearStallChange = options.onNearStallChange
    this.onReady = options.onReady
  }

  preload() {
    this.load.svg('student-production', this.avatarSvgUrl, {
      width: this.avatarArtSize.width,
      height: this.avatarArtSize.height,
    })
    for (const id of stallOrder) {
      this.load.svg(
        `stall-production-${id}`,
        gameAssets.production.stalls[id],
        { width: 320, height: 250 },
      )
    }
  }

  create() {
    this.cameras.main.setBackgroundColor('#e8efe5')
    this.drawFloor()
    this.createStoreHeader()
    this.createStalls()
    this.createCheckoutArea()
    this.createPlayer()

    this.helpText = this.add
      .text(400, 705, 'WASD / phím mũi tên để di chuyển', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#61756d',
        backgroundColor: '#ffffffdd',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)

    this.destination = this.add
      .circle(0, 0, 12, 0xeeb94d, 0.3)
      .setStrokeStyle(3, 0x26745b)
      .setVisible(false)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      const stall = this.stalls.find(
        (item) =>
          Math.abs(point.x - item.x) <= item.width / 2 &&
          Math.abs(point.y - item.y) <= item.height / 2 + 20,
      )
      this.walkTo(stall ? stallEntrance(stall.id) : point)
    })
    this.scale.on('resize', this.fitCamera, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.fitCamera, this)
    })
    this.fitCamera()
    this.onReady?.()
  }

  update(_time: number, delta: number) {
    if (!this.player) return
    let x = this.virtualMove.x
    let y = this.virtualMove.y
    if (this.controlsEnabled) {
      if (this.heldKeys.has('arrowleft') || this.heldKeys.has('a')) x -= 1
      if (this.heldKeys.has('arrowright') || this.heldKeys.has('d')) x += 1
      if (this.heldKeys.has('arrowup') || this.heldKeys.has('w')) y -= 1
      if (this.heldKeys.has('arrowdown') || this.heldKeys.has('s')) y += 1
    }
    const manual = x !== 0 || y !== 0
    if (manual) this.cancelRoute()
    const target = this.route[0]
    const old = { x: this.player.x, y: this.player.y }
    if (target) {
      x = target.x - old.x
      y = target.y - old.y
      if (Math.hypot(x, y) <= (220 * Math.min(delta, 40)) / 1000) {
        this.player.setPosition(target.x, target.y)
        this.route.shift()
        x = 0
        y = 0
        if (!this.route.length) this.destination.setVisible(false)
      }
    }
    if (x || y) {
      const next = movePlayer(this.player, { x, y }, delta)
      this.player.setPosition(next.x, next.y)
    }
    const moving = old.x !== this.player.x || old.y !== this.player.y
    if (moving) {
      this.onPositionChange?.({ x: this.player.x, y: this.player.y })
      if (x) this.character.setFlipX(x < 0)
    }
    this.character.y =
      -18 +
      (moving && !this.reducedMotion.matches
        ? Math.sin(this.time.now * 0.022) * 3
        : 0)
    this.character.setAngle(
      moving && !this.reducedMotion.matches
        ? Math.sin(this.time.now * 0.011) * 3
        : 0,
    )
    this.updateNearbyStall()
  }

  setControlsEnabled(enabled: boolean) {
    this.controlsEnabled = enabled
    if (!enabled) this.stopMovement()
  }

  setKey(key: string, down: boolean) {
    if (down) this.heldKeys.add(key.toLowerCase())
    else this.heldKeys.delete(key.toLowerCase())
  }

  stopMovement() {
    this.virtualMove = { x: 0, y: 0 }
    this.heldKeys.clear()
    this.cancelRoute()
  }

  private cancelRoute() {
    this.route = []
    this.destination?.setVisible(false)
  }

  walkTo(point: Position) {
    if (!this.player || !this.scene.isActive()) return
    this.route = findWalkingPath(this.player, point)
    this.destination
      .setPosition(point.x, point.y)
      .setVisible(this.route.length > 0)
  }

  walkToStall(id: StallId) {
    this.walkTo(stallEntrance(id))
  }

  setUnlockedStalls(stallIds: StallId[]) {
    this.unlockedStalls = new Set(stallIds)
    this.refreshStalls()
  }

  setVirtualMove(x: number, y: number) {
    if (x || y) this.cancelRoute()
    this.virtualMove.x = Phaser.Math.Clamp(x, -1, 1)
    this.virtualMove.y = Phaser.Math.Clamp(y, -1, 1)
  }

  triggerInteraction() {
    if (
      this.scene.isActive() &&
      this.nearStall &&
      this.getStallState(this.nearStall) !== 'locked'
    ) {
      this.stopMovement()
      this.onInteractStall(this.nearStall)
    }
  }

  private drawFloor() {
    const graphics = this.add.graphics()

    graphics.fillStyle(0xf7faf5, 1)
    graphics.fillRoundedRect(20, 70, 760, 610, 28)

    graphics.lineStyle(1, 0xdce6dc, 0.65)
    for (let x = 60; x < 760; x += 70) {
      graphics.lineBetween(x, 85, x, 665)
    }
    for (let y = 105; y < 665; y += 70) {
      graphics.lineBetween(35, y, 765, y)
    }

    graphics.lineStyle(3, 0xbfd4c7, 0.6)
    graphics.strokeRoundedRect(20, 70, 760, 610, 28)

    graphics.fillStyle(0xd7eadc, 0.7)
    graphics.fillRoundedRect(337, 105, 126, 510, 40)
    graphics.fillRoundedRect(105, 285, 590, 70, 35)
  }

  private createStoreHeader() {
    this.add
      .rectangle(400, 37, 330, 54, 0x245749, 1)
      .setStrokeStyle(4, 0xf4d269, 1)

    this.add
      .text(400, 28, 'SMARTMART', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
        letterSpacing: 2,
      })
      .setOrigin(0.5)

    this.add
      .text(400, 48, 'HỌC TOÁN QUA MUA SẮM', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#d9eee5',
        letterSpacing: 1,
      })
      .setOrigin(0.5)
  }

  private createStalls() {
    this.stalls = stallDefinitions.map((definition) => {
      const booth = this.add
        .rectangle(
          definition.x,
          definition.y,
          definition.width,
          definition.height,
          boothColors[definition.id],
          1,
        )
        .setStrokeStyle(5, 0xffffff, 0.9)

      const artwork = this.add
        .image(
          definition.x,
          definition.y - 14,
          `stall-production-${definition.id}`,
        )
        .setDisplaySize(230, 180)

      const label = this.add
        .text(
          definition.x,
          definition.y + (definition.id === 'promotion' ? 47 : 62),
          definition.name,
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#244a40',
            align: 'center',
          },
        )
        .setOrigin(0.5)

      const status = this.add
        .text(
          definition.x,
          definition.y + (definition.id === 'promotion' ? 69 : 86),
          '',
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            backgroundColor: '#244a40cc',
            padding: { x: 9, y: 5 },
          },
        )
        .setOrigin(0.5)

      return { ...definition, booth, artwork, label, status }
    })

    this.refreshStalls()
  }

  private createCheckoutArea() {
    this.add
      .rectangle(400, 662, 280, 48, 0x315e52, 1)
      .setStrokeStyle(4, 0xffffff, 0.9)

    this.add
      .text(400, 662, 'QUẦY THANH TOÁN · MISSION', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
  }

  private createPlayer() {
    const shadow = this.add.ellipse(0, 13, 30, 12, 0x24483e, 0.18)
    const character = this.add
      .image(0, -10, 'student-production')
      .setDisplaySize(52, 65)
    this.character = character
    character.setDisplaySize(64, 80)
    this.player = this.add.container(
      this.initialPosition.x,
      this.initialPosition.y,
      [shadow, character],
    )
    this.player.setDepth(20)
  }

  private getStallState(stallId: StallId): StallState {
    if (this.unlockedStalls.has(stallId)) return 'open'

    const nextLocked = stallOrder.find((id) => !this.unlockedStalls.has(id))
    return nextLocked === stallId ? 'available' : 'locked'
  }

  private refreshStalls() {
    for (const stall of this.stalls) {
      const state = this.getStallState(stall.id)
      const baseColor = boothColors[stall.id]

      stall.booth.setFillStyle(state === 'locked' ? 0xb7bfbb : baseColor, 0.12)
      stall.artwork.setAlpha(state === 'locked' ? 0.55 : 1)
      stall.booth.setStrokeStyle(5, 0xffffff, state === 'locked' ? 0.55 : 0.9)
      stall.label.setAlpha(state === 'locked' ? 0.55 : 1)
      stall.status.setAlpha(state === 'locked' ? 0.65 : 1)

      if (state === 'open') {
        stall.status.setText('ĐÃ MỞ · VÀO GIAN')
        stall.status.setBackgroundColor('#187258dd')
      } else if (state === 'available') {
        stall.status.setText('GIẢI TOÁN ĐỂ MỞ')
        stall.status.setBackgroundColor('#9b6f08dd')
      } else {
        stall.status.setText('ĐANG KHÓA')
        stall.status.setBackgroundColor('#65736edd')
      }
    }

    this.applyNearHighlight()
  }

  private updateNearbyStall() {
    let nearest: StallZone | null = null
    let nearestDistance = Number.POSITIVE_INFINITY

    for (const stall of this.stalls) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        stall.x,
        stall.y,
      )

      if (distance < 155 && distance < nearestDistance) {
        nearest = stall
        nearestDistance = distance
      }
    }

    const nextNearId = nearest?.id ?? null

    if (nextNearId !== this.nearStall) {
      this.nearStall = nextNearId
      this.onNearStallChange?.(nextNearId)
      this.applyNearHighlight()
    }

    if (nearest) {
      const state = this.getStallState(nearest.id)
      this.helpText.setText(
        state === 'locked'
          ? `${nearest.name}: chưa mở`
          : `Nhấn E hoặc Space để tương tác với ${nearest.name}`,
      )
    } else {
      this.helpText.setText('WASD / phím mũi tên để di chuyển')
    }
  }

  private applyNearHighlight() {
    for (const stall of this.stalls) {
      const state = this.getStallState(stall.id)
      const isNear = stall.id === this.nearStall
      const strokeColor = isNear ? 0xf4c84c : 0xffffff
      const strokeWidth = isNear ? 8 : 5
      const alpha = state === 'locked' ? 0.55 : 0.9

      stall.booth.setStrokeStyle(strokeWidth, strokeColor, isNear ? 1 : alpha)
    }
  }

  private fitCamera() {
    const width = this.scale.width
    const height = this.scale.height
    const zoom = Math.max(0.85, Math.min(width / 800, height / 740))

    this.cameras.main.setZoom(zoom)
    const extraX = Math.max(0, width / zoom - 800) / 2
    const extraY = Math.max(0, height / zoom - 740) / 2
    this.cameras.main.setBounds(
      -extraX,
      -extraY,
      800 + extraX * 2,
      740 + extraY * 2,
    )
    this.cameras.main.startFollow(this.player, true, 1, 1)
    this.helpText.setVisible(width >= 680)
  }
}
