import { useEffect, useRef, useState } from 'react'
import {
  BriefcaseBusiness,
  Compass,
  Home,
  Map,
  Star,
  Target,
  Trophy,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { gameAssets } from './assets/registry'
import { demoStudentProfile as student } from './data/studentDemo'
import { traineeShift } from './data/workShift'
import { getWorkShiftById } from './data/workShiftInstances'
import type { ProductStallId } from './domain/types'
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
  { id: 'leaderboard', icon: Trophy, label: 'Xếp hạng' },
  { id: 'profile', icon: User, label: 'Hồ sơ' },
]

export function App() {
  const [page, setPage] = useState<StudentPage>('maps')
  const [missionStall, setMissionStall] = useState<ProductStallId>('produce')
  const openMission = (stall: ProductStallId = 'produce') => { setMissionStall(stall); setPage('mission-class-party') }
  const [activeWorkShiftId, setActiveWorkShiftId] = useState(traineeShift.id)
  const mainRef = useRef<HTMLElement>(null)
  const previousPage = useRef(page)
  const activeWorkShift = getWorkShiftById(activeWorkShiftId)
  const activeNavPage =
    page === 'smartmart'
      ? 'maps'
      : page === 'mission-class-party' || page === 'work-mode'
        ? 'missions'
        : page
  const working = page === 'work-mode'

  useEffect(() => {
    if (previousPage.current === page) return
    previousPage.current = page
    mainRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  return (
    <div
      className={`production-shell ${working ? 'mode-work' : 'mode-learning'} ${page === 'mission-class-party' ? 'is-shopping' : ''}`}
    >
      <ResearchSyncBridge />
      <a href="#student-content" className="skip-link">
        Đến nội dung chính
      </a>
      <header className="game-header">
        <button
          type="button"
          className="game-brand"
          onClick={() => setPage('maps')}
          aria-label="SmartKid Wallet · Bản đồ"
        >
          <span className="game-brand-mark">
            <Wallet size={27} aria-hidden="true" />
            <Star size={13} aria-hidden="true" />
          </span>
          <span>
            <strong>
              SmartKid<span>Wallet</span>
            </strong>
            <small>Học hay, tiêu thông minh</small>
          </span>
        </button>
        <nav className="game-nav" aria-label="Điều hướng học sinh">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              aria-current={activeNavPage === id ? 'page' : undefined}
              onClick={() => setPage(id)}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="game-profile"
          onClick={() => setPage('profile')}
          aria-label={`Hồ sơ ${student.name}`}
        >
          <span className="student-portrait">
            <img src={gameAssets.production.student} alt="" />
          </span>
          <span>
            <strong>{student.name}</strong>
            <small>Lớp {student.className}</small>
          </span>
        </button>
      </header>
      <div className="game-status-bar">
        <span>
          {working ? (
            <BriefcaseBusiness size={17} aria-hidden="true" />
          ) : (
            <Compass size={17} aria-hidden="true" />
          )}
          {working
            ? 'Ca làm tại SmartMart'
            : 'Một hành trình nhỏ, thật nhiều điều hay'}
        </span>
        <span className="game-xp">
          <Star size={17} aria-hidden="true" />
          <strong>Cấp {student.level}</strong>
          <progress
            value={student.xp}
            max={student.nextLevelXp}
            aria-label={`${student.xp} trên ${student.nextLevelXp} XP`}
          />
          <span>
            {student.xp}/{student.nextLevelXp} XP
          </span>
        </span>
      </div>
      <main
        id="student-content"
        className="game-content"
        ref={mainRef}
        tabIndex={-1}
      >
        <FeatureErrorBoundary resetKey={page} onRecover={() => setPage('maps')}>
          {page === 'maps' ? (
            <WorldMapScreen onOpenSmartMart={() => setPage('smartmart')} />
          ) : page === 'smartmart' ? (
            <SmartMartScreen
              onBack={() => setPage('maps')}
              onStartMission={openMission}
            />
          ) : page === 'mission-class-party' ? (
            <ClassPartyMissionScreen initialStall={missionStall} onBack={() => setPage('smartmart')} onWork={() => setPage('missions')} />
          ) : page === 'work-mode' ? (
            <WorkModeScreen
              shift={activeWorkShift}
              onBack={() => setPage('missions')}
            />
          ) : page === 'missions' ? (
            <MissionsScreen
              onOpenMission={() => openMission()}
              onOpenWorkMode={(shiftId) => {
                setActiveWorkShiftId(shiftId)
                setPage('work-mode')
              }}
            />
          ) : page === 'leaderboard' ? (
            <LeaderboardScreen />
          ) : page === 'profile' ? (
            <ProfileScreen onMap={() => setPage('smartmart')} onLeaderboard={() => setPage('leaderboard')} />
          ) : (
            <HomeScreen
              onContinueSmartMart={() => setPage('smartmart')}
              onOpenMission={() => openMission()}
              onOpenLeaderboard={() => setPage('leaderboard')}
            />
          )}
        </FeatureErrorBoundary>
      </main>
      <footer className="game-footer">
        <span>SmartKid Wallet</span>
        <span>Học từng chút · Lớn mỗi ngày</span>
      </footer>
    </div>
  )
}
