import {
  ArrowRight,
  Landmark,
  LockKeyhole,
  Map,
  ShoppingCart,
  Sparkles,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { worldMaps } from '../../data/worldMaps'
import type { MapId, WorldMapDefinition } from '../../domain/types'
import { useProgressionStore } from '../../store/progression'

const mapIcons: Record<MapId, LucideIcon> = {
  smartmart: ShoppingCart,
  'tiny-bank': Landmark,
  'happy-restaurant': UtensilsCrossed,
  'weekend-market': Store,
}

function MapArtwork({ map }: { map: WorldMapDefinition }) {
  const Icon = mapIcons[map.id]

  return (
    <div className={`world-map-art world-map-art--${map.theme}`} aria-hidden="true">
      <div className="world-map-landmark">
        <span className="world-map-landmark-icon">
          <Icon size={44} strokeWidth={1.8} />
        </span>
        <strong>{map.shortName}</strong>
      </div>
      {map.status === 'locked' ? (
        <div className="world-map-lock">
          <span>
            <LockKeyhole size={25} strokeWidth={2} />
          </span>
          <strong>Chưa mở</strong>
        </div>
      ) : null}
    </div>
  )
}

function WorldMapCard({
  map,
  featured,
  progress,
  onOpen,
}: {
  map: WorldMapDefinition
  featured?: boolean
  progress?: number
  onOpen?: () => void
}) {
  const locked = map.status === 'locked'
  const progressValue = progress ?? 0

  return (
    <article
      className={`world-map-card ${featured ? 'is-featured' : ''} ${locked ? 'is-locked' : ''}`}
    >
      <div className="world-map-number" aria-hidden="true">{map.order}</div>
      <MapArtwork map={map} />

      <div className="world-map-card-content">
        <div className="world-map-title-row">
          <div>
            <h2>{map.name}</h2>
            <p>{map.description}</p>
          </div>

          {locked ? (
            <span className="world-map-status locked">
              <LockKeyhole size={12} aria-hidden="true" />
              Đang khóa
            </span>
          ) : (
            <span className="world-map-status available">Đang khám phá</span>
          )}
        </div>

        {map.id === 'smartmart' ? (
          <div className="world-map-progress-area">
            <div className="world-map-progress-copy">
              <span>Tiến độ SmartMart</span>
              <strong>{progressValue}%</strong>
            </div>
            <div className="world-map-progress-track" aria-label={`Tiến độ SmartMart ${progressValue}%`}>
              <span style={{ width: `${progressValue}%` }} />
            </div>
            <button type="button" className="world-map-primary-action" onClick={onOpen}>
              {progressValue > 0 ? 'Tiếp tục hành trình' : 'Bắt đầu SmartMart'}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <p className="world-map-unlock-hint">{map.unlockHint}</p>
        )}
      </div>
    </article>
  )
}

export function WorldMapScreen({ onOpenSmartMart }: { onOpenSmartMart: () => void }) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const smartmart = worldMaps[0]
  const lockedMaps = worldMaps.slice(1)
  const smartMartProgress = Math.round((unlockedStalls.length / 5) * 100)

  return (
    <section className="world-screen">
      <div className="world-heading">
        <div className="world-heading-icon" aria-hidden="true">
          <Map size={28} strokeWidth={1.9} />
        </div>
        <div>
          <p className="page-kicker">HÀNH TRÌNH SMARTKID</p>
          <h1>Chọn bản đồ để tiếp tục hành trình</h1>
          <p>
            Hiện tại SmartMart đang mở. Hoàn thành từng chặng để khám phá thêm những
            thế giới tài chính mới.
          </p>
        </div>
      </div>

      <WorldMapCard
        map={smartmart}
        featured
        progress={smartMartProgress}
        onOpen={onOpenSmartMart}
      />

      <div className="locked-world-grid" aria-label="Các bản đồ chưa mở">
        {lockedMaps.map((map) => (
          <WorldMapCard key={map.id} map={map} />
        ))}
      </div>

      <aside className="world-coming-soon">
        <span aria-hidden="true">
          <Sparkles size={20} strokeWidth={2} />
        </span>
        <div>
          <strong>Một hành trình, nhiều thế giới</strong>
          <p>
            Ba bản đồ khóa mới chỉ là preview. MVP sẽ tập trung làm SmartMart thật sâu
            trước khi mở rộng gameplay.
          </p>
        </div>
      </aside>
    </section>
  )
}
