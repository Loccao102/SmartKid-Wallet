import { useMemo, useState } from 'react'
import {
  Apple,
  ArrowLeft,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  ShoppingBasket,
  Sparkles,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { firstMission } from '../../data/missions'
import { getProductsByStall, products } from '../../data/products'
import { evaluateMission } from '../../domain/missionEngine'
import type { ProductDefinition, ProductStallId } from '../../domain/types'
import { useMissionCartStore } from '../../store/missionCart'
import { useProgressionStore } from '../../store/progression'

const stallMeta: Record<
  ProductStallId,
  { label: string; icon: LucideIcon; description: string }
> = {
  produce: {
    label: 'Hoa quả',
    icon: Apple,
    description: 'Chọn trái cây đủ cho cả lớp.',
  },
  food: {
    label: 'Đồ ăn',
    icon: Package,
    description: 'Chọn đồ ăn phù hợp với ngân sách.',
  },
  drinks: {
    label: 'Đồ uống',
    icon: Coffee,
    description: 'Đảm bảo đủ đồ uống cho 20 bạn.',
  },
  supplies: {
    label: 'Đồ dùng',
    icon: ShoppingBasket,
    description: 'Đồ dùng hỗ trợ cho buổi liên hoan.',
  },
}

const money = new Intl.NumberFormat('vi-VN')

function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
}: {
  product: ProductDefinition
  quantity: number
  onAdd: () => void
  onRemove: () => void
}) {
  const Icon = stallMeta[product.stallId].icon

  return (
    <article className="mission-product-card">
      <div className="mission-product-visual" aria-hidden="true">
        <Icon size={28} strokeWidth={1.75} />
      </div>

      <div className="mission-product-copy">
        <strong>{product.name}</strong>
        <span>
          {money.format(product.price)}đ / {product.unitLabel}
        </span>
        <small>Đủ cho khoảng {product.servesPeople} bạn</small>
      </div>

      <div className="mission-product-counter" aria-label={`Số lượng ${product.name}`}>
        <button type="button" onClick={onRemove} disabled={quantity === 0} aria-label={`Bớt ${product.name}`}>
          <Minus size={14} />
        </button>
        <strong>{quantity}</strong>
        <button type="button" onClick={onAdd} aria-label={`Thêm ${product.name}`}>
          <Plus size={14} />
        </button>
      </div>
    </article>
  )
}

