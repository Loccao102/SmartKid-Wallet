import { useRef, useState } from 'react'
import { Medal, ShieldCheck, Star, Target, Trophy } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { demoStudentProfile, weeklyChallenge } from '../../data/studentDemo'

export function LeaderboardScreen() {
  const currentRef = useRef<HTMLLIElement>(null)
  const [showDetails, setShowDetails] = useState(false)
  const podium = [weeklyChallenge.rows[1], weeklyChallenge.rows[0], weeklyChallenge.rows[2]]
  return <section className="class-leaderboard"><header className="adventure-heading"><div><p className="eyebrow">CÙNG NHAU TIẾN BỘ</p><h1>Bảng xếp hạng lớp</h1><p>{weeklyChallenge.title} · Lớp {demoStudentProfile.className}</p></div><span className="sample-label">Dữ liệu minh họa</span></header>
    <div className="class-podium">{podium.map(row => <article key={row.studentId} className={`class-podium-place place-${row.rank}`}><div className="podium-person"><img src={gameAssets.production.customers[(row.rank+1) % 6]} alt="" />{row.rank === 1 ? <Trophy size={30} /> : <Medal size={25} />}</div><h2>{row.name}</h2><p><Star size={18} />{row.points} điểm</p><div className="podium-step"><strong>{row.rank}</strong></div></article>)}</div>
    <div className="leaderboard-tools"><button type="button" className="outline-button" onClick={() => { currentRef.current?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); currentRef.current?.focus() }}><Target size={19} />Vị trí của em</button><button type="button" className="quiet-button" aria-pressed={showDetails} onClick={() => setShowDetails(!showDetails)}>{showDetails ? 'Thu gọn chi tiết' : 'Xem độ chính xác'}</button></div>
    <ol className="class-ranking" aria-label="Xếp hạng học sinh">{weeklyChallenge.rows.map(row => { const current = row.studentId === demoStudentProfile.id; return <li key={row.studentId} ref={current ? currentRef : undefined} tabIndex={current ? -1 : undefined} className={current ? 'current-student' : ''}><span className="ranking-position" aria-label={`Hạng ${row.rank}`}>{row.rank}</span><span className="ranking-avatar">{current ? <img src={gameAssets.production.student} alt="" /> : row.name.split(' ').at(-1)?.charAt(0)}</span><div className="ranking-name"><strong>{row.name}{current ? <em>Em</em> : null}</strong>{showDetails ? <span>{row.accuracy}% chính xác · {row.missions} nhiệm vụ</span> : null}</div><strong className="ranking-points"><Star size={17} />{row.points}<span className="sr-only">điểm</span></strong></li> })}</ol>
    <aside className="ranking-note"><ShieldCheck size={25} /><div><strong>Học cùng nhau, tiến bộ cùng nhau</strong><p>Điểm thử thách ưu tiên độ chính xác và hoàn thành mục tiêu. Doanh thu, uy tín cửa hàng và mức hài lòng của khách không phải điểm học tập.</p></div></aside>
  </section>
}
