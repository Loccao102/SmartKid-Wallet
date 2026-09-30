import { useState } from 'react'
import { ArrowRight, BadgeCheck, BookOpen, Coins, Flame, LockKeyhole, ShoppingBasket, Star, Trophy } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { demoStudentProfile as student } from '../../data/studentDemo'
import { worldMaps } from '../../data/worldMaps'
import { stalls } from '../../data/stalls'
import { firstMission } from '../../data/missions'
import { xpNeededForNextLevel } from '../../domain/progression'
import { useProgressionStore } from '../../store/progression'
import { Modal } from '../system/Modal'

export function ProfileScreen({ onMap, onLeaderboard }: { onMap: () => void; onLeaderboard: () => void }) {
  const unlockedStalls = useProgressionStore(state => state.unlockedStalls)
  const completedMissionIds = useProgressionStore(state => state.completedMissionIds)
  const level = useProgressionStore(state => state.level)
  const levelXp = useProgressionStore(state => state.levelXp)
  const coins = useProgressionStore(state => state.coins)
  const activityResults = useProgressionStore(state => state.activityResults)
  const nextLevelXp = xpNeededForNextLevel(level)
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const count = stalls.filter(stall => unlockedStalls.includes(stall.id)).length
  const badgeUnlocked = (id: string) => id === 'first-stall' ? count > 0 : id === 'smart-shopper' ? completedMissionIds.includes(firstMission.id) : true
  const badge = student.badges.find(item => item.id === selectedBadge)
  return <section className="student-passport"><header className="adventure-heading"><div><p className="eyebrow">MỖI NGÀY THÊM MỘT BƯỚC TIẾN</p><h1>Hành trình của em</h1><p>Học giỏi, chi tiêu thông minh và giúp đỡ bạn bè.</p></div><button type="button" className="outline-button" onClick={onLeaderboard}><Trophy size={19} />Bảng xếp hạng</button></header>
    <div className="passport-layout"><section className="passport-identity"><div className="passport-portrait"><img src={gameAssets.production.student} alt="" /><Star size={28} /></div><h2>{student.name}</h2><p>Lớp {student.className} · {student.title}</p><div className="passport-level"><span>Cấp {level}</span><strong>{levelXp}/{nextLevelXp} XP</strong></div><progress value={levelXp} max={nextLevelXp} aria-label="Tiến độ cấp độ" /><div className="passport-wallet"><Coins size={19} /><strong>{coins.toLocaleString('vi-VN')} xu</strong><span>Mỗi lần lên cấp nhận thêm 100 xu</span></div><div className="passport-facts"><div><Flame size={22} /><strong>{student.streakDays} ngày</strong><span>Chuỗi học</span></div><div><ShoppingBasket size={22} /><strong>{count}/{stalls.length}</strong><span>Gian đã mở</span></div><div><BadgeCheck size={22} /><strong>{completedMissionIds.length}</strong><span>Nhiệm vụ</span></div></div><p className="sample-note">Cấp độ, XP, xu, gian hàng và nhiệm vụ phản ánh tiến trình thật trên thiết bị này. Chuỗi ngày học hiện vẫn là dữ liệu minh họa.</p></section>
    <section className="passport-badges"><p className="eyebrow">BỘ SƯU TẬP CỦA EM</p><h2>Những điều em làm được</h2><div className="badge-collection">{student.badges.map((item,index) => <button key={item.id} type="button" className={`passport-badge badge-${index} ${badgeUnlocked(item.id) ? 'earned' : 'not-earned'}`} onClick={() => setSelectedBadge(item.id)}><span>{badgeUnlocked(item.id) ? index === 0 ? <BookOpen size={34} /> : index === 1 ? <Flame size={34} /> : <ShoppingBasket size={34} /> : <LockKeyhole size={32} />}</span><strong>{item.name}</strong><small>{badgeUnlocked(item.id) ? 'Đã nhận · Xem chi tiết' : 'Chưa mở · Xem mục tiêu'}</small></button>)}</div><div className="passport-encouragement"><Star size={23} /><p>Mỗi bài Toán em hoàn thành đều giúp em tự tin hơn cho lần mua sắm tiếp theo.</p></div></section></div>
    <section className="passport-worlds"><header><div><p className="eyebrow">TIẾN TRÌNH KHÁM PHÁ</p><h2>Thế giới đang chờ em</h2></div><button className="quiet-button" type="button" onClick={onMap}>Về SmartMart<ArrowRight size={18} /></button></header><div>{worldMaps.map(map => <article key={map.id}><img src={gameAssets.production.maps[map.id]} alt="" /><h3>{map.shortName}</h3>{map.id === 'smartmart' ? <><progress value={count} max={stalls.length} aria-label="Số gian SmartMart đã mở" /><span>{count}/{stalls.length} gian đã mở</span></> : <span><LockKeyhole size={15} />Cấp {map.unlockLevel}</span>}</article>)}</div></section>
    <section className="passport-best-runs"><p className="eyebrow">KỶ LỤC 5 SAO</p><div>{Object.entries(activityResults).length === 0 ? <p>Hoàn thành Mission hoặc Work Mode để lưu kỷ lục sao.</p> : Object.entries(activityResults).slice(0,6).map(([id,result]) => <article key={id}><span>{id.startsWith('mission:') ? 'Mission' : 'Ca làm'}</span><strong>{result.bestStars}/5 ★</strong><small>{Math.round(result.bestScore)} điểm ẩn tốt nhất · {result.attempts} lượt</small></article>)}</div></section><details className="passport-skills"><summary>Kỹ năng đang luyện · dữ liệu minh họa</summary><div>{student.skills.map(skill => <div key={skill.id}><span>{skill.label}</span><strong>{skill.score}%</strong><progress value={skill.score} max={100} aria-label={skill.label} /></div>)}</div><p>Các tỷ lệ minh họa này chưa phải kết quả đánh giá cá nhân.</p></details>
    {badge ? <Modal title={badge.name} onClose={() => setSelectedBadge(null)}><div className="badge-detail"><BadgeCheck size={48} /><p>{badge.description}</p><strong>{badgeUnlocked(badge.id) ? 'Huy hiệu đã mở' : 'Tiếp tục khám phá để nhận huy hiệu này nhé.'}</strong></div><button className="adventure-button" type="button" onClick={() => { setSelectedBadge(null); onMap() }}>Tiếp tục tại SmartMart<ArrowRight size={19} /></button></Modal> : null}
  </section>
}
