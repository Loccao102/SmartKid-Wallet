import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, LockKeyhole, ShoppingBasket } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { getProductsByStall } from '../../data/products'
import type { ProductStallId, StallDefinition } from '../../domain/types'
import { ShoppingProduct } from './ShoppingProducts'

export function StallShoppingScreen({ stall, missionUnlocked, onBack, onPractice, onStartMission }: { stall: StallDefinition; missionUnlocked: boolean; onBack: () => void; onPractice: () => void; onStartMission: (stall?: ProductStallId) => void }) {
  const title = useRef<HTMLHeadingElement>(null)
  const catalog = stall.id === 'promotion' ? [] : getProductsByStall(stall.id)
  useEffect(() => { title.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }) }, [])
  return <section className={`stall-shop shop-${stall.id}`}>
    <div className="shop-toolbar"><button className="quiet-button" type="button" onClick={onBack}><ArrowLeft size={18} />Các gian SmartMart</button><button className="outline-button" type="button" onClick={onPractice}><BookOpen size={18} />Luyện Toán</button></div>
    <header className="stall-shop-hero"><div><p className="eyebrow">GIAN HÀNG ĐÃ MỞ</p><h1 ref={title} tabIndex={-1}>{stall.name}</h1><p>{stall.description}</p><span className="shop-tip">{catalog.length ? 'Cùng xem giá và chọn những món phù hợp cho cả lớp.' : 'Luyện tính giá sau giảm và so sánh các ưu đãi.'}</span></div><img src={gameAssets.production.stalls[stall.id]} alt="" /></header>
    {catalog.length ? <div className="shelf-grid">{catalog.map(product => <ShoppingProduct key={product.id} product={product} />)}</div> : <div className="promotion-invitation"><BookOpen size={32} /><h2>Mua sắm có tính toán</h2><p>Luyện cách tính phần trăm trước khi chọn ưu đãi nhé.</p><button type="button" className="adventure-button" onClick={onPractice}>Luyện tập khuyến mãi<ArrowRight size={18} /></button></div>}
    <div className="shop-next-step"><ShoppingBasket size={26} aria-hidden="true" /><div><h2>Mua sắm cho liên hoan lớp</h2><p>{missionUnlocked ? 'Lập giỏ hàng và giữ lại khoản dự phòng cho cả lớp.' : 'Mở đủ 5 gian bằng Toán để bắt đầu nhiệm vụ mua sắm.'}</p></div><button type="button" className="adventure-button" disabled={!missionUnlocked} onClick={() => onStartMission(stall.id === 'promotion' ? undefined : stall.id)}>{missionUnlocked ? 'Lập giỏ hàng' : 'Mở đủ 5 gian'}{missionUnlocked ? <ArrowRight size={18} /> : <LockKeyhole size={18} />}</button></div>
  </section>
}
