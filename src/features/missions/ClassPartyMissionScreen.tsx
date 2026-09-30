import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CircleAlert, LockKeyhole, ShoppingBasket, Trash2, Users, Wallet, X } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { firstMission } from '../../data/missions'
import { getProductsByStall, products } from '../../data/products'
import { stalls } from '../../data/stalls'
import { evaluateMission } from '../../domain/missionEngine'
import type { CartLine, ProductStallId } from '../../domain/types'
import { useMissionCartStore } from '../../store/missionCart'
import { useProgressionStore } from '../../store/progression'
import { Modal } from '../system/Modal'
import { money, ProductImage, QuantityControl, shopLabels, ShoppingProduct } from '../smartmart/ShoppingProducts'

const EMPTY_CART: CartLine[] = []
const shoppingStalls: ProductStallId[] = ['produce', 'food', 'drinks', 'supplies']

export function ClassPartyMissionScreen({ onBack, initialStall = 'produce', onWork }: { onBack: () => void; initialStall?: ProductStallId; onWork: () => void }) {
  const mission = firstMission
  const [activeStall, setActiveStall] = useState<ProductStallId>(initialStall)
  const [checkoutAttempted, setCheckoutAttempted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const feedbackRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const carts = useMissionCartStore(state => state.carts)
  const cart = carts[mission.id] ?? EMPTY_CART
  const addItem = useMissionCartStore(state => state.addItem)
  const removeItem = useMissionCartStore(state => state.removeItem)
  const clearCart = useMissionCartStore(state => state.clearCart)
  const completeMission = useProgressionStore(state => state.completeMission)
  const completed = useProgressionStore(state => state.completedMissionIds.includes(mission.id))
  const unlocked = useProgressionStore(state => state.unlockedStalls)
  const evaluation = useMemo(() => evaluateMission(mission, products, cart), [cart, mission])
  const quantityById = new Map(cart.map(line => [line.productId, line.quantity]))
  const count = cart.reduce((total, line) => total + line.quantity, 0)
  const showResult = checkoutAttempted && evaluation.success
  const ready = stalls.every(stall => unlocked.includes(stall.id))

  const changeQuantity = (id: string, add: boolean) => {
    const product = products.find(item => item.id === id)!
    if (add) addItem(mission.id, id)
    else removeItem(mission.id, id)
    setCheckoutAttempted(false)
    setNotice(`${add ? 'Đã thêm' : 'Đã bớt'} ${product.name.toLowerCase()}.`)
  }
  const checkout = () => {
    setCheckoutAttempted(true)
    if (evaluation.success) { completeMission(mission.id); setCartOpen(false) }
    else requestAnimationFrame(() => feedbackRef.current?.focus())
  }
  const friendlyReason = (reason: string) => shoppingStalls.reduce((text, id) => text.replace(`Gian ${id}`, `Gian ${shopLabels[id]}`), reason)
  const chooseStall = (id: ProductStallId) => { setActiveStall(id); setNotice('') }

  if (!ready) return <section className="shopping-locked"><LockKeyhole size={40} /><h1>Cùng mở đủ các gian hàng nhé!</h1><p>Hoàn thành bài Toán ở 5 gian để bắt đầu liên hoan lớp.</p><button type="button" className="adventure-button" onClick={onBack}>Quay lại SmartMart<ArrowRight size={20} /></button></section>

  const cartContents = <>
    <div className="basket-goals"><h3>Đủ phần cho cả lớp</h3>{mission.requiredStalls.map(id => <div key={id} className={evaluation.coverageByStall[id] >= mission.people ? 'goal-done' : ''}><span>{evaluation.coverageByStall[id] >= mission.people ? <Check size={18} /> : <span className="goal-dot" />}{shopLabels[id]}</span><strong>{evaluation.coverageByStall[id]}/{mission.people} bạn</strong></div>)}</div>
    <div className="basket-lines">{cart.length === 0 ? <div className="basket-empty"><ShoppingBasket size={38} /><strong>Giỏ hàng đang chờ em</strong><p>Chọn món trên kệ để chuẩn bị liên hoan.</p></div> : cart.map(line => { const product = products.find(item => item.id === line.productId); if (!product) return null; return <article className="basket-line" key={line.productId}><ProductImage product={product} /><div><h3>{product.name}</h3><span>{money.format(product.price * line.quantity)}đ</span><QuantityControl name={product.name} quantity={line.quantity} onAdd={() => changeQuantity(product.id, true)} onRemove={() => changeQuantity(product.id, false)} /></div></article> })}</div>
    <dl className="basket-totals"><div><dt>Đã chọn</dt><dd>{money.format(evaluation.spent)}đ</dd></div><div className={evaluation.remaining < mission.reserveRequired ? 'budget-warning' : ''}><dt>Còn lại</dt><dd>{money.format(evaluation.remaining)}đ</dd></div></dl>
    <p className="reserve-note"><Wallet size={17} />Cần giữ lại ít nhất {money.format(mission.reserveRequired)}đ.</p>
    {checkoutAttempted && !evaluation.success ? <div ref={feedbackRef} tabIndex={-1} role="alert" className="checkout-errors"><strong>Còn một chút cần điều chỉnh</strong><ul>{evaluation.reasons.map(reason => <li key={reason}>{friendlyReason(reason)}</li>)}</ul></div> : null}
    <button type="button" className="adventure-button checkout-action" disabled={!cart.length} onClick={checkout}><ShoppingBasket size={20} />Thanh toán & kiểm tra</button>
    <button type="button" className="quiet-button clear-basket" disabled={!cart.length} onClick={() => { setCartOpen(false); setClearOpen(true) }}><Trash2 size={17} />Làm lại giỏ hàng</button>
  </>

  return <section className={`party-mission ${showResult ? 'mission-finished' : ''}`}>
    <div className="shop-toolbar"><button type="button" className="quiet-button" onClick={onBack}><ArrowLeft size={18} />Quay lại SmartMart</button><span className="mission-mode-label">{completed ? <Check size={17} /> : <ShoppingBasket size={17} />}{completed ? 'Đã hoàn thành nhiệm vụ' : 'Mua sắm cho cả lớp'}</span></div>
    {showResult ? <div className="mission-result"><img src={gameAssets.production.party} alt="Các bạn cùng vui trong buổi liên hoan" /><div><BadgeCheck size={42} /><p className="eyebrow">NHIỆM VỤ HOÀN THÀNH</p><h1>Một giỏ hàng thật chu đáo!</h1><p>{mission.rewardTitle}</p><div className="mission-result-summary"><span>Đã chi<strong>{money.format(evaluation.spent)}đ</strong></span><span>Giữ lại<strong>{money.format(evaluation.remaining)}đ</strong></span></div><p>Em đã mua đủ hoa quả, đồ ăn và đồ uống cho {mission.people} bạn, đồng thời giữ đủ khoản dự phòng.</p><button className="adventure-button" type="button" onClick={onWork}>Khám phá công việc thu ngân<ArrowRight size={19} /></button><button type="button" className="quiet-button" onClick={() => setCheckoutAttempted(false)}>Xem lại và thử cách mua khác</button></div></div> : <>
      <header className="party-brief"><div><p className="eyebrow">NHIỆM VỤ 01 · SMARTMART</p><h1>Liên hoan lớp</h1><p>{mission.story}</p></div><img src={gameAssets.production.party} alt="Các bạn đang chuẩn bị bàn tiệc liên hoan" /></header>
      <div className="shopping-budget"><div><Users size={22} /><span>Cả lớp<strong>{mission.people} bạn</strong></span></div><div><Wallet size={22} /><span>Ngân sách<strong>{money.format(mission.budget)}đ</strong></span></div><div className={evaluation.remaining < mission.reserveRequired ? 'budget-warning' : ''}><span>{evaluation.remaining < mission.reserveRequired ? <CircleAlert size={22} /> : <Wallet size={22} />}</span><span>Còn lại<strong>{money.format(evaluation.remaining)}đ</strong></span></div></div>
      <div className="shopping-layout">
        <div className={`shopping-shelves shop-${activeStall}`}>
          <div className="shop-tabs" role="tablist" aria-label="Gian hàng mua sắm" ref={tabsRef}>{shoppingStalls.map((id,index) => <button key={id} type="button" role="tab" id={`shop-tab-${id}`} aria-controls="shopping-products" aria-selected={activeStall === id} tabIndex={activeStall === id ? 0 : -1} onClick={() => chooseStall(id)} onKeyDown={event => { let next = index; if (event.key === 'ArrowRight') next = (index + 1) % shoppingStalls.length; else if (event.key === 'ArrowLeft') next = (index + shoppingStalls.length - 1) % shoppingStalls.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = shoppingStalls.length - 1; else return; event.preventDefault(); chooseStall(shoppingStalls[next]); (tabsRef.current?.children[next] as HTMLButtonElement)?.focus() }}><span>{shopLabels[id]}</span>{mission.requiredStalls.includes(id) ? <small>{evaluation.coverageByStall[id] >= mission.people ? <Check size={14} /> : null}{evaluation.coverageByStall[id]}/{mission.people}</small> : <small>Tùy chọn</small>}</button>)}</div>
          <div className="shelf-heading"><div><p className="eyebrow">CHỌN MÓN CHO CẢ LỚP</p><h2>{shopLabels[activeStall]}</h2><p>{activeStall === 'supplies' ? 'Đồ dùng thêm cho buổi tiệc. Nhớ giữ đủ tiền dự phòng nhé.' : `Chọn đủ phần cho ${mission.people} bạn. Em có thể đổi món bất cứ lúc nào.`}</p></div><img src={gameAssets.production.stalls[activeStall]} alt="" /></div>
          <div id="shopping-products" role="tabpanel" aria-labelledby={`shop-tab-${activeStall}`} className="shelf-grid">{getProductsByStall(activeStall).map(product => <ShoppingProduct key={product.id} product={product} quantity={quantityById.get(product.id) ?? 0} onAdd={() => changeQuantity(product.id,true)} onRemove={() => changeQuantity(product.id,false)} />)}</div>
          <p className="shopping-hint">Giỏ hàng được giữ trên thiết bị này khi em đổi gian hoặc tải lại trang.</p>
        </div>
        <aside className="desktop-basket" aria-label="Giỏ hàng"><header><ShoppingBasket size={22} /><h2>Giỏ của em</h2><span>{count} món</span></header>{!cartOpen ? cartContents : null}</aside>
      </div>
      <div className="mobile-basket-bar"><div><span>Giỏ của em · {count} món</span><strong>{money.format(evaluation.spent)}đ</strong></div><button type="button" className="adventure-button" onClick={() => setCartOpen(true)}><ShoppingBasket size={20} />Xem giỏ hàng</button></div>
    </>}
    <span className="sr-only" role="status">{notice}</span>
    {cartOpen ? <Modal title={`Giỏ của em · ${count} món`} className="basket-sheet" onClose={() => setCartOpen(false)}>{cartContents}</Modal> : null}
    {clearOpen ? <Modal title="Làm lại giỏ hàng?" onClose={() => setClearOpen(false)}><p>Em sẽ chọn lại các món từ đầu. Thành tích nhiệm vụ đã hoàn thành vẫn được giữ.</p><div className="modal-actions"><button type="button" className="outline-button" onClick={() => setClearOpen(false)}>Giữ giỏ hiện tại</button><button type="button" className="adventure-button" onClick={() => { clearCart(mission.id); setCheckoutAttempted(false); setClearOpen(false); setNotice('Đã làm mới giỏ hàng.') }}>Chọn lại từ đầu</button></div></Modal> : null}
  </section>
}
