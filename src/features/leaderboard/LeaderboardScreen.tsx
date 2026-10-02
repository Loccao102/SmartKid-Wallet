import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Clock3,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  UsersRound,
} from 'lucide-react'
import {
  createWeeklyChallenge,
  getVietnamWeekEndsAt,
} from '../../domain/weeklyChallenge'
import {
  fetchWeeklyLeaderboard,
  type WeeklyLeaderboardEntry,
} from '../../lib/weeklyChallengeRemote'

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return (
    Math.floor(seconds / 60) +
    ':' +
    String(seconds % 60).padStart(2, '0')
  )
}

function remainingLabel(endsAt: Date) {
  const diff = Math.max(0, endsAt.getTime() - Date.now())
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  return days > 0
    ? 'Còn ' + days + ' ngày ' + hours + ' giờ'
    : 'Còn ' + hours + ' giờ'
}

export function LeaderboardScreen({
  onOpenWeeklyChallenge,
}: {
  onOpenWeeklyChallenge: () => void
}) {
  const challenge = useMemo(() => createWeeklyChallenge(), [])
  const endsAt = useMemo(() => getVietnamWeekEndsAt(), [])
  const [rows, setRows] = useState<WeeklyLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await fetchWeeklyLeaderboard(challenge.id, 50))
    } catch {
      setError('Chưa tải được bảng xếp hạng online.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [challenge.id])

  const podium = rows.slice(0, 3)
  const podiumHeading = podium.length === 1
    ? 'Bạn đang dẫn đầu'
    : podium.length === 2
      ? 'Hai bạn đang dẫn đầu'
      : 'Ba bạn đang dẫn đầu'

  return (
    <section className="class-leaderboard weekly-leaderboard-page" aria-labelledby="weekly-leaderboard-title">
      <header className="adventure-heading">
        <div>
          <p className="eyebrow">
            <Trophy size={16} /> THỬ THÁCH TUẦN SMARTMART
          </p>
          <h1 id="weekly-leaderboard-title">Bảng xếp hạng tuần</h1>
          <p>
            {challenge.subtitle} · {remainingLabel(endsAt)}
          </p>
        </div>
        <button
          type="button"
          className="adventure-button"
          onClick={onOpenWeeklyChallenge}
        >
          Thử sức ngay
          <ArrowRight size={18} />
        </button>
      </header>

      <aside className="weekly-fair-play">
        <ShieldCheck size={23} />
        <div>
          <strong>Cùng thử thách, cùng cơ hội</strong>
          <p>
            Mọi bạn trong tuần đều gặp cùng nhóm câu hỏi và độ khó. Xu không dùng để thử
            lại; bảng xếp hạng ưu tiên điểm cao hơn, sau đó đến thời gian.
          </p>
        </div>
      </aside>

      {loading ? (
        <div className="weekly-board-empty">Đang mở bảng kết quả…</div>
      ) : error ? (
        <div className="weekly-board-empty">
          <p>{error}</p>
          <button type="button" className="outline-button" onClick={load}>
            Thử tải lại
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="weekly-board-empty">
          <UsersRound size={38} />
          <h2>Chưa có lượt chơi nào trong tuần này</h2>
          <p>Em có thể là người đầu tiên ghi tên mình bằng một mã chơi bí mật.</p>
          <button
            type="button"
            className="adventure-button"
            onClick={onOpenWeeklyChallenge}
          >
            Chơi lượt đầu tiên
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="weekly-board-section-heading">
            <div>
              <p className="eyebrow">DẪN ĐẦU TUẦN NÀY</p>
              <h2>{podiumHeading}</h2>
            </div>
            <span>{challenge.subtitle}</span>
          </div>
          <div className="class-podium weekly-podium">
            {podium.map((row, index) => (
              <article
                key={row.playerCode}
                className={'class-podium-place place-' + (index + 1)}
              >
                <div className="podium-person weekly-code-avatar">
                  {index === 0 ? <Trophy size={30} /> : <Medal size={25} />}
                </div>
                <h2>{row.playerCode}</h2>
                <p>
                  <Star size={18} fill="currentColor" />
                  {row.bestStars}/5 · {Math.round(row.bestScore)} điểm
                </p>
                <div className="podium-step">
                  <strong>{index + 1}</strong>
                </div>
              </article>
            ))}
          </div>

          <ol className="class-ranking weekly-ranking" aria-label="Xếp hạng tuần">
            {rows.map((row) => (
              <li key={row.playerCode}>
                <span className="ranking-position" aria-label={'Hạng ' + row.rank}>
                  {row.rank}
                </span>
                <span className="ranking-avatar">
                  {row.playerCode.slice(-2)}
                </span>
                <div className="ranking-name">
                  <strong>{row.playerCode}</strong>
                  <span>
                    {row.bestFirstTryCorrect}/{challenge.mathFamilyIds.length} đúng ngay lần đầu · {row.attempts}{' '}
                    lượt chơi
                  </span>
                </div>
                <strong className="ranking-points">
                  <Star size={17} fill="currentColor" />
                  {Math.round(row.bestScore)}
                </strong>
                <span className="weekly-rank-time">
                  <Clock3 size={15} />
                  {formatDuration(row.bestElapsedMs)}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      <aside className="ranking-note">
        <ShieldCheck size={25} />
        <div>
          <strong>Mã chơi giúp giữ riêng tư</strong>
          <p>
            Bảng công khai chỉ hiển thị mã người chơi, không hiển thị tên thật
            của học sinh.
          </p>
        </div>
      </aside>
    </section>
  )
}
