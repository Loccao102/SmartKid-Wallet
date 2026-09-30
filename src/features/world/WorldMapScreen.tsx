import {
  ArrowRight,
  Compass,
  Landmark,
  LockKeyhole,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { worldMaps } from '../../data/worldMaps'
import { stalls } from '../../data/stalls'
import type { MapId } from '../../domain/types'
import { useProgressionStore } from '../../store/progression'

export function WorldMapScreen({
  onOpenMap,
}: {
  onOpenMap: (mapId: MapId) => void
}) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const completedMissionIds = useProgressionStore((state) => state.completedMissionIds)
  const completedWorldChapterIds = useProgressionStore(
    (state) => state.completedWorldChapterIds,
  )
  const unlockMap = useProgressionStore((state) => state.unlockMap)
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
              {(() => {
                const levelReady = level >= map.unlockLevel
                const missionReady =
                  !map.prerequisiteMissionId ||
                  completedMissionIds.includes(map.prerequisiteMissionId)
                const chapterReady =
                  !map.prerequisiteMapId ||
                  completedWorldChapterIds.includes(map.prerequisiteMapId)
                const requirementsReady =
                  levelReady && missionReady && chapterReady
                const playable = map.status === 'available' && requirementsReady
                const Icon = map.id === 'smartmart' ? ShoppingCart : Landmark

                if (playable) {
                  return (
                    <>
                      <button
                        type="button"
                        className="destination-sign is-available"
                        onClick={() => {
                          unlockMap(map.id)
                          onOpenMap(map.id)
                        }}
                      >
                        <Icon size={21} aria-hidden="true" />
                        <span>
                          {map.id === 'smartmart'
                            ? 'Siêu thị SmartMart'
                            : map.name}
                        </span>
                        <ArrowRight size={20} aria-hidden="true" />
                      </button>
                      <span className="destination-note">
                        {map.id === 'smartmart'
                          ? count === 0
                            ? 'Hành trình đầu tiên của em'
                            : `${count}/${stalls.length} gian hàng đã mở`
                          : completedWorldChapterIds.includes(map.id)
                            ? 'Đã hoàn thành · có thể chơi lại'
                            : 'Chương mới đã sẵn sàng'}
                      </span>
                    </>
                  )
                }

                return (
                  <>
                    <h2
                      className={
                        'destination-sign ' +
                        (requirementsReady ? 'is-ready-next' : '')
                      }
                    >
                      <LockKeyhole size={18} aria-hidden="true" />
                      {map.name}
                    </h2>
                    <span className="destination-note">
                      {requirementsReady
                        ? 'Đã đủ điều kiện · chương đang được phát triển'
                        : map.unlockHint ??
                          'Mở ở Cấp ' + map.unlockLevel}
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
          onClick={() => onOpenMap('smartmart')}
        >
          {count ? 'Tiếp tục khám phá' : 'Khám phá SmartMart'}
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </footer>
    </section>
  )
}
