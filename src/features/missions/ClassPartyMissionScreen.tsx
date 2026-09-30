import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CircleAlert, LockKeyhole, ShoppingBasket, Star, Trash2, Users, Wallet, X } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { firstMission, getMissionById } from '../../data/missions'
import { getProductsByStall, products } from '../../data/products'
import { stalls } from '../../data/stalls'
import { evaluateMission } from '../../domain/missionEngine'
import { scoreShoppingMission, type HiddenScoreBreakdown } from '../../domain/scoring'
import { playGameSfx } from '../../lib/audioEngine'
import type { CartLine, ProductStallId } from '../../domain/types'
import { useMissionCartStore } from '../../store/missionCart'
import { useProgressionStore } from '../../store/progression'
import { Modal } from '../system/Modal'
import { money, ProductImage, QuantityControl, shopLabels, ShoppingProduct } from '../smartmart/ShoppingProducts'

const EMPTY_CART: CartLine[] = []
const EMPTY_EVENT_IDS: string[] = []
const shoppingStalls: ProductStallId[] = ['produce', 'food', 'drinks', 'supplies']

export function ClassPartyMissionScreen({ missionId = firstMission.id, onBack, initialStall = 'produce', onWork }: { missionId?: string; onBack: () => void; initialStall?: ProductStallId; onWork: () => void }) {
  const mission = getMissionById(missionId)
  const [activeStall, setActiveStall] = useState<ProductStallId>(initialStall)
  const [checkoutAttempted, setCheckoutAttempted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [checkoutAttempts, setCheckoutAttempts] = useState(0)
  const [runResult, setRunResult] = useState<HiddenScoreBreakdown | null>(null)
  const runStartedAtRef = useRef(Date.now())
  const feedbackRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const carts = useMissionCartStore(state => state.carts)
  const cart = carts[mission.id] ?? EMPTY_CART
  const addItem = useMissionCartStore(state => state.addItem)
  const removeItem = useMissionCartStore(state => state.removeItem)
  const clearCart = useMissionCartStore(state => state.clearCart)
  const revealedEventIds = useMissionCartStore(
    state =>
      state.revealedEventIdsByMission?.[mission.id] ?? EMPTY_EVENT_IDS,
  )
  const revealEvents = useMissionCartStore(state => state.revealEvents)
  const completeMission = useProgressionStore(state => state.completeMission)
  const awardXpOnce = useProgressionStore(state => state.awardXpOnce)
  const recordActivityResult = useProgressionStore(state => state.recordActivityResult)
  const claimChallengeReward = useProgressionStore(state => state.claimChallengeReward)
  const level = useProgressionStore(state => state.level)
  const completedMissionIds = useProgressionStore(state => state.completedMissionIds)
  const completed = completedMissionIds.includes(mission.id)
  const unlocked = useProgressionStore(state => state.unlockedStalls)
  const quantityById = new Map(cart.map(line => [line.productId, line.quantity]))
  const count = cart.reduce((total, line) => total + line.quantity, 0)

  useEffect(() => {
    const newlyRevealed = (mission.dynamicEvents ?? [])
      .filter(
        event =>
          count >= event.revealAfterItems &&
          !revealedEventIds.includes(event.id),
      )
      .map(event => event.id)

    if (newlyRevealed.length > 0) {
      revealEvents(mission.id, newlyRevealed)
      playGameSfx('consequence')
    }
  }, [count, mission, revealEvents, revealedEventIds])

  const evaluation = useMemo(
    () => evaluateMission(mission, products, cart, revealedEventIds),
    [cart, mission, revealedEventIds],
  )
  const showResult = Boolean(runResult)
  const prerequisiteReady = !mission.prerequisiteMissionId || completedMissionIds.includes(mission.prerequisiteMissionId)
  const requiredStallsReady = mission.id === firstMission.id
    ? stalls.every(stall => unlocked.includes(stall.id))
    : mission.requiredStalls.every(stallId => unlocked.includes(stallId))
  const ready = level >= mission.unlockLevel && prerequisiteReady && requiredStallsReady

  const changeQuantity = (id: string, add: boolean) => {
    const product = products.find(item => item.id === id)!

    if (add && evaluation.unavailableProductIds.includes(id)) {
      setNotice(product.name + ' đang tạm hết hàng.')
      return
    }

    if (add) addItem(mission.id, id)
    else removeItem(mission.id, id)
    setCheckoutAttempted(false)
    setNotice(`${add ? 'Đã thêm' : 'Đã bớt'} ${product.name.toLowerCase()}.`)
  }
  const checkout = () => {
    const nextAttempts = checkoutAttempts + 1
    setCheckoutAttempts(nextAttempts)
    setCheckoutAttempted(true)

    if (evaluation.success) {
      const elapsedMs = Date.now() - runStartedAtRef.current
      const result = scoreShoppingMission(
        mission,
        evaluation,
        nextAttempts,
        elapsedMs,
      )
      setRunResult(result)
      completeMission(mission.id)
      awardXpOnce(
        `mission:${mission.id}:v${mission.version}`,
        mission.xpReward,
      )
      recordActivityResult(
        `mission:${mission.id}:v${mission.version}`,
        result.stars,
        result.total,
        elapsedMs,
      )

      if (mission.coinReward) {
        claimChallengeReward(
          `mission-complete:${mission.id}:v${mission.version}`,
          mission.coinReward,
        )
      }

      if (
        mission.teacherChallenge &&
        result.stars >= mission.teacherChallenge.requiredStars
      ) {
        const claimed = claimChallengeReward(
          mission.teacherChallenge.id,
          mission.teacherChallenge.coinReward,
        )
        if (claimed) playGameSfx('coin')
      }

      playGameSfx('mission-complete')
      setCartOpen(false)
    } else {
      playGameSfx('retry')
      requestAnimationFrame(() => feedbackRef.current?.focus())
    }
  }
  const friendlyReason = (reason: string) => shoppingStalls.reduce((text, id) => text.replace(`Gian ${id}`, `Gian ${shopLabels[id]}`), reason)
  const chooseStall = (id: ProductStallId) => { setActiveStall(id); setNotice('') }

  if (!ready) return <section className="shopping-locked"><LockKeyhole size={40} /><h1>Nhiệm vụ này chưa mở</h1><p>Cần Cấp {mission.unlockLevel}{mission.id === firstMission.id ? ', mở đủ 5 gian SmartMart' : ''}{mission.prerequisiteMissionId ? ' và hoàn thành nhiệm vụ trước' : ''}.</p><button type="button" className="adventure-button" onClick={onBack}>Quay lại SmartMart<ArrowRight size={20} /></button></section>

  const cartContents = <>
    <div className="basket-goals"><h3>Đủ phần cho cả lớp</h3>{mission.requiredStalls.map(id => <div key={id} className={evaluation.coverageByStall[id] >= evaluation.effectivePeople ? 'goal-done' : ''}><span>{evaluation.coverageByStall[id] >= evaluation.effectivePeople ? <Check size={18} /> : <span className="goal-dot" />}{shopLabels[id]}</span><strong>{evaluation.coverageByStall[id]}/{evaluation.effectivePeople} bạn</strong></div>)}</div>
    <div className="basket-lines">{cart.length === 0 ? <div className="basket-empty"><ShoppingBasket size={38} /><strong>Giỏ hàng đang chờ em</strong><p>Chọn món trên kệ để chuẩn bị liên hoan.</p></div> : cart.map(line => { const product = products.find(item => item.id === line.productId); if (!product) return null; return <article className="basket-line" key={line.productId}><ProductImage product={product} /><div><h3>{product.name}</h3><span>{money.format(product.price * line.quantity)}đ</span><QuantityControl name={product.name} quantity={line.quantity} disableAdd={evaluation.unavailableProductIds.includes(product.id)} onAdd={() => changeQuantity(product.id, true)} onRemove={() => changeQuantity(product.id, false)} /></div></article> })}</div>
    <dl className="basket-totals"><div><dt>Đã chọn</dt><dd>{money.format(evaluation.spent)}đ</dd></div><div className={evaluation.remaining < mission.reserveRequired ? 'budget-warning' : ''}><dt>Còn lại</dt><dd>{money.format(evaluation.remaining)}đ</dd></div></dl>
    <p className="reserve-note"><Wallet size={17} />Cần giữ lại ít nhất {money.format(mission.reserveRequired)}đ.</p>
    {checkoutAttempted && !evaluation.success ? <div ref={feedbackRef} tabIndex={-1} role="alert" className="checkout-errors"><strong>Còn một chút cần điều chỉnh</strong><ul>{evaluation.reasons.map(reason => <li key={reason}>{friendlyReason(reason)}</li>)}</ul></div> : null}
    <button type="button" className="adventure-button checkout-action" disabled={!cart.length} onClick={checkout}><ShoppingBasket size={20} />Thanh toán & kiểm tra</button>
    <button type="button" className="quiet-button clear-basket" disabled={!cart.length} onClick={() => { setCartOpen(false); setClearOpen(true) }}><Trash2 size={17} />Làm lại giỏ hàng</button>
  </>

  return <section className={`party-mission ${showResult ? 'mission-finished' : ''}`}>
    <div className="shop-toolbar"><button type="button" className="quiet-button" onClick={onBack}><ArrowLeft size={18} />Quay lại SmartMart</button><span className="mission-mode-label">{completed ? <Check size={17} /> : <ShoppingBasket size={17} />}{completed ? 'Đã hoàn thành nhiệm vụ' : 'Mua sắm cho cả lớp'}</span></div>
    {showResult && runResult ? <div className="mission-result"><img src={gameAssets.production.party} alt="Các bạn cùng vui sau khi hoàn thành nhiệm vụ" /><div><BadgeCheck size={42} /><p className="eyebrow">NHIỆM VỤ HOÀN THÀNH</p><h1>{runResult.stars === 5 ? 'Trọn vẹn 5 sao!' : 'Một chuyến mua sắm đáng nhớ!'}</h1><div className="run-stars" aria-label={`${runResult.stars} trên 5 sao`}>{Array.from({length:5},(_,index)=><Star key={index} size={29} className={index < runResult.stars ? 'is-earned' : ''} />)}</div><p>{mission.rewardTitle}</p>{mission.teacherChallenge ? <div className={`teacher-challenge-result ${runResult.stars === 5 ? 'is-complete' : ''}`}><strong>{mission.teacherChallenge.label}</strong><span>{runResult.stars === 5 ? `Hoàn thành · +${mission.teacherChallenge.coinReward} xu` : 'Chơi lại để chinh phục 5 sao.'}</span></div> : null}<div className="mission-score-breakdown"><span>Lập kế hoạch<strong>{Math.round(runResult.accuracy)}/30</strong></span><span>Thời gian<strong>{Math.round(runResult.time)}/20</strong></span><span>Tài nguyên<strong>{Math.round(runResult.resources)}/20</strong></span><span>Cân bằng lựa chọn<strong>{Math.round(runResult.decisions)}/20</strong></span><span>Mục tiêu<strong>{Math.round(runResult.objectives)}/10</strong></span></div>{mission.softGoals?.length ? <div className="mission-soft-reflection"><h2>Những thông tin em đã cân nhắc</h2>{mission.softGoals.map(goal => { const achieved = evaluation.softGoalResults.find(item => item.id === goal.id)?.achieved ?? false; return <article key={goal.id} className={achieved ? 'is-achieved' : ''}><Check size={18} /><div><strong>{goal.title}</strong><p>{goal.description}</p><span>{achieved ? 'Đã cân bằng tốt trong lượt này.' : 'Có thể thử một cách khác ở lượt sau.'}</span></div></article> })}</div> : null}<div className="mission-result-summary"><span>Đã chi<strong>{money.format(evaluation.spent)}đ</strong></span><span>Giữ lại<strong>{money.format(evaluation.remaining)}đ</strong></span></div><p>Điểm chỉ được tổng kết sau khi em hoàn thành. Có nhiều cách khác nhau để tạo một giỏ hàng tốt.</p><button className="adventure-button" type="button" onClick={onWork}>Tiếp tục hành trình<ArrowRight size={19} /></button><button type="button" className="quiet-button" onClick={() => { setCheckoutAttempted(false); setRunResult(null); setCheckoutAttempts(0); runStartedAtRef.current = Date.now() }}>Chơi lại để nâng sao</button></div></div> : <>
      <header className="party-brief"><div><p className="eyebrow">NHIỆM VỤ 01 · SMARTMART</p><h1>Liên hoan lớp</h1><p>{mission.story}</p></div><img src={gameAssets.production.party} alt="Các bạn đang chuẩn bị bàn tiệc liên hoan" /></header>
      <div className="shopping-budget"><div><Users size={22} /><span>Cả lớp<strong>{evaluation.effectivePeople} bạn</strong></span></div><div><Wallet size={22} /><span>Ngân sách<strong>{money.format(evaluation.effectiveBudget)}đ</strong></span></div><div className={evaluation.remaining < mission.reserveRequired ? 'budget-warning' : ''}><span>{evaluation.remaining < mission.reserveRequired ? <CircleAlert size={22} /> : <Wallet size={22} />}</span><span>Còn lại<strong>{money.format(evaluation.remaining)}đ</strong></span></div></div>
      {(mission.dynamicEvents ?? [])
        .filter(event => revealedEventIds.includes(event.id))
        .map(event => (
          <aside className="mission-dynamic-event" key={event.id}>
            <CircleAlert size={21} aria-hidden="true" />
            <div>
              <strong>{event.title}</strong>
              <p>{event.description}</p>
            </div>
          </aside>
        ))}
      {(mission.softGoals ?? [])
        .filter((goal) => count >= goal.revealAfterItems)
        .map((goal) => (
          <aside className="mission-clue" key={goal.id}>
            <CircleAlert size={20} aria-hidden="true" />
            <div>
              <strong>{goal.title}</strong>
              <p>{goal.description}</p>
            </div>
          </aside>
        ))}
      <div className="shopping-layout">
        <div className={`shopping-shelves shop-${activeStall}`}>
          <div className="shop-tabs" role="tablist" aria-label="Gian hàng mua sắm" ref={tabsRef}>{shoppingStalls.map((id,index) => <button key={id} type="button" role="tab" id={`shop-tab-${id}`} aria-controls="shopping-products" aria-selected={activeStall === id} tabIndex={activeStall === id ? 0 : -1} onClick={() => chooseStall(id)} onKeyDown={event => { let next = index; if (event.key === 'ArrowRight') next = (index + 1) % shoppingStalls.length; else if (event.key === 'ArrowLeft') next = (index + shoppingStalls.length - 1) % shoppingStalls.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = shoppingStalls.length - 1; else return; event.preventDefault(); chooseStall(shoppingStalls[next]); (tabsRef.current?.children[next] as HTMLButtonElement)?.focus() }}><span>{shopLabels[id]}</span>{mission.requiredStalls.includes(id) ? <small>{evaluation.coverageByStall[id] >= evaluation.effectivePeople ? <Check size={14} /> : null}{evaluation.coverageByStall[id]}/{evaluation.effectivePeople}</small> : <small>Tùy chọn</small>}</button>)}</div>
          <div className="shelf-heading"><div><p className="eyebrow">CHỌN MÓN CHO CẢ LỚP</p><h2>{shopLabels[activeStall]}</h2><p>{activeStall === 'supplies' ? 'Đồ dùng thêm cho buổi tiệc. Nhớ giữ đủ tiền dự phòng nhé.' : `Chọn đủ phần cho ${evaluation.effectivePeople} bạn. Em có thể đổi món bất cứ lúc nào.`}</p></div><img src={gameAssets.production.stalls[activeStall]} alt="" /></div>
          <div id="shopping-products" role="tabpanel" aria-labelledby={`shop-tab-${activeStall}`} className="shelf-grid">{getProductsByStall(activeStall).map(product => <ShoppingProduct key={product.id} product={product} quantity={quantityById.get(product.id) ?? 0} unavailable={evaluation.unavailableProductIds.includes(product.id)} onAdd={() => changeQuantity(product.id,true)} onRemove={() => changeQuantity(product.id,false)} />)}</div>
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
