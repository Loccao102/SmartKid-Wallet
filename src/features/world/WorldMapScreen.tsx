import {
  ArrowRight,
  Compass,
  LockKeyhole,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { worldMaps } from '../../data/worldMaps'
import { stalls } from '../../data/stalls'
import { useProgressionStore } from '../../store/progression'

export function WorldMapScreen({
  onOpenSmartMart,
}: {
  onOpenSmartMart: () => void
}) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const completedMissionIds = useProgressionStore((state) => state.completedMissionIds)
  const level = useProgressionStore((state) => state.level)
  const count = stalls.filter((stall) =>
    unlockedStalls.includes(stall.id),
  ).length
  return (
    <section className="adventure-world" aria-labelledby="world-title">
      <header className="adventure-heading">
        <div>
          <p className="eyebrow">
            <Compass size={16} aria-hidden="true" /> THẾ GIỚI CỦA EM
          </p>
          <h1 id="world-title">Đi một chút. Học thật nhiều.</h1>
          <p>Những điều hay bắt đầu từ một chuyến đi mua sắm.</p>
        </div>
        <span className="mode-label">
          <span /> Chế độ khám phá
        </span>
      </header>
      <div className="island-world">
        <img
          className="island-landscape"
          src={gameAssets.production.landscape}
          alt=""
        />
        <div className="map-caption">
          <Compass size={19} aria-hidden="true" />
          <span>Bản đồ hành trình</span>
        </div>
        <div className="island-destinations">
          {worldMaps.map((map) => (
            <article
              key={map.id}
              className={`island-destination destination-${map.id}`}
            >
              <img
                src={gameAssets.production.maps[map.id]}
                alt=""
                className="destination-art"
              />
              {map.id === 'smartmart' ? (
                <>
                  <button
                    type="button"
                    className="destination-sign is-available"
                    onClick={onOpenSmartMart}
                  >
                    <ShoppingCart size={21} aria-hidden="true" />
                    <span>Siêu thị SmartMart</span>
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                  <span className="destination-note">
                    {count === 0
                      ? 'Hành trình đầu tiên của em'
                      : `${count}/${stalls.length} gian hàng đã mở`}
                  </span>
                </>
              ) : (() => {
                const levelReady = level >= map.unlockLevel
                const prerequisiteReady =
                  !map.prerequisiteMissionId ||
                  completedMissionIds.includes(map.prerequisiteMissionId)
                const requirementsReady = levelReady && prerequisiteReady

                return (
                  <>
                    <h2 className={'destination-sign ' + (requirementsReady ? 'is-ready-next' : '')}>
                      <LockKeyhole size={18} aria-hidden="true" />
                      {map.name}
                    </h2>
                    <span className="destination-note">
                      {requirementsReady
                        ? 'Đã đủ điều kiện · chương mới đang chuẩn bị'
                        : 'Mở ở Cấp ' + map.unlockLevel + (map.prerequisiteMissionId ? ' + nhiệm vụ trước' : '')}
                    </span>
                  </>
                )
              })()}
            </article>
          ))}
        </div>
        <div className="world-guide">
          <img src={gameAssets.production.student} alt="" />
          <p>
            <strong>Cùng ghé SmartMart nhé!</strong>
            <span>Giải Toán, mở gian hàng và mua sắm thông minh.</span>
          </p>
        </div>
      </div>
      <footer className="journey-footer">
        <div className="journey-progress">
          <span className="journey-emblem">
            <Sparkles size={24} aria-hidden="true" />
          </span>
          <div>
            <strong>Hành trình SmartMart</strong>
            <span>
              {count}/{stalls.length} gian đã mở · Mỗi bài Toán, một bước tiến
            </span>
          </div>
          <progress
            value={count}
            max={stalls.length}
            aria-label={`${count} trên ${stalls.length} gian đã mở`}
          />
        </div>
        <button
          type="button"
          className="adventure-button"
          onClick={onOpenSmartMart}
        >
          {count ? 'Tiếp tục khám phá' : 'Khám phá SmartMart'}
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </footer>
    </section>
  )
}
