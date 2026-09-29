import Phaser from 'phaser'
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
  label: Phaser.GameObjects.Text
  status: Phaser.GameObjects.Text
}

interface SmartMartSceneOptions {
  unlockedStalls: StallId[]
  onInteractStall: (stallId: StallId) => void
  onNearStallChange?: (stallId: StallId | null) => void
}

const stallOrder: StallId[] = ['produce', 'food', 'drinks', 'supplies', 'promotion']

const stallDefinitions: Array<Pick<StallZone, 'id' | 'name' | 'x' | 'y' | 'width' | 'height'>> = [
  { id: 'produce', name: 'RAU CỦ & HOA QUẢ', x: 190, y: 150, width: 240, height: 110 },
  { id: 'food', name: 'THỰC PHẨM', x: 610, y: 150, width: 240, height: 110 },
  { id: 'drinks', name: 'ĐỒ UỐNG', x: 190, y: 395, width: 240, height: 110 },
  { id: 'supplies', name: 'ĐỒ DÙNG', x: 610, y: 395, width: 240, height: 110 },
  { id: 'promotion', name: 'KHUYẾN MÃI', x: 400, y: 555, width: 270, height: 96 },
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
  private helpText!: Phaser.GameObjects.Text

  constructor(options: SmartMartSceneOptions) {
    super({ key: 'SmartMartScene' })
    this.unlockedStalls = new Set(options.unlockedStalls)
    this.onInteractStall = options.onInteractStall
    this.onNearStallChange = options.onNearStallChange
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
  }

  update(_time: number, delta: number) {
    if (!this.keys || !this.player) return

    const speed = 190 * (delta / 1000)
    let dx = 0
    let dy = 0

    if (this.keys.cursors.left.isDown || this.keys.a.isDown) dx -= speed
    if (this.keys.cursors.right.isDown || this.keys.d.isDown) dx += speed
    if (this.keys.cursors.up.isDown || this.keys.w.isDown) dy -= speed
    if (this.keys.cursors.down.isDown || this.keys.s.isDown) dy += speed

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071
      dy *= 0.7071
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + dx, 45, 755)
    this.player.y = Phaser.Math.Clamp(this.player.y + dy, 88, 665)

    this.updateNearbyStall()

    if (
      this.nearStall &&
      (Phaser.Input.Keyboard.JustDown(this.keys.e) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space))
    ) {
      this.onInteractStall(this.nearStall)
    }
  }

  setUnlockedStalls(stallIds: StallId[]) {
    this.unlockedStalls = new Set(stallIds)
    this.refreshStalls()
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

      this.add.rectangle(
        definition.x,
        definition.y - definition.height / 2 + 16,
        definition.width - 12,
        26,
        0xffffff,
        0.92,
      )

      const label = this.add
        .text(definition.x, definition.y - 25, definition.name, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#244a40',
          align: 'center',
        })
        .setOrigin(0.5)

      const status = this.add
        .text(definition.x, definition.y + 24, '', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          backgroundColor: '#244a40cc',
          padding: { x: 9, y: 5 },
        })
        .setOrigin(0.5)

      return { ...definition, booth, label, status }
    })

    this.refreshStalls()
  }

  private createCheckoutArea() {
    this.add
      .rectangle(400, 642, 280, 48, 0x315e52, 1)
      .setStrokeStyle(4, 0xffffff, 0.9)

    this.add
      .text(400, 642, 'QUẦY THANH TOÁN · MISSION', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
  }

  private createPlayer() {
    const shadow = this.add.ellipse(0, 13, 30, 12, 0x24483e, 0.18)
    const body = this.add.circle(0, 0, 15, 0xf4c84c, 1).setStrokeStyle(3, 0xffffff, 1)
    const face = this.add.circle(0, -2, 6, 0xfff1c8, 1)
    const leftEye = this.add.circle(-2, -3, 1, 0x2c4d43, 1)
    const rightEye = this.add.circle(2, -3, 1, 0x2c4d43, 1)

    this.player = this.add.container(400, 250, [shadow, body, face, leftEye, rightEye])
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

      stall.booth.setFillStyle(
        state === 'locked' ? 0xb7bfbb : baseColor,
        state === 'locked' ? 0.5 : 1,
      )
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

  private fitCamera() {
    const width = this.scale.width
    const height = this.scale.height
    const zoom = Math.min(width / 800, height / 740)

    this.cameras.main.setZoom(zoom)
    this.cameras.main.centerOn(400, 370)
  }
}
