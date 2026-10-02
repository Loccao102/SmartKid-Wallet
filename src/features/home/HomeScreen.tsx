import { ArrowRight, BookOpen, BriefcaseBusiness, Check, Compass, LockKeyhole, Sun, Target, Trophy } from 'lucide-react'
import { gameAssets, mapAssetPacks } from '../../assets/registry'
import { firstMission } from '../../data/missions'
import { useProgressionStore } from '../../store/progression'

export function HomeScreen({ onContinueSmartMart, onOpenMission, onOpenLeaderboard, onOpenMissions, onOpenDailyChallenge, onOpenWeeklyChallenge }: {
  onContinueSmartMart: () => void; onOpenMission: () => void; onOpenLeaderboard: () => void
  onOpenMissions: () => void; onOpenDailyChallenge: () => void; onOpenWeeklyChallenge: () => void
}) {
  const unlockedStalls = useProgressionStore(state => state.unlockedStalls)
  const completedMissionIds = useProgressionStore(state => state.completedMissionIds)
  const missionReady = unlockedStalls.length >= 5
  const missionDone = completedMissionIds.includes(firstMission.id)
  return <section className="explorer-home">
    <header className="explorer-heading"><div><p className="eyebrow"><Sun size={18} /> MỖI NGÀY MỘT ĐIỀU HAY</p><h1>Hôm nay, mình <span>khám phá gì?</span></h1><p>Chọn một chuyến đi nhỏ và học thêm điều em thích.</p></div></header>
    <article className="home-adventure-banner"><div><span className="chapter-label"><Compass size={18} /> TIẾP TỤC HÀNH TRÌNH</span><h2>SmartMart đang<br />chờ bước chân em.</h2><p>{unlockedStalls.length}/5 gian hàng đã mở. Mỗi bài Toán là một chiếc chìa khóa mới.</p><button className="adventure-button" type="button" onClick={onContinueSmartMart}>Cùng đi thôi<ArrowRight size={20} /></button></div><img src={mapAssetPacks.smartmart.scene} alt={mapAssetPacks.smartmart.description} width="1280" height="853" /></article>
    <section className="play-paths" aria-label="Chọn hoạt động">
      <button type="button" onClick={onOpenDailyChallenge}><span className="play-path-icon theme-sunflower"><Sun size={27} /></span><span><strong>Khởi động trí óc</strong><small>Một thử thách Toán cho hôm nay</small></span><ArrowRight size={20} /></button>
      <button type="button" onClick={onContinueSmartMart}><span className="play-path-icon theme-mint"><BookOpen size={27} /></span><span><strong>Luyện thêm một chút</strong><small>Quay lại gian đã mở, thử lại miễn phí</small></span><ArrowRight size={20} /></button>
      <button type="button" onClick={onOpenWeeklyChallenge}><span className="play-path-icon theme-lavender"><Trophy size={27} /></span><span><strong>Thử thách tuần</strong><small>Cùng bạn bè chinh phục đề Toán</small></span><ArrowRight size={20} /></button>
    </section>
    <div className="home-story-grid"><article className="home-mission-story"><img src={gameAssets.production.party} alt="" loading="lazy" /><div><p className="eyebrow"><Target size={16} /> NHIỆM VỤ VẬN DỤNG</p><h2>Chuẩn bị liên hoan lớp</h2><p>Lên danh sách, cân đối ngân sách và chọn đủ món ngon cho cả lớp.</p><span className="chapter-lock">{missionDone ? <Check size={17} /> : <LockKeyhole size={17} />}{missionDone ? 'Đã hoàn thành · Có thể chơi lại' : missionReady ? 'Đã sẵn sàng cho em' : 'Mở thêm ' + (5 - unlockedStalls.length) + ' gian để bắt đầu'}</span><button className="outline-button" type="button" onClick={onOpenMission} disabled={!missionReady}>Xem nhiệm vụ<ArrowRight size={18} /></button></div></article>
      <article className="home-work-story"><BriefcaseBusiness size={32} /><p className="eyebrow">THỬ MỘT VAI TRÒ MỚI</p><h2>Một ngày làm nhân viên</h2><p>Sau nhiệm vụ mua sắm, em có thể giúp khách hàng và chăm sóc siêu thị.</p><button className="outline-button" type="button" onClick={onOpenMissions}>Xem các ca làm<ArrowRight size={18} /></button><button className="quiet-button" type="button" onClick={onOpenLeaderboard}><Trophy size={18} />Ghé bảng xếp hạng</button></article></div>
  </section>
}
