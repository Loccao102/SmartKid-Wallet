import { worldMaps } from '../../data/worldMaps'
import type { WorldMapDefinition } from '../../domain/types'

const smartMartProgress = 72

function MapArtwork({ map }: { map: WorldMapDefinition }) {
  return (
    <div className={`world-map-art world-map-art--${map.theme}`} aria-hidden="true">
      <div className="world-map-sky">
        <span>☁️</span>
        <span>☀️</span>
      </div>
      <div className="world-map-landmark">
        <span className="world-map-landmark-icon">{map.icon}</span>
        <strong>{map.shortName}</strong>
      </div>
      <div className="world-map-ground">
        <span>🌳</span>
        <span>🌿</span>
        <span>🪴</span>
      </div>
      {map.status === 'locked' ? (
        <div className="world-map-lock">
          <span>🔒</span>
          <strong>Chưa mở</strong>
        </div>
      ) : null}
    </div>
  )
}

function WorldMapCard({
  map,
  featured,
}: {
  map: WorldMapDefinition
  featured?: boolean
}) {
  const locked = map.status === 'locked'

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
            <span className="world-map-status locked">🔒 Đang khóa</span>
          ) : (
            <span className="world-map-status available">▮▮ Đang khám phá</span>
          )}
        </div>

        {map.id === 'smartmart' ? (
          <div className="world-map-progress-area">
            <div className="world-map-progress-copy">
              <span>Tiến độ SmartMart</span>
              <strong>{smartMartProgress}%</strong>
            </div>
            <div className="world-map-progress-track" aria-label={`Tiến độ SmartMart ${smartMartProgress}%`}>
              <span style={{ width: `${smartMartProgress}%` }} />
            </div>
            <button type="button" className="world-map-primary-action">
              Tiếp tục hành trình <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <p className="world-map-unlock-hint">{map.unlockHint}</p>
        )}
      </div>
    </article>
  )
}

export function WorldMapScreen() {
  const smartmart = worldMaps[0]
  const lockedMaps = worldMaps.slice(1)

  return (
    <section className="world-screen">
      <div className="world-heading">
        <div className="world-heading-icon" aria-hidden="true">🗺️</div>
        <div>
          <p className="page-kicker">HÀNH TRÌNH SMARTKID</p>
          <h1>Chọn bản đồ để tiếp tục hành trình</h1>
          <p>
            Hiện tại SmartMart đang mở. Hoàn thành từng chặng để khám phá thêm những
            thế giới tài chính mới.
          </p>
        </div>
      </div>

      <WorldMapCard map={smartmart} featured />

      <div className="locked-world-grid" aria-label="Các bản đồ chưa mở">
        {lockedMaps.map((map) => (
          <WorldMapCard key={map.id} map={map} />
        ))}
      </div>

      <aside className="world-coming-soon">
        <span aria-hidden="true">✨</span>
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
