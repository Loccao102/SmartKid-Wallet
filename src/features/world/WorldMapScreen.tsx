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
  const bankMap = worldMaps.find(map => map.id === 'tiny-bank')!
  const bankReady = resolveWorldUnlockState(bankMap, { level, completedMissionIds, completedWorldChapterIds }).playable
    && !completedWorldChapterIds.includes('tiny-bank')
  const featuredId = bankReady ? 'tiny-bank' : 'smartmart'
  const featuredArt = mapAssetPacks[featuredId]
  const enterMap = (id: MapId) => { unlockMap(id); onOpenMap(id) }

  return <section className="explorer-world" aria-labelledby="world-title">
    <header className="explorer-heading">
      <div><p className="eyebrow"><Compass size={17} aria-hidden="true" /> HÀNH TRÌNH CỦA EM</p>
        <h1 id="world-title">Hôm nay, <span>mình đi đâu nhỉ?</span></h1>
        <p>Chọn một nơi, học một điều hay. Nhân vật của em đã sẵn sàng!</p>
      </div>
      <button className="explorer-avatar-link" type="button" onClick={onEditAvatar}>
        <span className="explorer-mini-avatar"><AvatarCharacter config={avatar} decorative /></span>
        <span><strong>{hasCreatedAvatar ? 'Nhân vật của em' : 'Tạo nhân vật của em'}</strong><small>Chọn một phong cách riêng</small></span>
        <Paintbrush size={20} aria-hidden="true" />
      </button>
    </header>
    <article className={'chapter-hero' + (bankReady ? ' chapter-hero-bank' : '')} aria-labelledby="featured-chapter">
      <div className="chapter-story">
        <span className="chapter-label"><span>{bankReady ? '02' : '01'}</span> {bankReady ? 'ĐIỂM ĐẾN MỚI ĐÃ MỞ' : count ? 'CHUYẾN ĐI ĐANG CHỜ EM' : 'CHUYẾN PHIÊU LƯU ĐẦU TIÊN'}</span>
        <h2 id="featured-chapter">{bankReady ? <>Gom từng chút,<br /><em>chạm ước mơ.</em></> : <>Một ngày ở<br /><em>SmartMart</em></>}</h2>
        <p>{bankReady ? 'Ngân hàng tí hon đã mở cửa! Cùng học cách để dành, theo dõi tiền và lập một kế hoạch của riêng em.' : 'Cùng ghé siêu thị, giải những bài Toán nhỏ và chọn món cho chuyến mua sắm của em.'}</p>
        <div className="chapter-tags"><span><ShoppingBasket size={16} /> {bankReady ? '4 chặng khám phá' : '5 gian hàng'}</span><span><Sparkles size={16} /> Học theo nhịp của em</span></div>
        <button className="adventure-button chapter-start" type="button" onClick={() => enterMap(featuredId)}>
          {bankReady ? 'Đến Ngân hàng tí hon' : count ? 'Tiếp tục khám phá' : 'Bắt đầu khám phá'}<ArrowRight size={21} aria-hidden="true" />
        </button>
        <span className="chapter-help">{bankReady ? 'Tiết kiệm · Mục tiêu · Kế hoạch 4 tuần' : count ? `Em đã mở ${count}/5 gian. Đi tiếp cùng mình nhé!` : 'Bắt đầu từ gian Rau củ · Mỗi gian có 3 bài Toán'}</span>
      </div>
      <div className="chapter-art">
        <img src={featuredArt.scene} srcSet={featuredArt.thumbnail + ' 600w, ' + featuredArt.scene + ' 1280w'} sizes="(max-width: 700px) 100vw, 60vw" width="1280" height="853" alt={featuredArt.description} fetchPriority="high" />
        <span className="chapter-location"><MapPin size={16} aria-hidden="true" /> {bankReady ? 'Ngân hàng tí hon' : 'Thị trấn SmartKid'}</span>
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
      <header><div><p className="eyebrow">BẢN ĐỒ CỦA EM</p><h2 id="next-chapters-title">{bankReady ? 'Những nơi để ghé thăm' : 'Những miền đất tiếp theo'}</h2></div><span>Mỗi nơi, một câu chuyện</span></header>
      <div className="chapter-grid">{worldMaps.filter(map => map.id !== featuredId).map(map => {
        const art = mapAssetPacks[map.id]
        const unlock = resolveWorldUnlockState(map, { level, completedMissionIds, completedWorldChapterIds })
        return <article className={'chapter-preview theme-' + art.theme} key={map.id}>
          <div className="chapter-preview-art"><img src={art.thumbnail} width="600" height="400" alt={art.description} loading="lazy" decoding="async" /><span className="chapter-number">0{map.order}</span></div>
          <div className="chapter-preview-copy"><h3>{map.name}</h3><p>{map.description}</p>
            {unlock.playable ? <button className="quiet-button" type="button" aria-label={'Khám phá ' + map.shortName} onClick={() => enterMap(map.id)}>Khám phá<ArrowRight size={18} /></button> : <span className="chapter-lock"><LockKeyhole size={16} aria-hidden="true" />{map.status !== 'available' ? 'Đang chuẩn bị cho em' : unlock.reason}</span>}
          </div>
        </article>
      })}</div>
    </section>
  </section>
}
