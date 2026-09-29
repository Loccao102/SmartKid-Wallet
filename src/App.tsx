import { useState } from 'react'
import {
  Flame,
  Home,
  Map,
  Star,
  Target,
  Trophy,
  User,
  type LucideIcon,
} from 'lucide-react'
import { traineeShift } from './data/workShift'
import { getWorkShiftById } from './data/workShiftInstances'
import { HomeScreen } from './features/home/HomeScreen'
import { LeaderboardScreen } from './features/leaderboard/LeaderboardScreen'
import { ClassPartyMissionScreen } from './features/missions/ClassPartyMissionScreen'
import { MissionsScreen } from './features/missions/MissionsScreen'
import { ProfileScreen } from './features/profile/ProfileScreen'
import { ResearchSyncBridge } from './features/research/ResearchSyncBridge'
import { FeatureErrorBoundary } from './features/system/FeatureErrorBoundary'
import { SmartMartScreen } from './features/smartmart/SmartMartScreen'
import { WorkModeScreen } from './features/work/WorkModeScreen'
import { WorldMapScreen } from './features/world/WorldMapScreen'

type StudentPage =
  | 'home'
  | 'maps'
  | 'smartmart'
  | 'mission-class-party'
  | 'work-mode'
  | 'missions'
  | 'leaderboard'
  | 'profile'

const navItems: Array<{
  id: Exclude<StudentPage, 'smartmart' | 'mission-class-party' | 'work-mode'>
  icon: LucideIcon
  label: string
}> = [
  { id: 'home', icon: Home, label: 'Trang chủ' },
  { id: 'maps', icon: Map, label: 'Bản đồ' },
  { id: 'missions', icon: Target, label: 'Nhiệm vụ' },
  { id: 'leaderboard', icon: Trophy, label: 'Bảng xếp hạng' },
  { id: 'profile', icon: User, label: 'Hồ sơ' },
]

function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="nav-icon" aria-hidden="true">
      <Icon size={18} strokeWidth={2.25} />
    </span>
  )
}

export function App() {
  const [page, setPage] = useState<StudentPage>('maps')
  const [activeWorkShiftId, setActiveWorkShiftId] = useState(traineeShift.id)
  const activeWorkShift = getWorkShiftById(activeWorkShiftId)
  const activeNavPage =
    page === 'smartmart'
      ? 'maps'
      : page === 'mission-class-party' || page === 'work-mode'
        ? 'missions'
        : page

  return (
    <div className="app-shell">
      <ResearchSyncBridge />
      <aside className="student-sidebar">
        <div className="brand-lockup">
          <div className="brand-symbol" aria-hidden="true">
            <Star size={20} strokeWidth={2.4} />
          </div>
          <div className="brand-copy">
            <strong>SmartKid</strong>
            <span>Wallet</span>
          </div>
        </div>

        <nav className="student-nav" aria-label="Điều hướng học sinh">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeNavPage === item.id ? 'is-active' : ''}
              aria-label={item.label}
              aria-current={activeNavPage === item.id ? 'page' : undefined}
              onClick={() => setPage(item.id)}
            >
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-tip">
          <span className="tip-spark" aria-hidden="true">
            <Star size={15} strokeWidth={2.2} />
          </span>
          <strong>Mẹo nhỏ</strong>
          <p>Mỗi khu vực trong SmartMart giúp em luyện một nhóm kỹ năng Toán khác nhau.</p>
        </div>

        <div className="student-mini-profile">
          <div className="avatar">M</div>
          <div>
            <strong>Minh Anh</strong>
            <span>Lớp 5A · Lv. 3</span>
          </div>
          <button type="button" aria-label="Mở hồ sơ" onClick={() => setPage('profile')}>
            ⋯
          </button>
        </div>
      </aside>

      <div className="student-workspace">
        <header className="workspace-header">
          <div>
            <p className="page-kicker">SMARTKID WALLET</p>
            <h1>Chào buổi sáng, Minh Anh!</h1>
            <p>Tiếp tục hành trình tài chính của em nhé.</p>
          </div>

          <div className="header-actions">
            <div className="level-pill">
              <span aria-hidden="true">
                <Star size={20} strokeWidth={2.2} />
              </span>
              <div>
                <strong>Lv. 3</strong>
                <small>120 / 300 XP</small>
              </div>
            </div>
            <div className="streak-pill">
              <span aria-hidden="true">
                <Flame size={20} strokeWidth={2.2} />
              </span>
              <div>
                <strong>7 ngày</strong>
                <small>chuỗi học</small>
              </div>
            </div>
          </div>
        </header>

        <FeatureErrorBoundary
          resetKey={page}
          onRecover={() => setPage('maps')}
        >
          {page === 'maps' ? (
          <WorldMapScreen onOpenSmartMart={() => setPage('smartmart')} />
        ) : page === 'smartmart' ? (
          <SmartMartScreen
            onBack={() => setPage('maps')}
            onStartMission={() => setPage('mission-class-party')}
          />
        ) : page === 'mission-class-party' ? (
          <ClassPartyMissionScreen onBack={() => setPage('smartmart')} />
        ) : page === 'work-mode' ? (
          <WorkModeScreen
            shift={activeWorkShift}
            onBack={() => setPage('missions')}
          />
        ) : page === 'missions' ? (
          <MissionsScreen
            onOpenMission={() => setPage('mission-class-party')}
            onOpenWorkMode={(shiftId) => {
              setActiveWorkShiftId(shiftId)
              setPage('work-mode')
            }}
          />
        ) : page === 'leaderboard' ? (
          <LeaderboardScreen />
        ) : page === 'profile' ? (
          <ProfileScreen />
        ) : (
          <HomeScreen
            onContinueSmartMart={() => setPage('smartmart')}
            onOpenMission={() => setPage('mission-class-party')}
            onOpenLeaderboard={() => setPage('leaderboard')}
          />
        )}
        </FeatureErrorBoundary>
      </div>
    </div>
  )
}
