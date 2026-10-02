import { useState } from 'react'
import { ArrowRight, BadgeCheck, BookOpen, Brain, Coins, LockKeyhole, ShoppingBasket, Sparkles, Star, Trophy } from 'lucide-react'
import { mapAssetPacks } from '../../assets/registry'
import { AvatarCharacter } from '../../components/avatar/AvatarCharacter'
import { demoStudentProfile as student } from '../../data/studentDemo'
import { worldMaps } from '../../data/worldMaps'
import { stalls } from '../../data/stalls'
import { firstMission } from '../../data/missions'
import { getSkillMastery } from '../../domain/mastery'
import { xpNeededForNextLevel } from '../../domain/progression'
import type { MathSkill } from '../../domain/types'
import { useAvatarProfileStore } from '../../store/avatarProfile'
import { useLearningProfileStore } from '../../store/learningProfile'
import { useProgressionStore } from '../../store/progression'
import { Modal } from '../system/Modal'
import { AvatarCustomizer } from './AvatarCustomizer'

const skillLabels: Record<MathSkill, string> = {
  addition: 'Cộng tiền',
  subtraction: 'Tiền thừa',
  multiplication: 'Nhân & số lượng',
  division: 'Chia đều',
  'unit-price': 'Đơn giá',
  budget: 'Ngân sách',
  percentage: 'Khuyến mãi',
  measurement: 'Khối lượng',
  fraction: 'Phân số',
  comparison: 'So sánh lựa chọn',
}

function masteryLabel(score: number) {
  if (score < 45) return 'Đang luyện'
  if (score < 65) return 'Đang tiến bộ'
  if (score < 80) return 'Khá vững'
  return 'Rất vững'
}

