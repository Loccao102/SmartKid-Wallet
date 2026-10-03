import { lazy, Suspense, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  Grid2X2,
  LockKeyhole,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { AvatarCharacter } from '../../components/avatar/AvatarCharacter'
import { useAvatarProfileStore } from '../../store/avatarProfile'
import { getExerciseFamilyById } from '../../data/exerciseFamilies'
import { stalls } from '../../data/stalls'
import { generateExercise } from '../../domain/exerciseEngine'
import { selectAdaptiveExerciseFamily } from '../../domain/mastery'
import type { ProductStallId, StallDefinition, StallId } from '../../domain/types'
import { createSeed } from '../../lib/seededRandom'
import { useLearningProfileStore } from '../../store/learningProfile'
import { useProgressionStore } from '../../store/progression'
import { ExerciseDialog } from './ExerciseDialog'
import { StallShoppingScreen } from './StallShoppingScreen'

const SmartMartGame = lazy(() => import('../../game/SmartMartGame'))
const demoStudentKey = 'student-demo-minh-anh'

function StallDestination({
  stall,
  state,
  completedCount,
  onOpen,
}: {
  stall: StallDefinition
  state: 'open' | 'available' | 'locked'
  completedCount: number
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      className={`hub-stall hub-stall-${stall.id} is-${state}`}
      disabled={state === 'locked'}
      onClick={onOpen}
      aria-label={`${stall.name}. ${state === 'open' ? 'Đã mở. Vào gian hàng' : state === 'available' ? `Mở gian. Bài ${completedCount + 1}/${stall.unlockFamilyIds.length}` : 'Hoàn thành gian trước để mở'}`}
    >
      <span className="hub-stall-order">
        {state === 'open' ? (
          <Check size={18} aria-hidden="true" />
        ) : (
          stall.order
        )}
      </span>
      <img src={gameAssets.production.stalls[stall.id]} alt="" />
      <span className="hub-stall-sign">
        <strong>{stall.name}</strong>
        {state === 'locked' ? (
          <LockKeyhole size={19} aria-hidden="true" />
        ) : state === 'open' ? (
          <Check size={19} aria-hidden="true" />
        ) : (
          <ArrowRight size={19} aria-hidden="true" />
        )}
      </span>
      <span className="hub-stall-steps" aria-hidden="true">
        {stall.unlockFamilyIds.map((familyId, index) => (
          <span
            key={familyId}
            className={state === 'open' || index < completedCount ? 'is-complete' : ''}
          />
        ))}
      </span>
      <span className="hub-stall-caption">
        {state === 'open'
          ? 'Đã mở · Vào gian hàng'
          : state === 'available'
            ? `Cùng mở gian · Bài ${completedCount + 1}/${stall.unlockFamilyIds.length}`
            : 'Hoàn thành gian trước'}
      </span>
    </button>
  )
}

function MissionGate({
  missionUnlocked,
  unlockedCount,
  onStartMission,
}: {
  missionUnlocked: boolean
  unlockedCount: number
  onStartMission: (stall?: ProductStallId) => void
}) {
  return (
    <div className={`hub-mission-gate ${missionUnlocked ? 'is-open' : ''}`}>
      <span className="mission-gate-symbol">
        {missionUnlocked ? (
          <Target size={25} aria-hidden="true" />
        ) : (
          <LockKeyhole size={25} aria-hidden="true" />
        )}
      </span>
      <div>
        <span>CHẶNG TIẾP THEO</span>
        <strong>Chuẩn bị liên hoan lớp</strong>
        <p>
          {missionUnlocked
            ? 'Tất cả gian đã mở. Cùng lên kế hoạch mua sắm!'
            : `Mở thêm ${stalls.length - unlockedCount} gian để bắt đầu nhiệm vụ.`}
        </p>
      </div>
      <button
        type="button"
        className="adventure-button"
        disabled={!missionUnlocked}
        onClick={() => onStartMission()}
      >
        {missionUnlocked
          ? 'Bắt đầu nhiệm vụ'
          : `${unlockedCount}/${stalls.length} gian đã mở`}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

export function SmartMartScreen({
  onBack,
  onStartMission,
}: {
  onBack: () => void
  onStartMission: (stall?: ProductStallId) => void
}) {
  const avatar = useAvatarProfileStore((state) => state.avatar)
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const stallExerciseProgress = useProgressionStore(
    (state) => state.stallExerciseProgress,
  )
  const unlockStall = useProgressionStore((state) => state.unlockStall)
  const completeStallExercise = useProgressionStore(
    (state) => state.completeStallExercise,
  )
  const [activeStallId, setActiveStallId] = useState<StallId | null>(null)
  const [shoppingStallId, setShoppingStallId] = useState<StallId | null>(null)
  const [nearStallId, setNearStallId] = useState<StallId | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'game'>('overview')
  const [celebration, setCelebration] = useState<string | null>(null)
  const [activePracticeFamilyId, setActivePracticeFamilyId] = useState<string | null>(null)
  const [activePracticeVariant, setActivePracticeVariant] = useState(0)
  const unlockedSet = useMemo(() => new Set(unlockedStalls), [unlockedStalls])
  const nextLockedStall = stalls.find((stall) => !unlockedSet.has(stall.id))
  const unlockedCount = stalls.filter((stall) =>
    unlockedSet.has(stall.id),
  ).length
  const missionUnlocked = unlockedCount === stalls.length
  const activeStall = activeStallId
    ? (stalls.find((stall) => stall.id === activeStallId) ?? null)
    : null
  const activeMode: 'unlock' | 'practice' | null = activeStall
    ? unlockedSet.has(activeStall.id)
      ? 'practice'
      : activeStall.id === nextLockedStall?.id
        ? 'unlock'
        : null
    : null
  const activeCompletedFamilies = activeStall
    ? (stallExerciseProgress[activeStall.id] ?? [])
    : []
  const activeFamilyId =
    activeStall && activeMode
      ? activeMode === 'unlock'
        ? (activeStall.unlockFamilyIds.find(
            (familyId) => !activeCompletedFamilies.includes(familyId),
          ) ??
          activeStall.unlockFamilyIds[activeStall.unlockFamilyIds.length - 1])
        : activePracticeFamilyId
      : null
  const activeFamily = activeFamilyId
    ? getExerciseFamilyById(activeFamilyId)
    : null
  const activeExercise =
    activeStall && activeMode && activeFamily
      ? generateExercise(
          activeFamily,
          demoStudentKey,
          activeMode === 'unlock'
            ? activeCompletedFamilies.length
            : activePracticeVariant,
        )
      : null
  const activeStepNumber =
    activeMode === 'unlock' ? activeCompletedFamilies.length + 1 : 1
  const activeStepTotal = activeStall?.unlockFamilyIds.length ?? 1
  const isFinalUnlock =
    activeMode === 'unlock' && activeStepNumber === activeStepTotal
  const nearStall = nearStallId
    ? (stalls.find((stall) => stall.id === nearStallId) ?? null)
    : null

  const interactWithStall = (stallId: StallId) => {
    if (unlockedSet.has(stallId)) setShoppingStallId(stallId)
    else if (nextLockedStall?.id === stallId) setActiveStallId(stallId)
  }

  const openPractice = (stallId: StallId) => {
    const stall = stalls.find((item) => item.id === stallId)
    if (!stall) return

    const learning = useLearningProfileStore.getState()
    const sequence = learning.nextPracticeSequence(stallId)
    const families = stall.exerciseFamilyIds.map(getExerciseFamilyById)
    const selected = selectAdaptiveExerciseFamily(
      families,
      learning.masteryBySkill,
      learning.recentExerciseFamilyIdsByStall[stallId] ?? [],
      createSeed([demoStudentKey, stallId, sequence, 'adaptive-practice']),
    )

    learning.rememberExerciseFamily(stallId, selected.family.id)
    setActivePracticeFamilyId(selected.family.id)
    setActivePracticeVariant(1000 + stall.order * 10000 + sequence)
    setActiveStallId(stallId)
  }
  const handleExerciseCorrect = () => {
    if (activeMode !== 'unlock' || !activeStall || !activeFamilyId) return
    completeStallExercise(activeStall.id, activeFamilyId)
    if (isFinalUnlock) {
      unlockStall(activeStall.id)
      setCelebration(activeStall.name)
    }
  }

  return (
    <>
    {shoppingStallId ? <StallShoppingScreen stall={stalls.find(stall => stall.id === shoppingStallId)!} missionUnlocked={missionUnlocked} onBack={() => setShoppingStallId(null)} onPractice={() => openPractice(shoppingStallId)} onStartMission={onStartMission} /> :
    <section className="production-hub" aria-labelledby="hub-title">
      <div className="hub-toolbar">
        <button type="button" className="quiet-button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          Bản đồ thế giới
        </button>
        <div
          className="hub-view-switch"
          role="group"
          aria-label="Góc nhìn siêu thị"
        >
          <button
            type="button"
            aria-pressed={viewMode === 'overview'}
            onClick={() => setViewMode('overview')}
          >
            <Grid2X2 size={18} aria-hidden="true" />
            Chọn gian
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'game'}
            onClick={() => setViewMode('game')}
          >
            <Gamepad2 size={18} aria-hidden="true" />
            Đi dạo
          </button>
        </div>
      </div>
      <header className="adventure-heading">
        <div>
          <p className="eyebrow">ĐIỂM ĐẾN ĐẦU TIÊN</p>
          <h1 id="hub-title">Chào mừng đến SmartMart!</h1>
          <p>
            Giải 3 bài Toán để mở mỗi gian. Gian đã mở luôn chờ em quay lại.
          </p>
        </div>
        <div className="hub-progress">
          <strong>
            {unlockedCount}
            <span>/{stalls.length}</span>
          </strong>
          <span>
            gian đã mở
            <progress
              value={unlockedCount}
              max={stalls.length}
              aria-label="Tiến độ mở gian SmartMart"
            />
          </span>
        </div>
      </header>
      {celebration ? (
        <div className="unlock-celebration" role="status">
          <Sparkles size={30} aria-hidden="true" />
          <div>
            <strong>Gian {celebration} đã mở!</strong>
            <span>
              {missionUnlocked
                ? 'Em đã sẵn sàng cho nhiệm vụ liên hoan lớp.'
                : 'Giỏi lắm! Gian tiếp theo đang chờ em khám phá.'}
            </span>
          </div>
          <button
            type="button"
            className="quiet-button"
            aria-label="Đóng thông báo mở gian"
            onClick={() => setCelebration(null)}
          >
            <X size={21} />
          </button>
        </div>
      ) : null}
      {viewMode === 'overview' ? (
        <div className="hub-world">
          <img
            className="hub-floor"
            src={gameAssets.production.hubFloor}
            alt=""
          />
          <div className="hub-scene-heading">
            <div className="hub-welcome-sign">
              <strong>SmartMart</strong>
              <span>Học Toán qua mua sắm</span>
            </div>
            <div className="hub-student">
              <AvatarCharacter config={avatar} className="hub-avatar" label="Nhân vật của em đang khám phá SmartMart" />
              <span>
                {nextLockedStall
                  ? <>Cùng khám phá gian <strong>{nextLockedStall.name}</strong> nhé!</>
                  : 'Các gian đã mở rồi. Cùng chuẩn bị liên hoan lớp nhé!'}
              </span>
            </div>
          </div>
          <div className="hub-destinations">
            {stalls.map((stall) => (
              <StallDestination
                key={stall.id}
                stall={stall}
                state={
                  unlockedSet.has(stall.id)
                    ? 'open'
                    : stall.id === nextLockedStall?.id
                      ? 'available'
                      : 'locked'
                }
                completedCount={stallExerciseProgress[stall.id]?.length ?? 0}
                onOpen={() => interactWithStall(stall.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="hub-walk">
          <p>
            <Gamepad2 size={20} aria-hidden="true" />
            <span>
              Di chuyển bằng phím mũi tên / WASD. Nhấn E / Space khi đến gần
              gian.
            </span>
          </p>
          <Suspense
            fallback={
              <div className="smartmart-game-loading">Đang mở SmartMart…</div>
            }
          >
            <SmartMartGame
              unlockedStalls={unlockedStalls}
              paused={Boolean(activeStallId)}
              onInteractStall={interactWithStall}
              onNearStallChange={setNearStallId}
            />
          </Suspense>
          <div className="hub-near-stall" role="status">
            {nearStall
              ? `${nearStall.name} · ${unlockedSet.has(nearStall.id) ? 'Đã mở' : nextLockedStall?.id === nearStall.id ? 'Sẵn sàng mở bằng Toán' : 'Hoàn thành gian trước'}`
              : 'Đi đến gần một gian hàng để khám phá.'}
          </div>
        </div>
      )}
      <MissionGate
        missionUnlocked={missionUnlocked}
        unlockedCount={unlockedCount}
        onStartMission={onStartMission}
      />
    </section>}
      {activeStall && activeExercise && activeMode ? (
        <ExerciseDialog
          key={activeExercise.id}
          stall={activeStall}
          exercise={activeExercise}
          mode={activeMode}
          stepNumber={activeStepNumber}
          stepTotal={activeStepTotal}
          isFinalUnlock={isFinalUnlock}
          onClose={() => setActiveStallId(null)}
          onCorrect={handleExerciseCorrect}
        />
      ) : null}
    </>
  )
}
