import { useEffect, useRef, useState } from 'react'
import {
  BriefcaseBusiness,
  Coins,
  Compass,
  Home,
  Map,
  Star,
  Settings2,
  Target,
  Trophy,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { gameAssets } from './assets/registry'
import { firstMission, getMissionById } from './data/missions'
import { demoStudentProfile as student } from './data/studentDemo'
import { traineeShift } from './data/workShift'
import { getWorkShiftById } from './data/workShiftInstances'
import { xpNeededForNextLevel } from './domain/progression'
import type { ProductStallId } from './domain/types'
import { HomeScreen } from './features/home/HomeScreen'
import { LeaderboardScreen } from './features/leaderboard/LeaderboardScreen'
import { ClassPartyMissionScreen } from './features/missions/ClassPartyMissionScreen'
import { MissionsScreen } from './features/missions/MissionsScreen'
import { ProfileScreen } from './features/profile/ProfileScreen'
import { ResearchSyncBridge } from './features/research/ResearchSyncBridge'
import { AudioExperience } from './features/system/AudioExperience'
import { AudioSettingsModal } from './features/system/AudioSettingsModal'
import { FeatureErrorBoundary } from './features/system/FeatureErrorBoundary'
import { SmartMartScreen } from './features/smartmart/SmartMartScreen'
import { WorkModeScreen } from './features/work/WorkModeScreen'
import { WorldMapScreen } from './features/world/WorldMapScreen'
import { useProgressionStore } from './store/progression'

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
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false)
  const level = useProgressionStore((state) => state.level)
  const levelXp = useProgressionStore((state) => state.levelXp)
  const coins = useProgressionStore((state) => state.coins)
  const nextLevelXp = xpNeededForNextLevel(level)
  const [missionStall, setMissionStall] = useState<ProductStallId>('produce')
  const [activeMissionId, setActiveMissionId] = useState(firstMission.id)
  const openMissionFromHub = (stall: ProductStallId = 'produce') => {
    setActiveMissionId(firstMission.id)
    setMissionStall(stall)
    setPage('mission-class-party')
  }
  const openMissionById = (missionId: string) => {
    const mission = getMissionById(missionId)
    setActiveMissionId(missionId)
    setMissionStall(mission.requiredStalls[0] ?? 'produce')
    setPage('mission-class-party')
  }
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
      <AudioExperience />
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
        <div className="game-header-actions">
          <button
            type="button"
            className="audio-settings-trigger"
            onClick={() => setAudioSettingsOpen(true)}
            aria-label="Cài đặt âm thanh"
          >
            <Settings2 size={21} aria-hidden="true" />
          </button>
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
        </div>
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
        <div className="game-economy">
          <span className="game-coins">
            <Coins size={17} aria-hidden="true" />
            <strong>{coins.toLocaleString('vi-VN')} xu</strong>
          </span>
          <span className="game-xp">
            <Star size={17} aria-hidden="true" />
            <strong>Cấp {level}</strong>
            <progress
              value={levelXp}
              max={nextLevelXp}
              aria-label={`${levelXp} trên ${nextLevelXp} XP`}
            />
            <span>
              {levelXp}/{nextLevelXp} XP
            </span>
          </span>
        </div>
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
              onStartMission={openMissionFromHub}
            />
          ) : page === 'mission-class-party' ? (
            <ClassPartyMissionScreen
              missionId={activeMissionId}
              initialStall={missionStall}
              onBack={() => setPage('smartmart')}
              onWork={() => setPage('missions')}
            />
          ) : page === 'work-mode' ? (
            <WorkModeScreen
              shift={activeWorkShift}
              onBack={() => setPage('missions')}
            />
          ) : page === 'missions' ? (
            <MissionsScreen
              onOpenMission={openMissionById}
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
              onOpenMission={() => openMissionById(firstMission.id)}
              onOpenLeaderboard={() => setPage('leaderboard')}
              onOpenMissions={() => setPage('missions')}
            />
          )}
        </FeatureErrorBoundary>
      </main>
      {audioSettingsOpen ? (
        <AudioSettingsModal onClose={() => setAudioSettingsOpen(false)} />
      ) : null}
      <footer className="game-footer">
        <span>SmartKid Wallet</span>
        <span>Học từng chút · Lớn mỗi ngày</span>
      </footer>
    </div>
  )
}
