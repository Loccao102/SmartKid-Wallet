import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  BriefcaseBusiness,
  Coins,
  Compass,
  Home,
  Map,
  School,
  Star,
  Settings2,
  Target,
  Trophy,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { AvatarCharacter } from './components/avatar/AvatarCharacter'
import { firstMission, getMissionById } from './data/missions'
import { demoStudentProfile as student } from './data/studentDemo'
import { traineeShift } from './data/workShift'
import { getWorkShiftById } from './data/workShiftInstances'
import { xpNeededForNextLevel } from './domain/progression'
import { buildWorkShiftFingerprint } from './domain/workShiftGenerator'
import type { MapId, ProductStallId } from './domain/types'
import { StudentAccountBridge } from './features/classroom/StudentAccountBridge'
import { HomeScreen } from './features/home/HomeScreen'
import { ResearchSyncBridge } from './features/research/ResearchSyncBridge'
import { AudioExperience } from './features/system/AudioExperience'
import { AudioSettingsModal } from './features/system/AudioSettingsModal'
import { FeatureErrorBoundary } from './features/system/FeatureErrorBoundary'
import { WorldMapScreen } from './features/world/WorldMapScreen'
import { useAvatarProfileStore } from './store/avatarProfile'
import { useLearningProfileStore } from './store/learningProfile'
import { useProgressionStore } from './store/progression'
import { useStudentAccountStore } from './store/studentAccount'