export function ClassPartyMissionScreen({ onBack }: { onBack: () => void }) {
  const mission = firstMission
  const [activeStall, setActiveStall] = useState<ProductStallId>('produce')
  const [checkoutAttempted, setCheckoutAttempted] = useState(false)

  const cart = useMissionCartStore((state) => state.carts[mission.id] ?? [])
  const addItem = useMissionCartStore((state) => state.addItem)
  const removeItem = useMissionCartStore((state) => state.removeItem)
  const clearCart = useMissionCartStore((state) => state.clearCart)
  const completeMission = useProgressionStore((state) => state.completeMission)
  const completedMissionIds = useProgressionStore((state) => state.completedMissionIds)

  const evaluation = useMemo(
    () => evaluateMission(mission, products, cart),
    [mission, cart],
  )
  const completed = completedMissionIds.includes(mission.id)
  const activeProducts = getProductsByStall(activeStall)
  const productQuantity = new Map(cart.map((line) => [line.productId, line.quantity]))
  const cartItemCount = cart.reduce((sum, line) => sum + line.quantity, 0)

  const checkout = () => {
    setCheckoutAttempted(true)
    if (evaluation.success) completeMission(mission.id)
  }

  const resetMission = () => {
    clearCart(mission.id)
    setCheckoutAttempted(false)
  }

  return (
    <section className="mission-screen">
      <div className="smartmart-toolbar">
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={15} aria-hidden="true" />
          Quay lại SmartMart
        </button>

        <div className="mission-budget-pill">
          <Wallet size={17} aria-hidden="true" />
          <span>Còn lại</span>
          <strong>{money.format(evaluation.remaining)}đ</strong>
        </div>
      </div>

      <header className="mission-brief">
        <div className="mission-brief-icon" aria-hidden="true">
          <Target size={28} strokeWidth={1.9} />
        </div>
        <div className="mission-brief-copy">
          <p className="page-kicker">MISSION 01 · BÀI VẬN DỤNG</p>
          <h1>{mission.title}</h1>
          <p>{mission.story}</p>
        </div>

        <div className="mission-rules">
          <div>
            <Users size={17} aria-hidden="true" />
            <span>Số người</span>
            <strong>{mission.people} bạn</strong>
          </div>
          <div>
            <CircleDollarSign size={17} aria-hidden="true" />
            <span>Ngân sách</span>
            <strong>{money.format(mission.budget)}đ</strong>
          </div>
          <div>
            <Wallet size={17} aria-hidden="true" />
            <span>Phải còn</span>
            <strong>≥ {money.format(mission.reserveRequired)}đ</strong>
          </div>
        </div>
      </header>

      <div className="mission-shopping-layout">
        <main className="mission-store">
          <div className="mission-stall-tabs" role="tablist" aria-label="Các gian hàng trong nhiệm vụ">
            {mission.requiredStalls.map((stallId) => {
              const meta = stallMeta[stallId]
              const Icon = meta.icon
              const coverage = evaluation.coverageByStall[stallId]
              const done = coverage >= mission.people

              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeStall === stallId}
                  className={activeStall === stallId ? 'is-active' : ''}
                  key={stallId}
                  onClick={() => setActiveStall(stallId)}
                >
                  <span aria-hidden="true"><Icon size={18} /></span>
                  <div>
                    <strong>{meta.label}</strong>
                    <small>{coverage}/{mission.people} bạn</small>
                  </div>
                  {done ? <Check size={15} className="mission-tab-check" aria-label="Đã đủ" /> : null}
                </button>
              )
            })}
          </div>

          <div className="mission-stall-heading">
            <div>
              <p className="page-kicker">ĐANG Ở GIAN</p>
              <h2>{stallMeta[activeStall].label}</h2>
              <p>{stallMeta[activeStall].description}</p>
            </div>
            <span>
              {evaluation.coverageByStall[activeStall]}/{mission.people} người
            </span>
          </div>

          <div className="mission-product-grid">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={productQuantity.get(product.id) ?? 0}
                onAdd={() => {
                  addItem(mission.id, product.id)
                  setCheckoutAttempted(false)
                }}
                onRemove={() => {
                  removeItem(mission.id, product.id)
                  setCheckoutAttempted(false)
                }}
              />
            ))}
          </div>

          <div className="mission-roam-note">
            <RefreshCcw size={17} aria-hidden="true" />
            <p>
              Em có thể quay lại bất kỳ gian nào để đổi phương án trước khi thanh toán.
            </p>
          </div>
        </main>

        <aside className="mission-cart-panel">
          <div className="mission-cart-title">
            <div>
              <ShoppingBasket size={20} aria-hidden="true" />
              <strong>Giỏ của em</strong>
            </div>
            <span>{cartItemCount} món</span>
          </div>

          <div className="mission-requirements">
            <p className="page-kicker">MỤC TIÊU</p>
            {mission.requiredStalls.map((stallId) => {
              const coverage = evaluation.coverageByStall[stallId]
              const done = coverage >= mission.people

              return (
                <div key={stallId} className={done ? 'is-complete' : ''}>
                  <span aria-hidden="true">{done ? <Check size={13} /> : <ChevronRight size={13} />}</span>
                  <strong>{stallMeta[stallId].label}</strong>
                  <em>{coverage}/{mission.people}</em>
                </div>
              )
            })}
          </div>

          <div className="mission-cart-lines">
            {cart.length === 0 ? (
              <p className="mission-empty-cart">Chưa có sản phẩm nào trong giỏ.</p>
            ) : (
              cart.map((line) => {
                const product = products.find((item) => item.id === line.productId)
                if (!product) return null

                return (
                  <div key={line.productId}>
                    <span>{product.name} × {line.quantity}</span>
                    <strong>{money.format(product.price * line.quantity)}đ</strong>
                  </div>
                )
              })
            )}
          </div>

          <div className="mission-money-summary">
            <div>
              <span>Đã chi</span>
              <strong>{money.format(evaluation.spent)}đ</strong>
            </div>
            <div>
              <span>Còn lại</span>
              <strong className={evaluation.remaining < mission.reserveRequired ? 'is-warning' : ''}>
                {money.format(evaluation.remaining)}đ
              </strong>
            </div>
            <small>Yêu cầu giữ lại ≥ {money.format(mission.reserveRequired)}đ</small>
          </div>

          {checkoutAttempted && !evaluation.success ? (
            <div className="mission-checkout-feedback is-error">
              <strong>Chưa thể thanh toán</strong>
              {evaluation.reasons.map((reason) => <p key={reason}>{reason}</p>)}
            </div>
          ) : null}

          {completed ? (
            <div className="mission-checkout-feedback is-success">
              <Sparkles size={20} aria-hidden="true" />
              <strong>Mission hoàn thành!</strong>
              <p>{mission.rewardTitle}</p>
            </div>
          ) : null}

          <button
            type="button"
            className="mission-checkout-button"
            onClick={checkout}
            disabled={cart.length === 0 || completed}
          >
            <ShoppingBasket size={17} aria-hidden="true" />
            {completed ? 'Đã hoàn thành' : 'Thanh toán & kiểm tra'}
          </button>

          <button type="button" className="mission-clear-button" onClick={resetMission}>
            <RefreshCcw size={13} aria-hidden="true" />
            Làm lại giỏ hàng
          </button>
        </aside>
      </div>
    </section>
  )
}
