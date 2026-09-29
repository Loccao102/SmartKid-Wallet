import {
  BadgeCheck,
  Flame,
  LockKeyhole,
  Map,
  ShoppingBag,
  Star,
  Trophy,
  User,
} from 'lucide-react'
import { demoStudentProfile } from '../../data/studentDemo'
import { worldMaps } from '../../data/worldMaps'
import { useProgressionStore } from '../../store/progression'

export function ProfileScreen() {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const completedMissionIds = useProgressionStore((state) => state.completedMissionIds)

  const smartMartProgress = Math.round((unlockedStalls.length / 5) * 100)
  const completedFirstMission = completedMissionIds.includes('mission-class-party-01')
  const xpProgress = Math.round(
    (demoStudentProfile.xp / demoStudentProfile.nextLevelXp) * 100,
  )

  return (
    <section className="profile-screen">
      <header className="profile-hero">
        <div className="profile-avatar-large" aria-hidden="true">
          <User size={42} strokeWidth={1.7} />
        </div>

        <div className="profile-hero-copy">
          <p className="page-kicker">HỒ SƠ HỌC SINH</p>
          <h1>{demoStudentProfile.name}</h1>
          <p>
            Lớp {demoStudentProfile.className} · {demoStudentProfile.title}
          </p>

          <div className="profile-xp-row">
            <span>Lv. {demoStudentProfile.level}</span>
            <div aria-label={'Tiến độ cấp độ ' + xpProgress + '%'}>
              <i style={{ width: xpProgress + '%' }} />
            </div>
            <strong>
              {demoStudentProfile.xp}/{demoStudentProfile.nextLevelXp} XP
            </strong>
          </div>
        </div>

        <div className="profile-stat-pills">
          <div>
            <Flame size={19} aria-hidden="true" />
            <span>Chuỗi học</span>
            <strong>{demoStudentProfile.streakDays} ngày</strong>
          </div>
          <div>
            <ShoppingBag size={19} aria-hidden="true" />
            <span>Gian đã mở</span>
            <strong>{unlockedStalls.length}/5</strong>
          </div>
          <div>
            <Trophy size={19} aria-hidden="true" />
            <span>Mission</span>
            <strong>{completedMissionIds.length}</strong>
          </div>
        </div>
      </header>

      <div className="profile-grid">
        <article className="profile-card skill-profile-card">
          <div className="profile-card-heading">
            <div>
              <p className="page-kicker">NĂNG LỰC</p>
              <h2>Kỹ năng của em</h2>
            </div>
            <Star size={21} aria-hidden="true" />
          </div>

          <div className="profile-skill-list">
            {demoStudentProfile.skills.map((skill) => (
              <div key={skill.id}>
                <div>
                  <span>{skill.label}</span>
                  <strong>{skill.score}%</strong>
                </div>
                <div className="profile-skill-track">
                  <i style={{ width: skill.score + '%' }} />
                </div>
              </div>
            ))}
          </div>

          <p className="profile-card-note">
            Điểm kỹ năng sẽ được tính từ các lần làm bài, Mission và Work Mode khi
            hệ thống dữ liệu được nối hoàn chỉnh.
          </p>
        </article>

        <article className="profile-card">
          <div className="profile-card-heading">
            <div>
              <p className="page-kicker">THÀNH TÍCH</p>
              <h2>Huy hiệu</h2>
            </div>
            <BadgeCheck size={21} aria-hidden="true" />
          </div>

          <div className="profile-badge-list">
            {demoStudentProfile.badges.map((badge) => {
              const unlocked =
                badge.id === 'first-stall'
                  ? unlockedStalls.length > 0
                  : badge.id === 'smart-shopper'
                    ? completedFirstMission
                    : true

              return (
                <div key={badge.id} className={unlocked ? 'is-unlocked' : 'is-locked'}>
                  <span aria-hidden="true">
                    {unlocked ? <BadgeCheck size={20} /> : <LockKeyhole size={19} />}
                  </span>
                  <div>
                    <strong>{badge.name}</strong>
                    <p>{badge.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <article className="profile-card world-progress-card">
        <div className="profile-card-heading">
          <div>
            <p className="page-kicker">HÀNH TRÌNH</p>
            <h2>Tiến độ các bản đồ</h2>
          </div>
          <Map size={21} aria-hidden="true" />
        </div>

        <div className="profile-world-list">
          {worldMaps.map((map) => {
            const isSmartMart = map.id === 'smartmart'
            const progress = isSmartMart ? smartMartProgress : 0

            return (
              <div key={map.id} className={isSmartMart ? 'is-active' : 'is-locked'}>
                <div className="profile-world-index">{map.order}</div>
                <div>
                  <strong>{map.name}</strong>
                  <span>
                    {isSmartMart
                      ? unlockedStalls.length + '/5 gian đã mở'
                      : 'Chưa mở'}
                  </span>
                </div>
                <div
                  className="profile-world-track"
                  aria-label={'Tiến độ ' + map.name + ' ' + progress + '%'}
                >
                  <i style={{ width: progress + '%' }} />
                </div>
                <strong>{progress}%</strong>
              </div>
            )
          })}
        </div>
      </article>
    </section>
  )
}
