import Phaser from 'phaser'
import { getNpcAvatarConfig, type AvatarConfig } from '../avatar/avatarCatalog'
import type {
  WorkCustomerDefinition,
  WorkScenarioChoice,
  WorkWorldFlag,
} from '../domain/types'

export type WorkVisualStage = 'total' | 'scenario' | 'change' | 'done' | 'follow-up'

interface WorkModeSceneOptions {
  customers: WorkCustomerDefinition[]
  customerIndex: number
  stage: WorkVisualStage
  selectedChoice?: WorkScenarioChoice
  worldFlags: WorkWorldFlag[]
}

interface DynamicView {
  customerIndex: number
  stage: WorkVisualStage
  selectedChoice?: WorkScenarioChoice
  worldFlags: WorkWorldFlag[]
}


export class WorkModeScene extends Phaser.Scene {
  private readonly customers: WorkCustomerDefinition[]
  private dynamicLayer!: Phaser.GameObjects.Container
  private view: DynamicView
  private statusText!: Phaser.GameObjects.Text
  private posText!: Phaser.GameObjects.Text

  constructor(options: WorkModeSceneOptions) {
    super({ key: 'WorkModeScene' })
    this.customers = options.customers
    this.view = {
      customerIndex: options.customerIndex,
      stage: options.stage,
      selectedChoice: options.selectedChoice,
      worldFlags: options.worldFlags,
    }
  }

  create() {
    this.cameras.main.setBackgroundColor('#edf3eb')
    this.drawStore()
    this.dynamicLayer = this.add.container(0, 0)
    this.renderDynamicView()
    this.scale.on('resize', () => this.fitCamera())
    this.fitCamera()
  }

  updateView(next: DynamicView) {
    const customerChanged = next.customerIndex !== this.view.customerIndex
    this.view = next

    if (!this.dynamicLayer) return

    this.renderDynamicView(customerChanged)
  }

  private drawStore() {
    const graphics = this.add.graphics()

    graphics.fillStyle(0xfafcf8, 1)
    graphics.fillRoundedRect(18, 18, 864, 464, 28)
    graphics.lineStyle(3, 0xcfded3, 0.85)
    graphics.strokeRoundedRect(18, 18, 864, 464, 28)

    graphics.fillStyle(0xdce9df, 1)
    graphics.fillRoundedRect(44, 62, 250, 365, 22)

    graphics.fillStyle(0x315e52, 1)
    graphics.fillRoundedRect(338, 245, 500, 126, 20)

    graphics.fillStyle(0x94aa9e, 1)
    graphics.fillRoundedRect(358, 269, 270, 72, 12)

    graphics.lineStyle(2, 0xd5ded8, 0.8)
    for (let x = 390; x < 620; x += 38) {
      graphics.lineBetween(x, 275, x, 335)
    }

    graphics.fillStyle(0x203f37, 1)
    graphics.fillRoundedRect(664, 224, 132, 118, 16)

    graphics.fillStyle(0x8fc5ad, 1)
    graphics.fillRoundedRect(680, 240, 100, 55, 10)

    graphics.fillStyle(0xffffff, 0.9)
    graphics.fillRoundedRect(702, 309, 58, 18, 8)

    graphics.fillStyle(0xe4ebe5, 1)
    graphics.fillRoundedRect(338, 388, 500, 55, 17)

    this.add
      .text(169, 42, 'HÀNG CHỜ', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#60756d',
        letterSpacing: 1,
      })
      .setOrigin(0.5)