export function ProfileScreen({ onMap, onLeaderboard, displayName = student.name, classLabel = student.className }: { onMap: () => void; onLeaderboard: () => void; displayName?: string; classLabel?: string }) {
  const avatar = useAvatarProfileStore(state => state.avatar)
  const unlockedStalls = useProgressionStore(state => state.unlockedStalls)
  const completedMissionIds = useProgressionStore(state => state.completedMissionIds)
  const level = useProgressionStore(state => state.level)
  const levelXp = useProgressionStore(state => state.levelXp)
  const coins = useProgressionStore(state => state.coins)
  const activityResults = useProgressionStore(state => state.activityResults)
  const masteryBySkill = useLearningProfileStore(state => state.masteryBySkill)
  const nextLevelXp = xpNeededForNextLevel(level)
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const count = stalls.filter(stall => unlockedStalls.includes(stall.id)).length
  const badgeUnlocked = (id: string) => id === 'first-stall' ? count > 0 : id === 'smart-shopper' ? completedMissionIds.includes(firstMission.id) : true
  const badge = student.badges.find(item => item.id === selectedBadge)
  const masteryEntries = (Object.keys(skillLabels) as MathSkill[])
    .map(skill => ({ skill, state: getSkillMastery(masteryBySkill, skill) }))
    .filter(item => item.state.attempts > 0)
    .sort((a, b) => b.state.attempts - a.state.attempts)
  return <section className="student-passport"><header className="adventure-heading"><div><p className="eyebrow">MỖI NGÀY THÊM MỘT BƯỚC TIẾN</p><h1>Góc nhỏ của em</h1><p>Một nhân vật riêng. Một hành trình đáng tự hào.</p></div><button type="button" className="outline-button" onClick={onLeaderboard}><Trophy size={19} />Bảng xếp hạng</button></header>
    <div className="passport-layout"><section className="passport-identity"><div className="passport-portrait"><AvatarCharacter config={avatar} className="student-avatar-render" label={`Nhân vật của ${displayName}`} /><Star size={28} /></div><h2>{displayName}</h2><p>Lớp {classLabel} · {student.title}</p><button type="button" className="outline-button avatar-edit-button" onClick={() => setAvatarOpen(true)}><Sparkles size={18} />Tùy chỉnh nhân vật</button><div className="passport-level"><span>Cấp {level}</span><strong>{levelXp}/{nextLevelXp} XP</strong></div><progress value={levelXp} max={nextLevelXp} aria-label="Tiến độ cấp độ" /><div className="passport-wallet"><Coins size={19} /><strong>{coins.toLocaleString('vi-VN')} xu</strong><span>Mỗi lần lên cấp nhận thêm 100 xu</span></div><div className="passport-facts"><div><ShoppingBasket size={22} /><strong>{count}/{stalls.length}</strong><span>Gian đã mở</span></div><div><BadgeCheck size={22} /><strong>{completedMissionIds.length}</strong><span>Nhiệm vụ</span></div></div><p className="sample-note">Hành trình của em được lưu trên thiết bị này.</p></section>
    <section className="passport-badges"><p className="eyebrow">BỘ SƯU TẬP CỦA EM</p><h2>Những điều em làm được</h2><div className="badge-collection">{student.badges.filter(item => item.id !== 'seven-day-streak').map((item,index) => <button key={item.id} type="button" className={`passport-badge badge-${index} ${badgeUnlocked(item.id) ? 'earned' : 'not-earned'}`} onClick={() => setSelectedBadge(item.id)}><span>{badgeUnlocked(item.id) ? item.id === 'first-stall' ? <BookOpen size={34} /> : <ShoppingBasket size={34} /> : <LockKeyhole size={32} />}</span><strong>{item.name}</strong><small>{badgeUnlocked(item.id) ? 'Đã nhận · Xem chi tiết' : 'Chưa mở · Xem mục tiêu'}</small></button>)}</div><div className="passport-encouragement"><Star size={23} /><p>Mỗi bài Toán em hoàn thành đều giúp em tự tin hơn cho lần mua sắm tiếp theo.</p></div></section></div>
    <section className="passport-worlds"><header><div><p className="eyebrow">TIẾN TRÌNH KHÁM PHÁ</p><h2>Thế giới đang chờ em</h2></div><button className="quiet-button" type="button" onClick={onMap}>Về SmartMart<ArrowRight size={18} /></button></header><div>{worldMaps.map(map => <article key={map.id}><img src={mapAssetPacks[map.id].thumbnail} alt="" loading="lazy" width="600" height="400" /><h3>{map.shortName}</h3>{map.id === 'smartmart' ? <><progress value={count} max={stalls.length} aria-label="Số gian SmartMart đã mở" /><span>{count}/{stalls.length} gian đã mở</span></> : <span><LockKeyhole size={15} />Cấp {map.unlockLevel}</span>}</article>)}</div></section>
    <section className="passport-best-runs"><p className="eyebrow">KỶ LỤC 5 SAO</p><div>{Object.entries(activityResults).length === 0 ? <p>Hoàn thành nhiệm vụ hoặc ca làm để lưu những ngôi sao đầu tiên.</p> : Object.entries(activityResults).slice(0,6).map(([id,result]) => <article key={id}><span>{id.startsWith('mission:') ? 'Nhiệm vụ' : 'Ca làm'}</span><strong><Star size={18} aria-hidden="true" />{result.bestStars}/5 sao</strong><small>{result.attempts} lượt khám phá</small></article>)}</div></section>
    <section className="passport-mastery" aria-labelledby="mastery-title"><header><div><p className="eyebrow">KỸ NĂNG CỦA EM</p><h2 id="mastery-title">SmartMart đang học cùng em</h2><p>Game tự chọn thêm bài ở những phần em cần luyện, nhưng vẫn xen kẽ ôn tập và thử thách mới.</p></div><Brain size={34} aria-hidden="true" /></header>{masteryEntries.length === 0 ? <div className="mastery-empty"><Sparkles size={24} /><p>Chơi một vài bài Toán hoặc ca làm để SmartMart bắt đầu nhận ra cách em học nhé.</p></div> : <div className="mastery-grid">{masteryEntries.map(({skill,state}) => <article key={skill}><span>{skillLabels[skill]}</span><strong>{masteryLabel(state.score)}</strong><progress value={state.score} max={100} aria-label={skillLabels[skill] + ' · ' + masteryLabel(state.score)} /><small>{state.attempts} lượt đã luyện · {state.firstTryCorrect} lần đúng ngay lần đầu</small></article>)}</div>}<p className="mastery-note">Đây là điểm thích nghi để chọn bài phù hợp, không phải điểm kiểm tra hay xếp hạng học sinh.</p></section>
    {avatarOpen ? <AvatarCustomizer onClose={() => setAvatarOpen(false)} /> : null}
    {badge ? <Modal title={badge.name} onClose={() => setSelectedBadge(null)}><div className="badge-detail"><BadgeCheck size={48} /><p>{badge.description}</p><strong>{badgeUnlocked(badge.id) ? 'Huy hiệu đã mở' : 'Tiếp tục khám phá để nhận huy hiệu này nhé.'}</strong></div><button className="adventure-button" type="button" onClick={() => { setSelectedBadge(null); onMap() }}>Tiếp tục tại SmartMart<ArrowRight size={19} /></button></Modal> : null}
  </section>
}
