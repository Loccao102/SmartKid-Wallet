import { lazy, Suspense, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Brain,
  Check,
  Coffee,
  Gamepad2,
  Grid2X2,
  Leaf,
  LockKeyhole,
  NotebookPen,
  Package,
  Play,
  RefreshCcw,
  ShoppingCart,
  Star,
  Tag,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { exerciseFamilies } from '../../data/exerciseFamilies'
import { stalls } from '../../data/stalls'
import { generateExercise } from '../../domain/exerciseEngine'
import type { ExerciseInstance, StallDefinition, StallId } from '../../domain/types'
import { useProgressionStore } from '../../store/progression'

const SmartMartGame = lazy(() => import('../../game/SmartMartGame'))
const demoStudentKey = 'student-demo-minh-anh'

const stallIcons: Record<StallId, LucideIcon> = {
  produce: Leaf,
  food: Package,
  drinks: Coffee,
  supplies: NotebookPen,
  promotion: Tag,
}

const skillLabels: Record<string, string> = {
  addition: 'Cộng',
  subtraction: 'Trừ',
  multiplication: 'Nhân',
  division: 'Chia',
  'unit-price': 'Đơn giá',
  budget: 'Ngân sách',
  percentage: 'Phần trăm',
  measurement: 'Đại lượng',
  fraction: 'Phân số',
  comparison: 'So sánh',
}

function normalizeAnswer(value: string) {
  return Number(value.replace(/[.,\sđ]/gi, ''))
}

function getFamilyForStall(stall: StallDefinition) {
  const familyId = stall.exerciseFamilyIds[0]
  const family = exerciseFamilies.find((item) => item.id === familyId)

  if (!family) {
    throw new Error(`Missing exercise family ${familyId} for stall ${stall.id}`)
  }

  return family
}

function StallIcon({ stallId, size = 34 }: { stallId: StallId; size?: number }) {
  const Icon = stallIcons[stallId]
  return <Icon size={size} strokeWidth={1.8} />
}

function StallCard({
  stall,
  state,
  onOpen,
}: {
  stall: StallDefinition
  state: 'open' | 'available' | 'locked'
  onOpen: () => void
}) {
  const stateText = {
    open: 'Đã mở · Có thể quay lại',
    available: 'Thử thách đang mở',
    locked: 'Hoàn thành gian trước để mở',
  }[state]

  return (
    <button
      type="button"
      className={`smartmart-stall smartmart-stall--${stall.id} is-${state}`}
      onClick={onOpen}
      disabled={state === 'locked'}
    >
      <span className="smartmart-stall-number">{stall.order}</span>
      <span className="smartmart-stall-awning" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </span>

      <span className="smartmart-stall-body">
        <span className="smartmart-stall-icon" aria-hidden="true">
          <StallIcon stallId={stall.id} />
        </span>
        <strong>{stall.name}</strong>
        <span>{stall.description}</span>

        <span className="smartmart-stall-skills">
          {stall.skills.slice(0, 3).map((skill) => (
            <em key={skill}>{skillLabels[skill] ?? skill}</em>
          ))}
        </span>
      </span>

      <span className="smartmart-stall-status">
        <span aria-hidden="true">
          {state === 'open' ? (
            <Check size={14} strokeWidth={2.4} />
          ) : state === 'available' ? (
            <Play size={13} fill="currentColor" strokeWidth={2} />
          ) : (
            <LockKeyhole size={14} strokeWidth={2} />
          )}
        </span>
        {stateText}
      </span>
    </button>
  )
}

function ExerciseModal({
  stall,
  exercise,
  mode,
  onClose,
  onUnlock,
}: {
  stall: StallDefinition
  exercise: ExerciseInstance
  mode: 'unlock' | 'practice'
  onClose: () => void
  onUnlock: () => void
}) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const submit = () => {
    const numericAnswer = normalizeAnswer(answer)

    if (numericAnswer === exercise.answer) {
      setResult('correct')
      if (mode === 'unlock') onUnlock()
      return
    }

    setResult('wrong')
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="challenge-modal smartmart-exercise-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="smartmart-exercise-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="close-button" onClick={onClose} aria-label="Đóng">
          ×
        </button>

        <div className="challenge-topline">
          <div className="challenge-icon" aria-hidden="true">
            <StallIcon stallId={stall.id} size={29} />
          </div>
          <div>
            <p className="page-kicker">
              {mode === 'unlock' ? 'THỬ THÁCH MỞ KHÓA' : 'LUYỆN THÊM'}
            </p>
            <h3 id="smartmart-exercise-title">{stall.name}</h3>
          </div>
        </div>

        <div className="exercise-family-summary">
          <strong>{getFamilyForStall(stall).name}</strong>
          <span>Seed #{exercise.seed}</span>
        </div>

        <div className="question-card">
          <small>BÀI TOÁN CỦA EM</small>
          <p>{exercise.prompt}</p>
        </div>

        <label className="answer-label">
          <span>Đáp án</span>
          <div className="answer-row">
            <input
              autoFocus
              inputMode="numeric"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value)
                if (result !== 'idle') setResult('idle')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submit()
              }}
              placeholder="Nhập kết quả"
              aria-describedby="exercise-feedback"
            />
            <span>{exercise.unit}</span>
          </div>
        </label>

        {result === 'correct' ? (
          <div className="feedback success" id="exercise-feedback">
            <span aria-hidden="true">
              <Check size={16} strokeWidth={2.5} />
            </span>
            <p>
              {mode === 'unlock'
                ? 'Chính xác! Gian hàng đã được mở và sẽ không bị khóa lại.'
                : 'Chính xác! Em vẫn nhớ rất tốt kỹ năng ở gian này.'}
            </p>
          </div>
        ) : null}

        {result === 'wrong' ? (
          <div className="feedback" id="exercise-feedback">
            <span aria-hidden="true">
              <RefreshCcw size={15} strokeWidth={2.2} />
            </span>
            <p>Chưa đúng. Em thử đọc lại dữ kiện và tính từng bước nhé.</p>
          </div>
        ) : null}

        {result === 'correct' ? (
          <button type="button" className="primary-button" onClick={onClose}>
            {mode === 'unlock' ? 'Tiếp tục hành trình →' : 'Quay lại gian hàng'}
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={submit}>
            Kiểm tra đáp án
          </button>
        )}
      </div>
    </div>
  )
}

