import { ArrowRight, Check, Compass, LockKeyhole, MapPin, Paintbrush, ShoppingBasket, Sparkles } from 'lucide-react'
import { mapAssetPacks } from '../../assets/registry'
import { AvatarCharacter } from '../../components/avatar/AvatarCharacter'
import { resolveWorldUnlockState } from '../../core/worldChapter/unlock'
import { worldMaps } from '../../data/worldMaps'
import { stalls } from '../../data/stalls'
import type { MapId } from '../../domain/types'
import { useAvatarProfileStore } from '../../store/avatarProfile'
import { useProgressionStore } from '../../store/progression'

export function WorldMapScreen({ onOpenMap, onEditAvatar }: {
  onOpenMap: (mapId: MapId) => void
  onEditAvatar: () => void
}) {
  const avatar = useAvatarProfileStore(state => state.avatar)
  const hasCreatedAvatar = useAvatarProfileStore(state => state.hasCreatedAvatar)
  const unlockedStalls = useProgressionStore(state => state.unlockedStalls)
  const completedMissionIds = useProgressionStore(state => state.completedMissionIds)
  const completedWorldChapterIds = useProgressionStore(state => state.completedWorldChapterIds)
  const unlockMap = useProgressionStore(state => state.unlockMap)
  const level = useProgressionStore(state => state.level)
  const count = stalls.filter(stall => unlockedStalls.includes(stall.id)).length
  const enterMap = (id: MapId) => { unlockMap(id); onOpenMap(id) }

  return <section className="explorer-world" aria-labelledby="world-title">
    <header className="explorer-heading">
      <div><p className="eyebrow"><Compass size={17} aria-hidden="true" /> HÀNH TRÌNH CỦA EM</p>
        <h1 id="world-title">Thế giới nhỏ. <span>Khám phá lớn.</span></h1>
        <p>Mang theo trí tò mò. Mỗi chuyến đi là một điều mới!</p>
      </div>
      <button className="explorer-avatar-link" type="button" onClick={onEditAvatar}>
        <span className="explorer-mini-avatar"><AvatarCharacter config={avatar} decorative /></span>
        <span><strong>{hasCreatedAvatar ? 'Nhân vật của em' : 'Tạo nhân vật của em'}</strong><small>Chọn một phong cách riêng</small></span>
        <Paintbrush size={20} aria-hidden="true" />
      </button>
    </header>
    <article className="chapter-hero" aria-labelledby="smartmart-chapter">
      <div className="chapter-story">
        <span className="chapter-label"><span>01</span> CHUYẾN PHIÊU LƯU ĐẦU TIÊN</span>
        <h2 id="smartmart-chapter">Một ngày ở<br /><em>SmartMart</em></h2>
        <p>Một giỏ hàng, thật nhiều điều hay! Cùng giải Toán, mở từng gian hàng và trở thành người mua sắm thông minh.</p>
        <div className="chapter-tags"><span><ShoppingBasket size={16} /> 5 gian hàng</span><span><Sparkles size={16} /> Toán trong cuộc sống</span></div>
        <button className="adventure-button chapter-start" type="button" onClick={() => enterMap('smartmart')}>
          {count ? 'Tiếp tục khám phá' : 'Bắt đầu khám phá'}<ArrowRight size={21} aria-hidden="true" />
        </button>
        <span className="chapter-help">Giải Toán để mở gian · Học theo nhịp của em</span>
      </div>
      <div className="chapter-art">
        <img src={mapAssetPacks.smartmart.scene} srcSet={mapAssetPacks.smartmart.thumbnail + ' 600w, ' + mapAssetPacks.smartmart.scene + ' 1280w'} sizes="(max-width: 700px) 100vw, 60vw" width="1280" height="853" alt={mapAssetPacks.smartmart.description} fetchPriority="high" />
        <span className="chapter-location"><MapPin size={16} aria-hidden="true" /> Thị trấn SmartKid</span>
        <div className="chapter-companion"><AvatarCharacter config={avatar} decorative /><span>Đi cùng mình nhé!</span></div>
      </div>
    </article>
    <section className="trail-progress" aria-label="Tiến trình mở gian SmartMart">
      <div><span className="eyebrow">TỪNG BƯỚC KHÁM PHÁ</span><strong>{count}/5 gian hàng đã mở</strong></div>
      <ol>{stalls.map(stall => <li key={stall.id} className={unlockedStalls.includes(stall.id) ? 'is-complete' : ''}>
        <span>{unlockedStalls.includes(stall.id) ? <Check size={17} aria-hidden="true" /> : stall.order}</span>
        <small>{stall.name === 'Rau củ & Hoa quả' ? 'Rau củ' : stall.name}</small>
      </li>)}</ol>
    </section>
    <section className="next-chapters" aria-labelledby="next-chapters-title">
      <header><div><p className="eyebrow">CÒN NHIỀU ĐIỀU ĐỂ KHÁM PHÁ</p><h2 id="next-chapters-title">Những miền đất tiếp theo</h2></div><span>Mỗi nơi, một câu chuyện</span></header>
      <div className="chapter-grid">{worldMaps.filter(map => map.id !== 'smartmart').map(map => {
        const art = mapAssetPacks[map.id]
        const unlock = resolveWorldUnlockState(map, { level, completedMissionIds, completedWorldChapterIds })
        return <article className={'chapter-preview theme-' + art.theme} key={map.id}>
          <div className="chapter-preview-art"><img src={art.thumbnail} width="600" height="400" alt={art.description} loading="lazy" decoding="async" /><span className="chapter-number">0{map.order}</span></div>
          <div className="chapter-preview-copy"><h3>{map.name}</h3><p>{map.description}</p>
            {unlock.playable ? <button className="quiet-button" type="button" onClick={() => enterMap(map.id)}>Khám phá<ArrowRight size={18} /></button> : <span className="chapter-lock"><LockKeyhole size={16} aria-hidden="true" />{map.status !== 'available' ? 'Đang chuẩn bị cho em' : unlock.reason}</span>}
          </div>
        </article>
      })}</div>
    </section>
  </section>
}
