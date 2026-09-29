import {
  Check,
  LockKeyhole,
  Play,
  ShoppingBasket,
  Target,
  UserRoundCheck,
} from 'lucide-react'
import { firstMission } from '../../data/missions'
import { useProgressionStore } from '../../store/progression'
import { useWorkShiftStore } from '../../store/workShift'

export function MissionsScreen({ onOpenMission, onOpenWorkMode }: { onOpenMission: () => void; onOpenWorkMode: () => void }) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const completedMissionIds = useProgressionStore((state) => state.completedMissionIds)
  const workShiftCompleted = useWorkShiftStore((state) => state.progress.completed)

  const missionUnlocked = unlockedStalls.length >= 5
  const missionCompleted = completedMissionIds.includes(firstMission.id)
  const workModeUnlocked = missionCompleted

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
            Nhiệm vụ không hỏi em cần dùng phép tính nào. Em tự chọn cách mua,
            so sánh và điều chỉnh phương án.
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
              <span>WORK MODE · CHẶNG TIẾP THEO</span>
              <em
                className={`journey-status ${
                  workShiftCompleted ? 'complete' : workModeUnlocked ? 'ready' : 'locked'
                }`}
              >
                {workShiftCompleted ? (
                  <Check size={12} />
                ) : workModeUnlocked ? (
                  <Play size={11} fill="currentColor" />
                ) : (
                  <LockKeyhole size={12} />
                )}
                {workShiftCompleted
                  ? 'Đã hoàn thành ca'
                  : workModeUnlocked
                    ? 'Đã mở vai trò'
                    : 'Chưa mở'}
              </em>
            </div>

            <h2>Nhân viên tập sự SmartMart</h2>
            <p>
              Sau khi hiểu cách mua sắm, em sẽ đổi vai: phục vụ khách hàng,
              tính hóa đơn và xử lý các tình huống trong ca làm việc.
            </p>

            <div className="journey-mission-meta">
              <span>Thu ngân</span>
              <span>Khách hàng</span>
              <span>Tình huống</span>
            </div>
          </div>

          <button
            type="button"
            className="journey-action"
            disabled={!workModeUnlocked}
            onClick={onOpenWorkMode}
          >
            {workShiftCompleted
              ? 'Xem kết quả ca'
              : workModeUnlocked
                ? 'Bắt đầu ca làm việc'
                : 'Hoàn thành Mission 01'}
          </button>
        </article>
      </div>
    </section>
  )
}
