import {
  Check,
  LockKeyhole,
  Play,
  ShoppingBasket,
  Target,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { firstMission } from '../../data/missions'
import { traineeShift } from '../../data/workShift'
import { advancedShift } from '../../data/workShiftInstances'
import { useProgressionStore } from '../../store/progression'
import { useWorkShiftStore } from '../../store/workShift'

export function MissionsScreen({
  onOpenMission,
  onOpenWorkMode,
}: {
  onOpenMission: () => void
  onOpenWorkMode: (shiftId: string) => void
}) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const completedMissionIds = useProgressionStore((state) => state.completedMissionIds)
  const traineeCompleted = useWorkShiftStore(
    (state) => state.progressByShiftId[traineeShift.id]?.completed ?? false,
  )
  const advancedCompleted = useWorkShiftStore(
    (state) => state.progressByShiftId[advancedShift.id]?.completed ?? false,
  )

  const missionUnlocked = unlockedStalls.length >= 5
  const missionCompleted = completedMissionIds.includes(firstMission.id)
  const workModeUnlocked = missionCompleted
  const advancedUnlocked = traineeCompleted

  return (
    <section className="missions-screen">
      <header className="missions-page-heading">
        <div className="world-heading-icon" aria-hidden="true">
          <Target size={28} strokeWidth={1.9} />
        </div>
        <div>
          <p className="page-kicker">NHIỆM VỤ CỦA EM</p>
          <h1>Vận dụng những gì em đã học</h1>
          <p>
            Mở các gian, hoàn thành Mission mua sắm rồi chuyển sang vai trò nhân
            viên với những ca làm việc ngày càng khó hơn.
          </p>
        </div>
      </header>

      <div className="mission-journey-list">
        <article className={`journey-mission-card ${missionUnlocked ? 'is-unlocked' : 'is-locked'}`}>
          <div className="journey-step-number">01</div>
          <div className="journey-mission-icon" aria-hidden="true">
            <ShoppingBasket size={30} strokeWidth={1.8} />
          </div>

          <div className="journey-mission-copy">
            <div className="journey-status-row">
              <span>BÀI VẬN DỤNG · SMARTMART</span>
              {missionCompleted ? (
                <em className="journey-status complete">
                  <Check size={12} /> Đã hoàn thành
                </em>
              ) : missionUnlocked ? (
                <em className="journey-status ready">
                  <Play size={11} fill="currentColor" /> Sẵn sàng
                </em>
              ) : (
                <em className="journey-status locked">
                  <LockKeyhole size={12} /> Đang khóa
                </em>
              )}
            </div>

            <h2>{firstMission.title}</h2>
            <p>{firstMission.shortDescription}</p>

            <div className="journey-mission-meta">
              <span>20 bạn</span>
              <span>500.000đ</span>
              <span>3 gian hàng</span>
            </div>
          </div>

          <button
            type="button"
            className="journey-action"
            disabled={!missionUnlocked}
            onClick={onOpenMission}
          >
            {missionCompleted ? 'Chơi lại' : missionUnlocked ? 'Bắt đầu' : 'Mở đủ 5 gian'}
          </button>
        </article>

        <div className="journey-connector" aria-hidden="true">
          <span />
          <Check size={14} />
          <span />
        </div>

        <article className={`journey-mission-card work-mode-card ${workModeUnlocked ? 'is-unlocked' : 'is-locked'}`}>
          <div className="journey-step-number">02</div>
          <div className="journey-mission-icon" aria-hidden="true">
            <UserRoundCheck size={30} strokeWidth={1.8} />
          </div>

          <div className="journey-mission-copy">
            <div className="journey-status-row">
              <span>WORK MODE · ONBOARDING</span>
              <em
                className={`journey-status ${
                  traineeCompleted ? 'complete' : workModeUnlocked ? 'ready' : 'locked'
                }`}
              >
                {traineeCompleted ? (
                  <Check size={12} />
                ) : workModeUnlocked ? (
                  <Play size={11} fill="currentColor" />
                ) : (
                  <LockKeyhole size={12} />
                )}
                {traineeCompleted
                  ? 'Đã hoàn thành ca'
                  : workModeUnlocked
                    ? 'Đã mở vai trò'
                    : 'Chưa mở'}
              </em>
            </div>

            <h2>{traineeShift.title} · Nhân viên tập sự</h2>
            <p>
              Phục vụ 3 khách đầu tiên, tính hóa đơn, tiền thừa và xử lý hai tình
              huống cơ bản tại quầy.
            </p>

            <div className="journey-mission-meta">
              <span>3 khách</span>
              <span>2 event</span>
              <span>Thu ngân cơ bản</span>
            </div>
          </div>

          <button
            type="button"
            className="journey-action"
            disabled={!workModeUnlocked}
            onClick={() => onOpenWorkMode(traineeShift.id)}
          >
            {traineeCompleted
              ? 'Xem kết quả ca'
              : workModeUnlocked
                ? 'Bắt đầu ca làm việc'
                : 'Hoàn thành Mission 01'}
          </button>
        </article>

        <div className="journey-connector" aria-hidden="true">
          <span />
          <Check size={14} />
          <span />
        </div>

        <article className={`journey-mission-card work-mode-card seeded-shift-card ${advancedUnlocked ? 'is-unlocked' : 'is-locked'}`}>
          <div className="journey-step-number">03</div>
          <div className="journey-mission-icon" aria-hidden="true">
            <UsersRound size={30} strokeWidth={1.8} />
          </div>

          <div className="journey-mission-copy">
            <div className="journey-status-row">
              <span>WORK MODE · SEEDED SHIFT</span>
              <em
                className={`journey-status ${
                  advancedCompleted
                    ? 'complete'
                    : advancedUnlocked
                      ? 'ready'
                      : 'locked'
                }`}
              >
                {advancedCompleted ? (
                  <Check size={12} />
                ) : advancedUnlocked ? (
                  <Play size={11} fill="currentColor" />
                ) : (
                  <LockKeyhole size={12} />
                )}
                {advancedCompleted
                  ? 'Đã hoàn thành ca'
                  : advancedUnlocked
                    ? 'Ca cá nhân đã sẵn sàng'
                    : 'Hoàn thành Ca 01'}
              </em>
            </div>

            <h2>{advancedShift.title} · Quầy đông khách</h2>
            <p>
              Một ca 6 khách được sinh riêng cho học sinh. Scenario và thứ tự khách
              thay đổi theo seed nhưng luôn replay được chính xác.
            </p>

            <div className="journey-mission-meta">
              <span>6 khách</span>
              <span>4 event</span>
              <span>Seed #{advancedShift.seed}</span>
            </div>
          </div>

          <button
            type="button"
            className="journey-action"
            disabled={!advancedUnlocked}
            onClick={() => onOpenWorkMode(advancedShift.id)}
          >
            {advancedCompleted
              ? 'Xem kết quả ca'
              : advancedUnlocked
                ? 'Bắt đầu Ca 02'
                : 'Hoàn thành Ca 01'}
          </button>
        </article>
      </div>
    </section>
  )
}