    this.add
      .text(565, 205, 'BĂNG CHUYỀN THANH TOÁN', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#6f817b',
        letterSpacing: 1,
      })
      .setOrigin(0.5)

    this.add
      .text(730, 210, 'SMART POS', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#315047',
      })
      .setOrigin(0.5)

    this.statusText = this.add
      .text(730, 267, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#173d32',
        align: 'center',
        wordWrap: { width: 88 },
      })
      .setOrigin(0.5)

    this.posText = this.add
      .text(588, 415, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#49675e',
      })
      .setOrigin(0.5)
  }

  private renderDynamicView(animateCustomer = false) {
    this.dynamicLayer.removeAll(true)

    const current = this.customers[this.view.customerIndex]
    if (!current) return

    this.renderQueue()
    this.renderCurrentCustomer(current, animateCustomer)
    this.renderProducts(current)
    this.renderStageEffects()
    this.renderWorldWarnings()
  }

  private renderQueue() {
    this.customers.forEach((customer, index) => {
      if (index < this.view.customerIndex) return

      const isCurrent = index === this.view.customerIndex
      const waitingPosition = Math.max(0, index - this.view.customerIndex - 1)
      const x = isCurrent ? 342 : 112
      const y = isCurrent ? 318 : 104 + waitingPosition * 62

      const npc = this.createNpc(
        x,
        y,
        getNpcAvatarConfig(customer.id, index),
        isCurrent,
      )

      if (!isCurrent) {
        this.dynamicLayer.add(
          this.add
            .text(x, y + 29, customer.name, {
              fontFamily: 'system-ui, sans-serif',
              fontSize: '9px',
              fontStyle: 'bold',
              color: '#667a72',
            })
            .setOrigin(0.5),
        )
      }

      this.dynamicLayer.add(npc)
    })
  }

  private renderCurrentCustomer(
    customer: WorkCustomerDefinition,
    animateCustomer: boolean,
  ) {
    const label = this.add
      .text(340, 226, customer.name, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#315047',
        backgroundColor: '#ffffffdd',
        padding: { x: 9, y: 5 },
      })
      .setOrigin(0.5)

    this.dynamicLayer.add(label)

    if (animateCustomer) {
      const currentNpc = this.dynamicLayer.list.find(
        (item) =>
          item instanceof Phaser.GameObjects.Container &&
          item.getData('isCurrent') === true,
      ) as Phaser.GameObjects.Container | undefined

      if (currentNpc) {
        currentNpc.x = 150
        currentNpc.y = 320
        this.tweens.add({
          targets: currentNpc,
          x: 342,
          y: 318,
          duration: 520,
          ease: 'Sine.easeOut',
        })
      }
    }
  }

  private renderProducts(customer: WorkCustomerDefinition) {
    const flattened = customer.basket.flatMap((item) =>
      Array.from({ length: Math.min(item.quantity, 4) }, (_, index) => ({
        name: item.name,
        index,
      })),
    )

    flattened.slice(0, 7).forEach((item, index) => {
      const x = 405 + (index % 4) * 58
      const y = 294 + Math.floor(index / 4) * 34
      const width = 44
      const product = this.add
        .rectangle(x, y, width, 25, 0xf2c65a, 1)
        .setStrokeStyle(2, 0xffffff, 0.95)

      const shortLabel = item.name
        .replace(/[0-9]/g, '')
        .trim()
        .split(' ')
        .slice(-1)[0]
        .slice(0, 5)

      const label = this.add
        .text(x, y, shortLabel, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '8px',
          fontStyle: 'bold',
          color: '#554317',
        })
        .setOrigin(0.5)

      this.dynamicLayer.add([product, label])
    })
  }

  private renderStageEffects() {
    const stageLabel: Record<WorkVisualStage, string> = {
      total: 'ĐANG TÍNH\nHÓA ĐƠN',
      scenario: 'CẦN XỬ LÝ\nTÌNH HUỐNG',
      change: 'TÍNH TIỀN\nTHỪA',
      done: 'GIAO DỊCH\nHOÀN TẤT',
      'follow-up': 'CÂU CHUYỆN\nQUAY LẠI',
    }

    this.statusText.setText(stageLabel[this.view.stage])
    this.posText.setText(
      this.view.stage === 'done'
        ? '✓ Sẵn sàng gọi khách tiếp theo'
        : 'Nhân viên tập sự đang phục vụ tại quầy',
    )

    const statusColor =
      this.view.stage === 'scenario' || this.view.stage === 'follow-up'
        ? 0xf3c34d
        : this.view.stage === 'done'
          ? 0x59b887
          : 0x8fc5ad

    const indicator = this.add
      .circle(730, 317, 7, statusColor, 1)
      .setStrokeStyle(2, 0xffffff, 1)

    this.dynamicLayer.add(indicator)

    if (this.view.stage === 'scenario' || this.view.stage === 'follow-up') {
      const alert = this.add
        .container(584, 100)
        .setDepth(10)

      const panel = this.add
        .rectangle(0, 0, 360, 62, 0xfff1bd, 1)
        .setStrokeStyle(2, 0xe3bd48, 1)

      const text = this.add
        .text(
          0,
          -5,
          this.view.stage === 'follow-up'
            ? 'CÂU CHUYỆN QUAY LẠI'
            : 'TÌNH HUỐNG PHÁT SINH',
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#7a5a08',
          },
        )
        .setOrigin(0.5)

      const sub = this.add
        .text(
          0,
          15,
          this.view.stage === 'follow-up'
            ? 'Một quyết định trước đó đang tạo ra tình huống mới'
            : 'Xem lựa chọn bên dưới để xử lý trước khi thanh toán',
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            color: '#8a7028',
          },
        )
        .setOrigin(0.5)

      alert.add([panel, text, sub])
      this.dynamicLayer.add(alert)

      this.tweens.add({
        targets: alert,
        y: 106,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    if (this.view.stage === 'done') {
      const complete = this.add
        .text(565, 101, '✓ KHÁCH ĐÃ THANH TOÁN', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#176c55',
          backgroundColor: '#dff4e8ee',
          padding: { x: 16, y: 9 },
        })
        .setOrigin(0.5)

      this.dynamicLayer.add(complete)
    }

    if (this.view.selectedChoice?.billDelta) {
      const delta = this.view.selectedChoice.billDelta
      const adjustment = this.add
        .text(
          730,
          365,
          (delta < 0 ? '−' : '+') + Math.abs(delta).toLocaleString('vi-VN') + 'đ',
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: delta < 0 ? '#176c55' : '#9a5b20',
            backgroundColor: '#ffffffee',
            padding: { x: 9, y: 5 },
          },
        )
        .setOrigin(0.5)

      this.dynamicLayer.add(adjustment)
    }
  }


  private renderWorldWarnings() {
    if (this.view.worldFlags.length === 0) return

    const flagLabels: Record<WorkWorldFlag, string> = {
      'complaint-risk': 'KHIẾU NẠI',
      'pricing-mismatch': 'SAI GIÁ',
      'inventory-pressure': 'THIẾU HÀNG',
      'cash-discrepancy': 'LỆCH TIỀN',
      'billing-dispute': 'HÓA ĐƠN',
      'stale-promo-sign': 'BIỂN KM',
    }

    this.view.worldFlags.slice(0, 3).forEach((flag, index) => {
      const x = 205
      const y = 94 + index * 34
      const badge = this.add
        .text(x, y, '! ' + flagLabels[flag], {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#8b5b16',
          backgroundColor: '#fff0bd',
          padding: { x: 8, y: 5 },
        })
        .setOrigin(0.5)

      this.dynamicLayer.add(badge)
    })
  }

  private createNpc(
    x: number,
    y: number,
    avatar: AvatarConfig,
    isCurrent: boolean,
  ) {
    const toColor = (hex: string) => Number.parseInt(hex.slice(1), 16)
    const skin = toColor(avatar.skinTone)
    const hair = toColor(avatar.hairColor)
    const top = toColor(avatar.topColor)
    const bottom = toColor(avatar.bottomColor)
    const shoes = toColor(avatar.shoeColor)
    const bodyWidth =
      avatar.bodyType === 'slim' ? 28 : avatar.bodyType === 'broad' ? 39 : 34

    const graphics = this.add.graphics()
    graphics.fillStyle(0x27483e, 0.14)
    graphics.fillEllipse(0, 48, 48, 13)

    // Legs: thigh, knee, lower leg, shoe.
    graphics.lineStyle(11, bottom, 1)
    graphics.lineBetween(-9, 15, -10, 31)
    graphics.lineBetween(-10, 31, -11, 45)
    graphics.lineBetween(9, 15, 10, 31)
    graphics.lineBetween(10, 31, 11, 45)
    graphics.fillStyle(bottom, 1)
    graphics.fillCircle(-10, 31, 5)
    graphics.fillCircle(10, 31, 5)
    graphics.fillStyle(shoes, 1)
    graphics.fillRoundedRect(-20, 42, 17, 7, 3)
    graphics.fillRoundedRect(3, 42, 17, 7, 3)

    // Arms: upper arm, elbow, forearm, hand.
    graphics.lineStyle(10, top, 1)
    graphics.lineBetween(-bodyWidth / 2 + 2, -2, -bodyWidth / 2 - 7, 15)
    graphics.lineBetween(bodyWidth / 2 - 2, -2, bodyWidth / 2 + 7, 15)
    graphics.fillStyle(skin, 1)
    graphics.fillCircle(-bodyWidth / 2 - 7, 15, 4.5)
    graphics.fillCircle(bodyWidth / 2 + 7, 15, 4.5)
    graphics.lineStyle(7, skin, 1)
    graphics.lineBetween(-bodyWidth / 2 - 7, 15, -bodyWidth / 2 - 3, 31)
    graphics.lineBetween(bodyWidth / 2 + 7, 15, bodyWidth / 2 + 3, 31)
    graphics.fillStyle(skin, 1)
    graphics.fillCircle(-bodyWidth / 2 - 3, 33, 4.5)
    graphics.fillCircle(bodyWidth / 2 + 3, 33, 4.5)

    // Torso and neck.
    graphics.fillStyle(skin, 1)
    graphics.fillRoundedRect(-5, -22, 10, 12, 4)
    graphics.fillStyle(top, 1)
    graphics.fillRoundedRect(-bodyWidth / 2, -12, bodyWidth, 38, 8)

    // Head and hair.
    graphics.fillStyle(skin, 1)
    graphics.fillEllipse(0, -38, 34, 40)
    graphics.fillStyle(hair, 1)
    graphics.fillEllipse(0, -49, 35, 22)

    if (avatar.hairStyle === 'bob' || avatar.hairStyle === 'waves') {
      graphics.fillRoundedRect(-18, -48, 8, 28, 4)
      graphics.fillRoundedRect(10, -48, 8, 28, 4)
    }
    if (avatar.hairStyle === 'ponytail') {
      graphics.fillEllipse(21, -36, 14, 24)
    }
    if (avatar.hairStyle === 'bun') {
      graphics.fillCircle(11, -61, 9)
    }
    if (avatar.hairStyle === 'curly') {
      graphics.fillCircle(-12, -53, 9)
      graphics.fillCircle(0, -58, 10)
      graphics.fillCircle(12, -53, 9)
    }

    // Face.
    graphics.fillStyle(0x293b39, 1)
    graphics.fillCircle(-6, -39, 1.8)
    graphics.fillCircle(6, -39, 1.8)
    graphics.lineStyle(1.8, 0x9c574f, 1)
    graphics.beginPath()
    graphics.arc(0, -32, 5, 0.2, Math.PI - 0.2, false)
    graphics.strokePath()

    if (avatar.accessory === 'glasses') {
      graphics.lineStyle(1.6, 0x415158, 1)
      graphics.strokeRoundedRect(-12, -44, 10, 8, 3)
      graphics.strokeRoundedRect(2, -44, 10, 8, 3)
      graphics.lineBetween(-2, -40, 2, -40)
    }

    const npc = this.add.container(x, y, [graphics])
    npc.setData('isCurrent', isCurrent)

    if (isCurrent) {
      npc.setDepth(5)
      npc.setScale(1.18)
      this.tweens.add({
        targets: npc,
        scaleX: 1.22,
        scaleY: 1.22,
        duration: 850,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    return npc
  }

  private fitCamera() {
    const width = this.scale.width
    const height = this.scale.height
    const zoom = Math.min(width / 900, height / 500)

    this.cameras.main.setZoom(zoom)
    this.cameras.main.centerOn(450, 250)
  }
}
