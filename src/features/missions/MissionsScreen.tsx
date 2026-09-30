import {
  Check,
  LockKeyhole,
  Play,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Target,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { missions } from '../../data/missions'
import { stalls } from '../../data/stalls'
import { traineeShift } from '../../data/workShift'
import { advancedShift, expertShift, managerShift } from '../../data/workShiftInstances'
import { useProgressionStore } from '../../store/progression'
import { useWorkShiftStore } from '../../store/workShift'

function StarBadge({ stars }: { stars: number }) {
  if (!stars) return null
  return (
    <span className="mission-best-stars" aria-label={'Kỷ lục ' + stars + '/5 sao'}>
      <Star size={14} fill="currentColor" />
      {stars}/5
    </span>
  )
}

export function MissionsScreen({
  onOpenMission,
  onOpenWorkMode,
}: {
  onOpenMission: (missionId: string) => void
  onOpenWorkMode: (shiftId: string) => void
}) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const completedMissionIds = useProgressionStore(
    (state) => state.completedMissionIds,
  )
  const level = useProgressionStore((state) => state.level)
  const activityResults = useProgressionStore((state) => state.activityResults)

  const traineeCompleted = useWorkShiftStore(
    (state) => state.progressByShiftId[traineeShift.id]?.completed ?? false,
  )
  const advancedCompleted = useWorkShiftStore(
    (state) => state.progressByShiftId[advancedShift.id]?.completed ?? false,
  )
  const expertCompleted = useWorkShiftStore(
    (state) => state.progressByShiftId[expertShift.id]?.completed ?? false,
  )
  const managerCompleted = useWorkShiftStore(
    (state) => state.progressByShiftId[managerShift.id]?.completed ?? false,
  )

  const firstMissionCompleted = completedMissionIds.includes(missions[0].id)
  const workModeUnlocked = firstMissionCompleted
  const advancedUnlocked = traineeCompleted
  const expertUnlocked = advancedCompleted && level >= 6
  const managerUnlocked = expertCompleted && level >= 8

  return (
    <section className="missions-screen">
      <header className="missions-page-heading">
        <div className="world-heading-icon" aria-hidden="true">
          <Target size={28} strokeWidth={1.9} />
        </div>
        <div>
          <p className="page-kicker">NHIỆM VỤ CỦA EM</p>
          <h1>Mỗi cấp độ mở thêm một thử thách</h1>
          <p>
            Hoàn thành Toán để mở gian, chinh phục nhiệm vụ để lấy sao, rồi
            bước vào những ca làm việc có trade-off và hậu quả thật sự.
          </p>
        </div>
      </header>

      <div className="mission-journey-list">
        {missions.map((mission, index) => {
          const prerequisiteReady =
            !mission.prerequisiteMissionId ||
            completedMissionIds.includes(mission.prerequisiteMissionId)
          const stallsReady =
            mission.id === missions[0].id
              ? stalls.every((stall) => unlockedStalls.includes(stall.id))
              : mission.requiredStalls.every((stallId) =>
                  unlockedStalls.includes(stallId),
                )
          const unlocked =
            level >= mission.unlockLevel && prerequisiteReady && stallsReady
          const completed = completedMissionIds.includes(mission.id)
          const best =
            activityResults['mission:' + mission.id + ':v' + mission.version]

          return (
            <article
              key={mission.id}
              className={
                'journey-mission-card ' +
                (unlocked ? 'is-unlocked' : 'is-locked')
              }
            >
              <div className="journey-step-number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="journey-mission-icon" aria-hidden="true">
                <ShoppingBasket size={30} strokeWidth={1.8} />
              </div>

              <div className="journey-mission-copy">
                <div className="journey-status-row">
                  <span>SHOPPING MISSION · CẤP {mission.unlockLevel}+</span>
                  {completed ? (
                    <em className="journey-status complete">
                      <Check size={12} /> Đã hoàn thành
                    </em>
                  ) : unlocked ? (
                    <em className="journey-status ready">
                      <Play size={11} fill="currentColor" /> Sẵn sàng
                    </em>
                  ) : (
                    <em className="journey-status locked">
                      <LockKeyhole size={12} /> Đang khóa
                    </em>
                  )}
                </div>

                <h2>
                  {mission.title}
                  <StarBadge stars={best?.bestStars ?? 0} />
                </h2>
                <p>{mission.shortDescription}</p>

                {mission.teacherChallenge ? (
                  <div className="teacher-challenge-chip">
                    <Star size={14} />
                    {mission.teacherChallenge.label} · +
                    {mission.teacherChallenge.coinReward} xu
                  </div>
                ) : null}

                <div className="journey-mission-meta">
                  <span>{mission.people} người</span>
                  <span>{mission.budget.toLocaleString('vi-VN')}đ</span>
                  <span>{mission.requiredStalls.length} nhóm hàng</span>
                </div>
              </div>

              <button
                type="button"
                className="journey-action"
                disabled={!unlocked}
                onClick={() => onOpenMission(mission.id)}
              >
                {completed
                  ? 'Chơi lại nâng sao'
                  : unlocked
                    ? 'Bắt đầu'
                    : level < mission.unlockLevel
                      ? 'Cần Cấp ' + mission.unlockLevel
                      : 'Hoàn thành chặng trước'}
              </button>
            </article>
          )
        })}

        <div className="journey-connector" aria-hidden="true">
          <span />
          <Check size={14} />
          <span />
        </div>

        <article
          className={
            'journey-mission-card work-mode-card ' +
            (workModeUnlocked ? 'is-unlocked' : 'is-locked')
          }
        >
          <div className="journey-step-number">W1</div>
          <div className="journey-mission-icon" aria-hidden="true">
            <UserRoundCheck size={30} strokeWidth={1.8} />
          </div>
          <div className="journey-mission-copy">
            <div className="journey-status-row">
              <span>WORK MODE · NHÂN VIÊN TẬP SỰ</span>
              <em
                className={
                  'journey-status ' +
                  (traineeCompleted
                    ? 'complete'
                    : workModeUnlocked
                      ? 'ready'
                      : 'locked')
                }
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
              Phục vụ khách, tính toán khi công việc yêu cầu và đưa ra lựa chọn
              mà không được biết trước điểm số.
            </p>
            <div className="journey-mission-meta">
              <span>3 khách</span>
              <span>Trade-off ẩn</span>
              <span>Chấm 1–5 sao cuối ca</span>
            </div>
          </div>
          <button
            type="button"
            className="journey-action"
            disabled={!workModeUnlocked}
            onClick={() => onOpenWorkMode(traineeShift.id)}
          >
            {traineeCompleted
              ? 'Chơi lại nâng sao'
              : workModeUnlocked
                ? 'Bắt đầu ca làm'
                : 'Hoàn thành Mission đầu'}
          </button>
        </article>

        <div className="journey-connector" aria-hidden="true">
          <span />
          <Check size={14} />
          <span />
        </div>

        <article
          className={
            'journey-mission-card work-mode-card seeded-shift-card ' +
            (advancedUnlocked ? 'is-unlocked' : 'is-locked')
          }
        >
          <div className="journey-step-number">W2</div>
          <div className="journey-mission-icon" aria-hidden="true">
            <UsersRound size={30} strokeWidth={1.8} />
          </div>
          <div className="journey-mission-copy">
            <div className="journey-status-row">
              <span>WORK MODE · QUẦY ĐÔNG KHÁCH</span>
              <em
                className={
                  'journey-status ' +
                  (advancedCompleted
                    ? 'complete'
                    : advancedUnlocked
                      ? 'ready'
                      : 'locked')
                }
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
            <h2>{advancedShift.title}</h2>
            <p>
              6 khách, 4 tình huống và nhiều trade-off hơn. Mỗi lựa chọn có thể
              tác động tới khách sau hoặc cuối ca.
            </p>
            <div className="journey-mission-meta">
              <span>6 khách</span>
              <span>4 tình huống</span>
              <span>Seed cá nhân</span>
            </div>
          </div>
          <button
            type="button"
            className="journey-action"
            disabled={!advancedUnlocked}
            onClick={() => onOpenWorkMode(advancedShift.id)}
          >
            {advancedCompleted
              ? 'Chơi lại nâng sao'
              : advancedUnlocked
                ? 'Bắt đầu Ca 02'
                : 'Hoàn thành Ca 01'}
          </button>
        </article>

        <div className="journey-connector" aria-hidden="true">
          <span />
          <Check size={14} />
          <span />
        </div>

        <article
          className={
            'journey-mission-card work-mode-card seeded-shift-card ' +
            (expertUnlocked ? 'is-unlocked' : 'is-locked')
          }
        >
          <div className="journey-step-number">W3</div>
          <div className="journey-mission-icon" aria-hidden="true">
            <UsersRound size={30} strokeWidth={1.8} />
          </div>
          <div className="journey-mission-copy">
            <div className="journey-status-row">
              <span>WORK MODE · CUỐI TUẦN CAO ĐIỂM · CẤP 6+</span>
              <em
                className={
                  'journey-status ' +
                  (expertCompleted
                    ? 'complete'
                    : expertUnlocked
                      ? 'ready'
                      : 'locked')
                }
              >
                {expertCompleted ? (
                  <Check size={12} />
                ) : expertUnlocked ? (
                  <Play size={11} fill="currentColor" />
                ) : (
                  <LockKeyhole size={12} />
                )}
                {expertCompleted
                  ? 'Đã hoàn thành ca'
                  : expertUnlocked
                    ? 'Ca khó đã sẵn sàng'
                    : level < 6
                      ? 'Cần Cấp 6'
                      : 'Hoàn thành Ca 02'}
              </em>
            </div>
            <h2>{expertShift.title}</h2>
            <p>
              8 khách, 5 tình huống và có thể xuất hiện đổi trả, hàng lỗi,
              coupon, so sánh đơn giá hoặc sự cố bảo quản.
            </p>
            <div className="journey-mission-meta">
              <span>8 khách</span>
              <span>5 tình huống</span>
              <span>Độ khó 1–3</span>
            </div>
          </div>
          <button
            type="button"
            className="journey-action"
            disabled={!expertUnlocked}
            onClick={() => onOpenWorkMode(expertShift.id)}
          >
            {expertCompleted
              ? 'Chơi lại nâng sao'
              : expertUnlocked
                ? 'Bắt đầu Ca 03'
                : level < 6
                  ? 'Cần Cấp 6'
                  : 'Hoàn thành Ca 02'}
          </button>
        </article>

        <div className="journey-connector" aria-hidden="true">
          <span />
          <Check size={14} />
          <span />
        </div>

        <article
          className={
            'journey-mission-card work-mode-card seeded-shift-card ' +
            (managerUnlocked ? 'is-unlocked' : 'is-locked')
          }
        >
          <div className="journey-step-number">W4</div>
          <div className="journey-mission-icon" aria-hidden="true">
            <ShieldCheck size={30} strokeWidth={1.8} />
          </div>
          <div className="journey-mission-copy">
            <div className="journey-status-row">
              <span>SHIFT MANAGER · ĐIỀU PHỐI NGUỒN LỰC · CẤP 8+</span>
              <em
                className={
                  'journey-status ' +
                  (managerCompleted
                    ? 'complete'
                    : managerUnlocked
                      ? 'ready'
                      : 'locked')
                }
              >
                {managerCompleted ? (
                  <Check size={12} />
                ) : managerUnlocked ? (
                  <Play size={11} fill="currentColor" />
                ) : (
                  <LockKeyhole size={12} />
                )}
                {managerCompleted
                  ? 'Đã hoàn thành ca quản lý'
                  : managerUnlocked
                    ? 'Sẵn sàng điều phối'
                    : level < 8
                      ? 'Cần Cấp 8'
                      : 'Hoàn thành Ca 03'}
              </em>
            </div>
            <h2>{managerShift.title}</h2>
            <p>
              Trước khi mở ca, em phải chọn khu vực được ưu tiên nguồn lực.
              Quyết định này có thể chặn một sự cố tương ứng nhưng chỉ dùng
              được một lần trong cả ca.
            </p>
            <div className="journey-mission-meta">
              <span>10 khách</span>
              <span>6 tình huống</span>
              <span>Planning + simulation</span>
            </div>
          </div>
          <button
            type="button"
            className="journey-action"
            disabled={!managerUnlocked}
            onClick={() => onOpenWorkMode(managerShift.id)}
          >
            {managerCompleted
              ? 'Chơi lại với kế hoạch khác'
              : managerUnlocked
                ? 'Lập kế hoạch Ca 04'
                : level < 8
                  ? 'Cần Cấp 8'
                  : 'Hoàn thành Ca 03'}
          </button>
        </article>
      </div>
    </section>
  )
}
