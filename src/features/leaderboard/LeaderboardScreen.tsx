import {
  Medal,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { demoStudentProfile, weeklyChallenge } from '../../data/studentDemo'

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className={'leaderboard-rank-medal rank-' + rank}
        aria-label={'Hạng ' + rank}
      >
        <Medal size={18} strokeWidth={2} />
        <strong>{rank}</strong>
      </span>
    )
  }

  return <span className="leaderboard-rank-number">#{rank}</span>
}

export function LeaderboardScreen() {
  const podium = weeklyChallenge.rows.slice(0, 3)
  const currentStudent = weeklyChallenge.rows.find(
    (row) => row.studentId === demoStudentProfile.id,
  )

  return (
    <section className="leaderboard-screen">
      <header className="leaderboard-heading">
        <div className="world-heading-icon" aria-hidden="true">
          <Trophy size={28} strokeWidth={1.9} />
        </div>
        <div>
          <p className="page-kicker">THỬ THÁCH TUẦN</p>
          <h1>{weeklyChallenge.title}</h1>
          <p>{weeklyChallenge.subtitle}</p>
        </div>
        <span className="leaderboard-countdown">{weeklyChallenge.endsIn}</span>
      </header>

      <aside className="leaderboard-fairness-note">
        <ShieldCheck size={21} aria-hidden="true" />
        <div>
          <strong>Xếp hạng công bằng</strong>
          <p>
            Cả lớp làm cùng challenge và cùng seed. Điểm ưu tiên độ chính xác,
            hoàn thành mục tiêu và số lần thử — không xếp theo doanh thu.
          </p>
        </div>
      </aside>

      <div className="leaderboard-podium">
        {podium.map((row) => (
          <article key={row.studentId} className={'podium-card rank-' + row.rank}>
            <RankBadge rank={row.rank} />
            <div className="podium-avatar">{row.name.charAt(0)}</div>
            <strong>{row.name}</strong>
            <span>{row.points} điểm</span>
            <small>{row.accuracy}% chính xác</small>
          </article>
        ))}
      </div>

      <article className="leaderboard-table-card">
        <div className="leaderboard-table-heading">
          <div>
            <p className="page-kicker">LỚP 5A</p>
            <h2>Bảng xếp hạng</h2>
          </div>
          <div className="leaderboard-table-meta">
            <Users size={16} aria-hidden="true" />
            <span>{weeklyChallenge.rows.length} học sinh demo</span>
          </div>
        </div>

        <div className="leaderboard-table">
          <div className="leaderboard-table-row is-header">
            <span>Hạng</span>
            <span>Học sinh</span>
            <span>Độ chính xác</span>
            <span>Mission</span>
            <span>Điểm</span>
          </div>

          {weeklyChallenge.rows.map((row) => {
            const isCurrent = row.studentId === demoStudentProfile.id

            return (
              <div
                key={row.studentId}
                className={'leaderboard-table-row ' + (isCurrent ? 'is-current' : '')}
              >
                <RankBadge rank={row.rank} />
                <div className="leaderboard-student-cell">
                  <span>{row.name.charAt(0)}</span>
                  <strong>
                    {row.name}
                    {isCurrent ? <em>Bạn</em> : null}
                  </strong>
                </div>
                <span>{row.accuracy}%</span>
                <span>{row.missions}</span>
                <strong>{row.points}</strong>
              </div>
            )
          })}
        </div>
      </article>

      {currentStudent ? (
        <aside className="leaderboard-current-summary">
          <Target size={20} aria-hidden="true" />
          <div>
            <strong>Em đang ở hạng #{currentStudent.rank}</strong>
            <p>
              Tập trung tăng độ chính xác thay vì làm thật nhanh. Challenge này
              {' còn ' + weeklyChallenge.endsIn.toLowerCase()}.
            </p>
          </div>
        </aside>
      ) : null}
    </section>
  )
}
