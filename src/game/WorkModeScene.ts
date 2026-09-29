import Phaser from 'phaser'
import type {
  WorkCustomerDefinition,
  WorkScenarioChoice,
  WorkWorldFlag,
} from '../domain/types'

export type WorkVisualStage = 'total' | 'scenario' | 'change' | 'done'

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

const customerColors = [0xe9936f, 0x6da9cb, 0x9a82c5]

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
        customer.name.charAt(0),
        customerColors[index % customerColors.length],
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
    }

    this.statusText.setText(stageLabel[this.view.stage])
    this.posText.setText(
      this.view.stage === 'done'
        ? '✓ Sẵn sàng gọi khách tiếp theo'
        : 'Nhân viên tập sự đang phục vụ tại quầy',
    )

    const statusColor =
      this.view.stage === 'scenario'
        ? 0xf3c34d
        : this.view.stage === 'done'
          ? 0x59b887
          : 0x8fc5ad

    const indicator = this.add
      .circle(730, 317, 7, statusColor, 1)
      .setStrokeStyle(2, 0xffffff, 1)

    this.dynamicLayer.add(indicator)

    if (this.view.stage === 'scenario') {
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
          'TÌNH HUỐNG PHÁT SINH',
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
          'Xem lựa chọn bên dưới để xử lý trước khi thanh toán',
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
    initial: string,
    color: number,
    isCurrent: boolean,
  ) {
    const shadow = this.add.ellipse(0, 23, 42, 13, 0x27483e, 0.14)
    const body = this.add
      .rectangle(0, 6, 38, 45, color, 1)
      .setStrokeStyle(3, 0xffffff, 1)
    const head = this.add
      .circle(0, -22, 18, 0xffe2bd, 1)
      .setStrokeStyle(3, 0xffffff, 1)
    const initialText = this.add
      .text(0, -22, initial, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#604e39',
      })
      .setOrigin(0.5)

    const npc = this.add.container(x, y, [shadow, body, head, initialText])
    npc.setData('isCurrent', isCurrent)

    if (isCurrent) {
      npc.setDepth(5)
      this.tweens.add({
        targets: npc,
        scaleX: 1.03,
        scaleY: 1.03,
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
