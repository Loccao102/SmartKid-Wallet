import {
  ArrowRight,
  Check,
  Flame,
  LockKeyhole,
  Map,
  Play,
  Star,
  Target,
  Trophy,
  TrendingUp,
  BriefcaseBusiness,
  Gamepad2,
  CalendarDays,
  Coins,
} from 'lucide-react'
import { firstMission } from '../../data/missions'
import { xpNeededForNextLevel } from '../../domain/progression'
import { demoStudentProfile, weeklyChallenge } from '../../data/studentDemo'
import { useProgressionStore } from '../../store/progression'

export function HomeScreen({
  onContinueSmartMart,
  onOpenMission,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenDailyChallenge,
}: {
  onContinueSmartMart: () => void
  onOpenMission: () => void
  onOpenLeaderboard: () => void
  onOpenMissions: () => void
  onOpenDailyChallenge: () => void
}) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const completedMissionIds = useProgressionStore((state) => state.completedMissionIds)
  const level = useProgressionStore((state) => state.level)
  const levelXp = useProgressionStore((state) => state.levelXp)
  const coins = useProgressionStore((state) => state.coins)
  const nextLevelXp = xpNeededForNextLevel(level)

  const smartMartProgress = Math.round((unlockedStalls.length / 5) * 100)
  const missionUnlocked = unlockedStalls.length >= 5
  const missionCompleted = completedMissionIds.includes(firstMission.id)
  const currentRank = weeklyChallenge.rows.find(
    (row) => row.studentId === demoStudentProfile.id,
  )

  const weakestSkill = [...demoStudentProfile.skills].sort(
    (a, b) => a.score - b.score,
  )[0]

  return (
    <section className="home-screen">
      <div className="home-top-grid">
        <article className="home-continue-card">
          <div className="home-card-kicker">
            <Map size={16} aria-hidden="true" />
            <span>TIẾP TỤC HÀNH TRÌNH</span>
          </div>

          <h2>SmartMart – Siêu thị</h2>
          <p>
            {unlockedStalls.length === 0
              ? 'Bắt đầu từ gian Rau củ & Hoa quả để mở hành trình.'
              : unlockedStalls.length < 5
                ? 'Tiếp tục mở các gian hàng và luyện kỹ năng Toán trong SmartMart.'
                : 'Tất cả gian hàng đã mở. Em đã sẵn sàng cho Mission vận dụng.'}
          </p>

          <div className="home-progress-row">
            <div>
              <span>Tiến độ</span>
              <strong>{smartMartProgress}%</strong>
            </div>
            <div className="home-progress-track">
              <i style={{ width: smartMartProgress + '%' }} />
            </div>
          </div>

          <div className="home-stall-dots" aria-label={unlockedStalls.length + ' trên 5 gian đã mở'}>
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={index < unlockedStalls.length ? 'is-open' : ''}
              >
                {index < unlockedStalls.length ? <Check size={12} /> : index + 1}
              </span>
            ))}
          </div>

          <button type="button" onClick={onContinueSmartMart}>
            <Play size={16} fill="currentColor" aria-hidden="true" />
            {smartMartProgress === 0 ? 'Bắt đầu SmartMart' : 'Tiếp tục SmartMart'}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </article>

        <aside className="home-summary-stack">
          <article>
            <div className="home-summary-icon streak">
              <Flame size={21} aria-hidden="true" />
            </div>
            <div>
              <span>Chuỗi học</span>
              <strong>{demoStudentProfile.streakDays} ngày</strong>
              <small>Giữ nhịp đều mỗi ngày</small>
            </div>
          </article>

          <article>
            <div className="home-summary-icon level">
              <Star size={21} aria-hidden="true" />
            </div>
            <div>
              <span>Cấp độ</span>
              <strong>Lv. {level}</strong>
              <small>{levelXp}/{nextLevelXp} XP</small>
            </div>
          </article>

          <article>
            <div className="home-summary-icon rank">
              <Trophy size={21} aria-hidden="true" />
            </div>
            <div>
              <span>Hạng tuần</span>
              <strong>#{currentRank?.rank ?? '-'}</strong>
              <small>{currentRank?.points ?? 0} điểm</small>
            </div>
          </article>
        </aside>
      </div>

      <section className="home-mode-hub">
        <header>
          <div>
            <p className="page-kicker">CHỌN CÁCH CHƠI</p>
            <h2>Mỗi chế độ có một nhịp khác nhau</h2>
          </div>
          <span className="home-coins"><Coins size={18} />{coins.toLocaleString('vi-VN')} xu</span>
        </header>
        <div className="home-mode-grid">
          <button type="button" onClick={onContinueSmartMart}>
            <Map size={24} />
            <span><strong>Adventure</strong><small>Giải Toán, mở gian và đi theo hành trình.</small></span>
          </button>
          <button type="button" onClick={onContinueSmartMart}>
            <Gamepad2 size={24} />
            <span><strong>Practice</strong><small>Luyện lại gian đã mở, retry miễn phí.</small></span>
          </button>
          <button type="button" onClick={onOpenMissions}>
            <BriefcaseBusiness size={24} />
            <span><strong>Work</strong><small>Nhập vai nhân viên, trade-off và hậu quả ẩn.</small></span>
          </button>
          <button type="button" onClick={onOpenDailyChallenge}>
            <CalendarDays size={24} />
            <span><strong>Daily Challenge</strong><small>5 câu theo seed trong ngày, săn 5 sao và nhận thưởng một lần.</small></span>
          </button>
        </div>
      </section>

      <div className="home-secondary-grid">
        <article className="home-mission-card">
          <div className="home-section-heading">
            <div>
              <p className="page-kicker">NHIỆM VỤ GẦN NHẤT</p>
              <h2>{firstMission.title}</h2>
            </div>
            <Target size={22} aria-hidden="true" />
          </div>

          <p>{firstMission.shortDescription}</p>

          <div className="home-mission-status">
            {missionCompleted ? (
              <>
                <span className="is-complete"><Check size={14} /></span>
                <div>
                  <strong>Đã hoàn thành</strong>
                  <small>Work Mode đã được mở ở chặng tiếp theo.</small>
                </div>
              </>
            ) : missionUnlocked ? (
              <>
                <span className="is-ready"><Play size={13} fill="currentColor" /></span>
                <div>
                  <strong>Sẵn sàng bắt đầu</strong>
                  <small>Em đã mở đủ 5 gian hàng.</small>
                </div>
              </>
            ) : (
              <>
                <span><LockKeyhole size={14} /></span>
                <div>
                  <strong>Chưa mở</strong>
                  <small>Cần mở thêm {5 - unlockedStalls.length} gian hàng.</small>
                </div>
              </>
            )}
          </div>

          <button type="button" disabled={!missionUnlocked} onClick={onOpenMission}>
            {missionCompleted ? 'Chơi lại Mission' : 'Mở Mission'}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </article>

        <article className="home-skill-card">
          <div className="home-section-heading">
            <div>
              <p className="page-kicker">GỢI Ý LUYỆN TẬP</p>
              <h2>Kỹ năng nên chú ý</h2>
            </div>
            <TrendingUp size={22} aria-hidden="true" />
          </div>

          <div className="home-skill-focus">
            <div>
              <span>{weakestSkill.label}</span>
              <strong>{weakestSkill.score}%</strong>
            </div>
            <div className="home-skill-track">
              <i style={{ width: weakestSkill.score + '%' }} />
            </div>
            <p>
              Quay lại gian Khuyến mãi để luyện thêm các bài phần trăm và so sánh giá.
            </p>
          </div>
        </article>

        <article className="home-challenge-card">
          <div className="home-section-heading">
            <div>
              <p className="page-kicker">THỬ THÁCH TUẦN</p>
              <h2>{weeklyChallenge.title}</h2>
            </div>
            <Trophy size={22} aria-hidden="true" />
          </div>

          <div className="home-challenge-rank">
            <span>Hạng của em</span>
            <strong>#{currentRank?.rank ?? '-'}</strong>
            <em>{currentRank?.accuracy ?? 0}% chính xác</em>
          </div>

          <p>{weeklyChallenge.endsIn}. Cả lớp cùng dùng một challenge chuẩn hóa.</p>

          <button type="button" onClick={onOpenLeaderboard}>
            Xem bảng xếp hạng
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>
  )
}