function MissionGate({
  missionUnlocked,
  unlockedCount,
  onStartMission,
}: {
  missionUnlocked: boolean
  unlockedCount: number
  onStartMission: () => void
}) {
  return (
    <div className={`smartmart-mission-gate ${missionUnlocked ? 'is-open' : ''}`}>
      <span className="mission-gate-icon" aria-hidden="true">
        {missionUnlocked ? (
          <Target size={24} strokeWidth={2} />
        ) : (
          <LockKeyhole size={22} strokeWidth={2} />
        )}
      </span>
      <div>
        <small>CHẶNG TIẾP THEO</small>
        <strong>Mission: Chuẩn bị liên hoan lớp</strong>
        <p>
          {missionUnlocked
            ? 'Tất cả gian đã mở. Bài vận dụng tổng hợp đã sẵn sàng.'
            : `Mở thêm ${5 - unlockedCount} gian để bắt đầu bài vận dụng đầu tiên.`}
        </p>
      </div>
      <button type="button" disabled={!missionUnlocked} onClick={onStartMission}>
        {missionUnlocked ? 'Bắt đầu Mission →' : 'Đang khóa'}
      </button>
    </div>
  )
}

export function SmartMartScreen({
  onBack,
  onStartMission,
}: {
  onBack: () => void
  onStartMission: () => void
}) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const unlockStall = useProgressionStore((state) => state.unlockStall)
  const resetProgression = useProgressionStore((state) => state.resetProgression)
  const [activeStallId, setActiveStallId] = useState<StallId | null>(null)
  const [nearStallId, setNearStallId] = useState<StallId | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'game'>('game')

  const unlockedSet = useMemo(() => new Set(unlockedStalls), [unlockedStalls])
  const nextLockedStall = stalls.find((stall) => !unlockedSet.has(stall.id))
  const unlockedCount = stalls.filter((stall) => unlockedSet.has(stall.id)).length
  const progress = Math.round((unlockedCount / stalls.length) * 100)
  const missionUnlocked = unlockedCount === stalls.length

  const activeStall = activeStallId
    ? stalls.find((stall) => stall.id === activeStallId) ?? null
    : null

  const activeMode: 'unlock' | 'practice' | null = activeStall
    ? unlockedSet.has(activeStall.id)
      ? 'practice'
      : activeStall.id === nextLockedStall?.id
        ? 'unlock'
        : null
    : null

  const activeExercise = activeStall && activeMode
    ? generateExercise(
        getFamilyForStall(activeStall),
        demoStudentKey,
        activeMode === 'unlock' ? 0 : 1,
      )
    : null

  const nearStall = nearStallId
    ? stalls.find((stall) => stall.id === nearStallId) ?? null
    : null

  const interactWithStall = (stallId: StallId) => {
    const isOpen = unlockedSet.has(stallId)
    const isAvailable = nextLockedStall?.id === stallId

    if (isOpen || isAvailable) {
      setActiveStallId(stallId)
    }
  }

  return (
    <section className="smartmart-screen">
      <div className="smartmart-toolbar">
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={15} aria-hidden="true" />
          Quay lại bản đồ
        </button>

        <div className="smartmart-view-switch" aria-label="Chọn góc nhìn SmartMart">
          <button
            type="button"
            className={viewMode === 'game' ? 'is-active' : ''}
            onClick={() => setViewMode('game')}
          >
            <Gamepad2 size={15} aria-hidden="true" />
            Đi trong siêu thị
          </button>
          <button
            type="button"
            className={viewMode === 'overview' ? 'is-active' : ''}
            onClick={() => setViewMode('overview')}
          >
            <Grid2X2 size={15} aria-hidden="true" />
            Tổng quan
          </button>
        </div>

        <div className="smartmart-progress">
          <span>{unlockedCount}/5 gian đã mở</span>
          <div aria-label={`Tiến độ SmartMart ${progress}%`}>
            <i style={{ width: `${progress}%` }} />
          </div>
          <strong>{progress}%</strong>
        </div>
      </div>

      <header className="smartmart-hero">
        <div>
          <p className="page-kicker">BẢN ĐỒ 1 · ĐANG KHÁM PHÁ</p>
          <h1>
            <ShoppingCart size={28} strokeWidth={1.9} aria-hidden="true" />
            SmartMart – Siêu thị
          </h1>
          <p>
            Mỗi gian hàng đại diện cho một nhóm Toán khác nhau. Em có thể đi tới quầy
            để tương tác hoặc chuyển sang góc tổng quan.
          </p>
        </div>

        <div className="smartmart-wallet">
          <span aria-hidden="true">
            <Wallet size={25} strokeWidth={1.9} />
          </span>
          <div>
            <small>HÀNH TRÌNH HIỆN TẠI</small>
            <strong>{missionUnlocked ? 'Sẵn sàng nhận Mission' : 'Khám phá các gian'}</strong>
          </div>
        </div>
      </header>

      {viewMode === 'game' ? (
        <div className="smartmart-game-shell">
          <div className="smartmart-game-hud">
            <div>
              <Gamepad2 size={18} aria-hidden="true" />
              <span>
                <strong>Điều khiển:</strong> WASD / phím mũi tên · E / Space để tương tác
              </span>
            </div>

            <div className={`smartmart-near-stall ${nearStall ? 'is-visible' : ''}`}>
              {nearStall ? (
                <>
                  <StallIcon stallId={nearStall.id} size={18} />
                  <span>
                    Gần <strong>{nearStall.name}</strong>
                  </span>
                </>
              ) : (
                <span>Đi tới gần một gian hàng</span>
              )}
            </div>
          </div>

          <Suspense
            fallback={
              <div className="smartmart-game-loading">
                <Gamepad2 size={28} />
                <strong>Đang mở SmartMart...</strong>
              </div>
            }
          >
            <SmartMartGame
              unlockedStalls={unlockedStalls}
              paused={Boolean(activeStallId)}
              onInteractStall={interactWithStall}
              onNearStallChange={setNearStallId}
            />
          </Suspense>

          <MissionGate
            missionUnlocked={missionUnlocked}
            unlockedCount={unlockedCount}
            onStartMission={onStartMission}
          />
        </div>
      ) : (
        <div className="smartmart-map-stage">
          <div className="smartmart-store-sign">
            <span aria-hidden="true">
              <Star size={20} strokeWidth={2} />
            </span>
            <div>
              <strong>SMARTMART</strong>
              <small>HỌC TOÁN QUA MUA SẮM</small>
            </div>
          </div>

          <div className="smartmart-path" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="smartmart-stalls-grid">
            {stalls.map((stall) => {
              const state = unlockedSet.has(stall.id)
                ? 'open'
                : stall.id === nextLockedStall?.id
                  ? 'available'
                  : 'locked'

              return (
                <StallCard
                  key={stall.id}
                  stall={stall}
                  state={state}
                  onOpen={() => setActiveStallId(stall.id)}
                />
              )
            })}
          </div>

          <MissionGate
            missionUnlocked={missionUnlocked}
            unlockedCount={unlockedCount}
            onStartMission={onStartMission}
          />
        </div>
      )}

      <div className="smartmart-info-row">
        <article>
          <span aria-hidden="true">
            <Brain size={22} strokeWidth={1.9} />
          </span>
          <div>
            <strong>Bài mở khóa có đáp số</strong>
            <p>Mỗi học sinh nhận một biến thể số liệu ổn định theo seed.</p>
          </div>
        </article>
        <article>
          <span aria-hidden="true">
            <RefreshCcw size={21} strokeWidth={1.9} />
          </span>
          <div>
            <strong>Gian mở là mở lâu dài</strong>
            <p>Quay lại gian đã mở để luyện thêm mà không phải mở khóa lại.</p>
          </div>
        </article>
        <button type="button" className="demo-reset" onClick={resetProgression}>
          <RefreshCcw size={13} aria-hidden="true" />
          Reset tiến trình demo
        </button>
      </div>

      {activeStall && activeExercise && activeMode ? (
        <ExerciseModal
          key={activeExercise.id}
          stall={activeStall}
          exercise={activeExercise}
          mode={activeMode}
          onClose={() => setActiveStallId(null)}
          onUnlock={() => unlockStall(activeStall.id)}
        />
      ) : null}
    </section>
  )
}