// Load each destination when visited; Phaser stays in its own scene chunks.
const SmartMartScreen = lazy(() => import('./features/smartmart/SmartMartScreen').then(m => ({ default: m.SmartMartScreen })))
const WorkModeScreen = lazy(() => import('./features/work/WorkModeScreen').then(m => ({ default: m.WorkModeScreen })))
const TinyBankScreen = lazy(() => import('./features/bank/TinyBankScreen').then(m => ({ default: m.TinyBankScreen })))
const HappyRestaurantScreen = lazy(() => import('./features/restaurant/HappyRestaurantScreen').then(m => ({ default: m.HappyRestaurantScreen })))
const WeekendMarketScreen = lazy(() => import('./features/market/WeekendMarketScreen').then(m => ({ default: m.WeekendMarketScreen })))
const DailyChallengeScreen = lazy(() => import('./features/challenges/DailyChallengeScreen').then(m => ({ default: m.DailyChallengeScreen })))
const WeeklyChallengeScreen = lazy(() => import('./features/challenges/WeeklyChallengeScreen').then(m => ({ default: m.WeeklyChallengeScreen })))
const ClassroomScreen = lazy(() => import('./features/classroom/ClassroomScreen').then(m => ({ default: m.ClassroomScreen })))
const LeaderboardScreen = lazy(() => import('./features/leaderboard/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })))
const ClassPartyMissionScreen = lazy(() => import('./features/missions/ClassPartyMissionScreen').then(m => ({ default: m.ClassPartyMissionScreen })))
const MissionsScreen = lazy(() => import('./features/missions/MissionsScreen').then(m => ({ default: m.MissionsScreen })))
const ProfileScreen = lazy(() => import('./features/profile/ProfileScreen').then(m => ({ default: m.ProfileScreen })))
const AvatarCustomizer = lazy(() => import('./features/profile/AvatarCustomizer').then(m => ({ default: m.AvatarCustomizer })))

type StudentPage =
  | 'home'
  | 'daily-challenge'
  | 'weekly-challenge'
  | 'classroom'
  | 'maps'
  | 'smartmart'
  | 'tiny-bank'
  | 'happy-restaurant'
  | 'weekend-market'
  | 'mission-class-party'
  | 'work-mode'
  | 'missions'
  | 'leaderboard'
  | 'profile'
const EMPTY_WORK_FINGERPRINTS: string[] = []

const navItems: Array<{
  id: Exclude<StudentPage, 'daily-challenge' | 'weekly-challenge' | 'smartmart' | 'mission-class-party' | 'work-mode'>
  icon: LucideIcon
  label: string
}> = [
  { id: 'home', icon: Home, label: 'Trang chủ' },
  { id: 'maps', icon: Map, label: 'Bản đồ' },
  { id: 'classroom', icon: School, label: 'Lớp học' },
  { id: 'missions', icon: Target, label: 'Nhiệm vụ' },
  { id: 'leaderboard', icon: Trophy, label: 'Xếp hạng' },
  { id: 'profile', icon: User, label: 'Nhân vật' },
]

export function App() {
  const [page, setPage] = useState<StudentPage>('maps')
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatar = useAvatarProfileStore((state) => state.avatar)
  const classStudent = useStudentAccountStore((state) => state.student)
  const classRoom = useStudentAccountStore((state) => state.classroom)
  const profileName = classStudent?.display_name ?? student.name
  const profileClassName = classRoom?.name ?? student.className
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
  const [activeWorkVariant, setActiveWorkVariant] = useState(0)
  const recentWorkFingerprintsByKey = useLearningProfileStore(
    (state) => state.recentWorkFingerprintsByKey,
  )
  const recentWorkFingerprints =
    recentWorkFingerprintsByKey[activeWorkShiftId] ?? EMPTY_WORK_FINGERPRINTS
  const rememberWorkFingerprint = useLearningProfileStore(
    (state) => state.rememberWorkFingerprint,
  )
  const mainRef = useRef<HTMLElement>(null)
  const previousPage = useRef(page)
  const activeWorkShift = getWorkShiftById(
    activeWorkShiftId,
    activeWorkVariant,
    recentWorkFingerprints,
  )
  const activeNavPage =
    page === 'smartmart' ||
    page === 'tiny-bank' ||
    page === 'happy-restaurant' ||
    page === 'weekend-market'
      ? 'maps'
      : page === 'mission-class-party' || page === 'work-mode'
        ? 'missions'
        : page === 'daily-challenge'
          ? 'home'
          : page === 'weekly-challenge'
            ? 'leaderboard'
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
      <StudentAccountBridge />
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
              aria-label={label}
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
            aria-label={`Hồ sơ ${profileName}`}
          >
          <span className="student-portrait">
            <AvatarCharacter config={avatar} className="student-avatar-render" decorative />
          </span>
          <span>
            <strong>{profileName}</strong>
            <small>{classStudent ? profileClassName : 'Lớp ' + profileClassName}</small>
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
            : page === 'tiny-bank'
              ? 'Đang khám phá Ngân hàng tí hon'
              : page === 'happy-restaurant'
                ? 'Đang phục vụ tại Nhà hàng vui vẻ'
                : page === 'weekend-market'
                  ? 'Đang khám phá Chợ cuối tuần'
                  : page === 'classroom'
                    ? 'Bài tập và lớp học của em'
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
          <Suspense fallback={<div className="destination-loading" role="status"><Compass size={32} /><h2>Đang chuẩn bị chuyến đi…</h2><p>Chờ một chút nhé!</p></div>}>
          {page === 'daily-challenge' ? (
            <DailyChallengeScreen onBack={() => setPage('home')} />
          ) : page === 'weekly-challenge' ? (
            <WeeklyChallengeScreen onBack={() => setPage('leaderboard')} />
          ) : page === 'classroom' ? (
            <ClassroomScreen />
          ) : page === 'maps' ? (
            <WorldMapScreen
              onEditAvatar={() => setAvatarOpen(true)}
              onOpenMap={(mapId: MapId) => {
                if (mapId === 'smartmart') setPage('smartmart')
                if (mapId === 'tiny-bank') setPage('tiny-bank')
                if (mapId === 'happy-restaurant') setPage('happy-restaurant')
                if (mapId === 'weekend-market') setPage('weekend-market')
              }}
            />
          ) : page === 'smartmart' ? (
            <SmartMartScreen
              onBack={() => setPage('maps')}
              onStartMission={openMissionFromHub}
            />
          ) : page === 'tiny-bank' ? (
            <TinyBankScreen onBack={() => setPage('maps')} />
          ) : page === 'happy-restaurant' ? (
            <HappyRestaurantScreen onBack={() => setPage('maps')} />
          ) : page === 'weekend-market' ? (
            <WeekendMarketScreen onBack={() => setPage('maps')} />
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
              onReplayShift={() => {
                const fingerprint = buildWorkShiftFingerprint(activeWorkShift)
                rememberWorkFingerprint(activeWorkShiftId, fingerprint)
                setActiveWorkVariant((current) => current + 1)
              }}
            />
          ) : page === 'missions' ? (
            <MissionsScreen
              onOpenMission={openMissionById}
              onOpenWorkMode={(shiftId) => {
                setActiveWorkShiftId(shiftId)
                setActiveWorkVariant(0)
                setPage('work-mode')
              }}
            />
          ) : page === 'leaderboard' ? (
            <LeaderboardScreen
              onOpenWeeklyChallenge={() => setPage('weekly-challenge')}
            />
          ) : page === 'profile' ? (
            <ProfileScreen displayName={profileName} classLabel={profileClassName} onMap={() => setPage('smartmart')} onLeaderboard={() => setPage('leaderboard')} />
          ) : (
            <HomeScreen
              onContinueSmartMart={() => setPage('smartmart')}
              onOpenMission={() => openMissionById(firstMission.id)}
              onOpenLeaderboard={() => setPage('leaderboard')}
              onOpenMissions={() => setPage('missions')}
              onOpenDailyChallenge={() => setPage('daily-challenge')}
              onOpenWeeklyChallenge={() => setPage('weekly-challenge')}
            />
          )}
          </Suspense>
        </FeatureErrorBoundary>
      </main>
      {audioSettingsOpen ? (
        <AudioSettingsModal onClose={() => setAudioSettingsOpen(false)} />
      ) : null}
      {avatarOpen ? <FeatureErrorBoundary resetKey="avatar" onRecover={() => setAvatarOpen(false)}><Suspense fallback={<p className="avatar-loading-note" role="status">Đang mở phòng nhân vật…</p>}><AvatarCustomizer onClose={() => setAvatarOpen(false)} /></Suspense></FeatureErrorBoundary> : null}
      <footer className="game-footer">
        <span>SmartKid Wallet</span>
        <span>Học từng chút · Lớn mỗi ngày</span>
        <a href="/teacher">Dành cho giáo viên</a>
      </footer>
    </div>
  )
}
