import Phaser from 'phaser'
import { gameAssets } from '../assets/registry'
import type { StallId } from '../domain/types'

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
  unlockedStalls: StallId[]
  onInteractStall: (stallId: StallId) => void
  onNearStallChange?: (stallId: StallId | null) => void
  onReady?: () => void
}

const stallOrder: StallId[] = [
  'produce',
  'food',
  'drinks',
  'supplies',
  'promotion',
]

const stallDefinitions: Array<
  Pick<StallZone, 'id' | 'name' | 'x' | 'y' | 'width' | 'height'>
> = [
  {
    id: 'produce',
    name: 'RAU CỦ & HOA QUẢ',
    x: 190,
    y: 150,
    width: 240,
    height: 110,
  },
  { id: 'food', name: 'THỰC PHẨM', x: 610, y: 150, width: 240, height: 110 },
  { id: 'drinks', name: 'ĐỒ UỐNG', x: 190, y: 395, width: 240, height: 110 },
  { id: 'supplies', name: 'ĐỒ DÙNG', x: 610, y: 395, width: 240, height: 110 },
  {
    id: 'promotion',
    name: 'KHUYẾN MÃI',
    x: 400,
    y: 555,
    width: 270,
    height: 96,
  },
]

const boothColors: Record<StallId, number> = {
  produce: 0xe77863,
  food: 0x72ad82,
  drinks: 0x69a7c3,
  supplies: 0xe0b844,
  promotion: 0xb37dbd,
}

export class SmartMartScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container
  private keys!: {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    w: Phaser.Input.Keyboard.Key
    a: Phaser.Input.Keyboard.Key
    s: Phaser.Input.Keyboard.Key
    d: Phaser.Input.Keyboard.Key
    e: Phaser.Input.Keyboard.Key
    space: Phaser.Input.Keyboard.Key
  }

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
    this.unlockedStalls = new Set(options.unlockedStalls)
    this.onInteractStall = options.onInteractStall
    this.onNearStallChange = options.onNearStallChange
    this.onReady = options.onReady
  }

  preload() {
    this.load.svg('student-production', gameAssets.production.student, {
      width: 160,
      height: 190,
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

    if (!this.input.keyboard) return

    this.keys = {
      cursors: this.input.keyboard.createCursorKeys(),
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      e: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }

    this.helpText = this.add
      .text(400, 705, 'WASD / phím mũi tên để di chuyển', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#61756d',
        backgroundColor: '#ffffffdd',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)

    this.scale.on('resize', () => this.fitCamera())
    this.fitCamera()
    this.onReady?.()
  }

  update(_time: number, delta: number) {
    if (!this.keys || !this.player) return

    const speed = 190 * (delta / 1000)
    let directionX = this.virtualMove.x
    let directionY = this.virtualMove.y

    if (this.keys.cursors.left.isDown || this.keys.a.isDown) directionX -= 1
    if (this.keys.cursors.right.isDown || this.keys.d.isDown) directionX += 1
    if (this.keys.cursors.up.isDown || this.keys.w.isDown) directionY -= 1
    if (this.keys.cursors.down.isDown || this.keys.s.isDown) directionY += 1

    directionX = Phaser.Math.Clamp(directionX, -1, 1)
    directionY = Phaser.Math.Clamp(directionY, -1, 1)

    if (directionX !== 0 && directionY !== 0) {
      directionX *= 0.7071
      directionY *= 0.7071
    }

    const nextX = Phaser.Math.Clamp(this.player.x + directionX * speed, 45, 755)
    const nextY = Phaser.Math.Clamp(this.player.y + directionY * speed, 88, 665)

    if (this.canMoveTo(nextX, this.player.y)) this.player.x = nextX
    if (this.canMoveTo(this.player.x, nextY)) this.player.y = nextY

    const isMoving = directionX !== 0 || directionY !== 0
    const pulse =
      isMoving && !this.reducedMotion.matches
        ? 1 + Math.sin(this.time.now * 0.018) * 0.025
        : 1
    this.player.setScale(pulse)

    this.updateNearbyStall()

    if (
      this.nearStall &&
      (Phaser.Input.Keyboard.JustDown(this.keys.e) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space))
    ) {
      this.triggerInteraction()
    }
  }

  setUnlockedStalls(stallIds: StallId[]) {
    this.unlockedStalls = new Set(stallIds)
    this.refreshStalls()
  }

  setVirtualMove(x: number, y: number) {
    this.virtualMove.x = Phaser.Math.Clamp(x, -1, 1)
    this.virtualMove.y = Phaser.Math.Clamp(y, -1, 1)
  }

  triggerInteraction() {
    if (this.nearStall) {
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
      .setDisplaySize(48, 57)
    this.player = this.add.container(400, 250, [shadow, character])
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
        stall.status.setText('ĐÃ MỞ · E ĐỂ LUYỆN')
        stall.status.setBackgroundColor('#187258dd')
      } else if (state === 'available') {
        stall.status.setText('E ĐỂ MỞ KHÓA')
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

  private canMoveTo(x: number, y: number) {
    const playerRadius = 20

    return !this.stalls.some((stall) => {
      const halfWidth = stall.width / 2 + playerRadius
      const halfHeight = stall.height / 2 + playerRadius

      return (
        x > stall.x - halfWidth &&
        x < stall.x + halfWidth &&
        y > stall.y - halfHeight &&
        y < stall.y + halfHeight
      )
    })
  }

  private fitCamera() {
    const width = this.scale.width
    const height = this.scale.height
    const zoom = Math.min(width / 800, height / 740)

    this.cameras.main.setZoom(zoom)
    this.cameras.main.centerOn(400, 370)
  }
}
