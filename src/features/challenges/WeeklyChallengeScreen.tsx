import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  RotateCcw,
  ShieldCheck,
  Star,
  Trophy,
  UsersRound,
} from 'lucide-react'
import {
  createWeeklyChallenge,
  createWeeklyMathExercises,
  createWeeklyScenarioRounds,
  getVietnamWeekEndsAt,
  scoreWeeklyChallenge,
  type WeeklyChallengeRunScore,
} from '../../domain/weeklyChallenge'
import {
  fetchWeeklyLeaderboard,
  submitWeeklyChallengeAttempt,
  type WeeklyLeaderboardEntry,
} from '../../lib/weeklyChallengeRemote'
import { playGameSfx } from '../../lib/audioEngine'
import { getOrCreateWeeklyVariantKey } from '../../lib/weeklyVariantKey'
import { getExerciseFamilyById } from '../../data/exerciseFamilies'
import { stalls } from '../../data/stalls'
import type { WorkScenarioChoice } from '../../domain/types'
import { useProgressionStore } from '../../store/progression'

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes + ':' + String(seconds).padStart(2, '0')
}

function remainingLabel(endsAt: Date) {
  const diff = Math.max(0, endsAt.getTime() - Date.now())
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  if (days > 0) return 'Còn ' + days + ' ngày ' + hours + ' giờ'
  return 'Còn ' + hours + ' giờ'
}

function ArenaLeaderboard({
  rows,
  loading,
}: {
  rows: WeeklyLeaderboardEntry[]
  loading: boolean
}) {
  return (
    <section className="weekly-live-board" aria-labelledby="weekly-board-title">
      <header>
        <div>
          <p className="eyebrow">BẢNG XẾP HẠNG TRỰC TIẾP</p>
          <h2 id="weekly-board-title">Top SmartMart tuần này</h2>
        </div>
        <UsersRound size={24} aria-hidden="true" />
      </header>
      {loading ? (
        <p>Đang tải bảng xếp hạng…</p>
      ) : rows.length === 0 ? (
        <p>Chưa có lượt thi nào. Em có thể là người mở bảng tuần này.</p>
      ) : (
        <ol>
          {rows.map((row) => (
            <li key={row.playerCode}>
              <span className="weekly-rank">{row.rank}</span>
              <strong>{row.playerCode}</strong>
              <span className="weekly-stars">
                <Star size={15} fill="currentColor" />
                {row.bestStars}/5
              </span>
              <span>{Math.round(row.bestScore)} điểm</span>
              <span>{formatDuration(row.bestElapsedMs)}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="weekly-privacy-note">
        <ShieldCheck size={16} />
        Bảng công khai chỉ dùng mã người chơi ẩn danh, không hiển thị tên thật.
      </p>
    </section>
  )
}

export function WeeklyChallengeScreen({ onBack }: { onBack: () => void }) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const awardXpOnce = useProgressionStore((state) => state.awardXpOnce)
  const claimChallengeReward = useProgressionStore(
    (state) => state.claimChallengeReward,
  )
  const recordActivityResult = useProgressionStore(
    (state) => state.recordActivityResult,
  )
  const activityResults = useProgressionStore((state) => state.activityResults)

  const challenge = useMemo(() => createWeeklyChallenge(), [])
  const variantKey = useMemo(() => getOrCreateWeeklyVariantKey(), [])
  const exercises = useMemo(
    () => createWeeklyMathExercises(challenge, variantKey),
    [challenge, variantKey],
  )
  const scenarioRounds = useMemo(
    () => createWeeklyScenarioRounds(challenge, variantKey),
    [challenge, variantKey],
  )
  const scenarios = useMemo(
    () => scenarioRounds.map((round) => round.scenario),
    [scenarioRounds],
  )
  const endsAt = useMemo(() => getVietnamWeekEndsAt(), [])

  const startedAtRef = useRef(Date.now())
  const [mathIndex, setMathIndex] = useState(0)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [attemptCounts, setAttemptCounts] = useState<number[]>(
    Array(exercises.length).fill(0),
  )
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [choiceIds, setChoiceIds] = useState<string[]>([])
  const [selectedChoice, setSelectedChoice] =
    useState<WorkScenarioChoice | null>(null)
  const [result, setResult] = useState<WeeklyChallengeRunScore | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [submissionMessage, setSubmissionMessage] = useState('')

  const allStallsReady = stalls.every((stall) =>
    unlockedStalls.includes(stall.id),
  )
  const activityId = 'weekly:' + challenge.id
  const previousBest = activityResults[activityId]

  const refreshLeaderboard = async () => {
    setLeaderboardLoading(true)
    try {
      setLeaderboard(await fetchWeeklyLeaderboard(challenge.id, 20))
    } catch {
      setLeaderboard([])
    } finally {
      setLeaderboardLoading(false)
    }
  }

  useEffect(() => {
    void refreshLeaderboard()
  }, [challenge.id])

  const inMath = mathIndex < exercises.length
  const inScenario = !inMath && scenarioIndex < scenarios.length
  const exercise = inMath ? exercises[mathIndex] : null
  const scenarioRound = inScenario ? scenarioRounds[scenarioIndex] : null
  const scenario = scenarioRound?.scenario ?? null
  const orderedScenarioChoices =
    scenario && scenarioRound
      ? scenarioRound.choiceOrder
          .map((choiceId) =>
            scenario.choices.find((choice) => choice.id === choiceId),
          )
          .filter((choice): choice is WorkScenarioChoice => Boolean(choice))
      : []

  const submitMath = () => {
    if (!exercise || !answer.trim() || feedback !== 'idle') return

    const numericAnswer = Number(answer.replace(/[.,\sđ]/gi, ''))
    const correct = numericAnswer === exercise.answer
    const attemptsBefore = attemptCounts[mathIndex] ?? 0

    setAttemptCounts((current) =>
      current.map((value, index) =>
        index === mathIndex ? value + 1 : value,
      ),
    )

    if (!correct) {
      setFeedback('wrong')
      playGameSfx('retry')
      return
    }

    if (attemptsBefore === 0) {
      setFirstTryCorrect((value) => value + 1)
    }
    setFeedback('correct')
    playGameSfx('correct')
  }

  const retryMath = () => {
    setAnswer('')
    setFeedback('idle')
  }

  const continueMath = () => {
    setAnswer('')
    setFeedback('idle')
    setMathIndex((value) => value + 1)
  }

  const chooseScenario = (choice: WorkScenarioChoice) => {
    setSelectedChoice(choice)
    playGameSfx('click')
  }

  const finishRun = async (finalChoiceIds: string[]) => {
    const elapsed = Date.now() - startedAtRef.current
    const totalMathAttempts = attemptCounts.reduce(
      (sum, value) => sum + value,
      0,
    )
    const score = scoreWeeklyChallenge({
      challenge,
      firstTryCorrect,
      totalMathAttempts,
      choiceIds: finalChoiceIds,
      elapsedMs: elapsed,
    })

    setElapsedMs(elapsed)
    setResult(score)

    const xpResult = awardXpOnce(activityId + ':xp', challenge.xpReward)
    if (xpResult?.levelsGained) playGameSfx('level-up')
    else if (xpResult) playGameSfx('xp')

    const coinClaimed = claimChallengeReward(
      activityId + ':coins',
      challenge.coinReward,
    )
    if (coinClaimed) playGameSfx('coin')

    recordActivityResult(
      activityId,
      score.stars,
      score.total,
      elapsed,
    )
    playGameSfx('mission-complete')

    setSubmissionMessage('Đang gửi kết quả lên bảng tuần…')
    try {
      const submitted = await submitWeeklyChallengeAttempt({
        challenge,
        score,
        elapsedMs: elapsed,
        firstTryCorrect,
        totalMathAttempts,
      })
      setSubmissionMessage(
        submitted.status === 'submitted'
          ? 'Kết quả đã lên bảng tuần.'
          : 'Kết quả đã lưu trên máy; bảng online hiện chưa khả dụng.',
      )
      await refreshLeaderboard()
    } catch {
      setSubmissionMessage(
        'Lượt chơi vẫn được lưu trên máy, nhưng chưa gửi được bảng online.',
      )
    }
  }

  const continueScenario = () => {
    if (!scenario || !selectedChoice) return

    const nextChoiceIds = [...choiceIds, selectedChoice.id]
    setChoiceIds(nextChoiceIds)
    setSelectedChoice(null)

    if (scenarioIndex >= scenarios.length - 1) {
      void finishRun(nextChoiceIds)
      return
    }

    setScenarioIndex((value) => value + 1)
  }

  const resetRun = () => {
    startedAtRef.current = Date.now()
    setMathIndex(0)
    setScenarioIndex(0)
    setAnswer('')
    setFeedback('idle')
    setAttemptCounts(Array(exercises.length).fill(0))
    setFirstTryCorrect(0)
    setChoiceIds([])
    setSelectedChoice(null)
    setResult(null)
    setElapsedMs(0)
    setSubmissionMessage('')
  }

  if (!allStallsReady) {
    return (
      <section className="weekly-arena weekly-locked">
        <Trophy size={52} />
        <p className="eyebrow">SMARTMART WEEKLY ARENA</p>
        <h1>Mở đủ 5 gian để thi đấu công bằng</h1>
        <p>
          Challenge tuần dùng cả 5 nhóm kiến thức SmartMart. Khi mọi gian đã
          mở, tất cả người chơi nhận cùng cấu trúc và độ khó, nhưng dữ kiện số
          được biến đổi để hạn chế học thuộc hoặc truyền đáp án.
        </p>
        <button type="button" className="adventure-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Quay lại SmartMart
        </button>
      </section>
    )
  }

  if (result) {
    return (
      <section className="weekly-arena">
        <div className="shop-toolbar">
          <button type="button" className="quiet-button" onClick={onBack}>
            <ArrowLeft size={18} />
            Quay lại
          </button>
          <span className="weekly-time-left">
            <Clock3 size={16} />
            {remainingLabel(endsAt)}
          </span>
        </div>

        <section className="weekly-result">
          <BadgeCheck size={54} />
          <p className="eyebrow">KẾT QUẢ WEEKLY ARENA</p>
          <h1>
            {result.stars === 5
              ? 'Một lượt thi 5 sao!'
              : 'Em đã hoàn thành lượt thi tuần.'}
          </h1>
          <div className="run-stars" aria-label={result.stars + ' trên 5 sao'}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={34}
                className={index < result.stars ? 'is-earned' : ''}
              />
            ))}
          </div>

          <div className="weekly-score-grid">
            <span>
              Toán lần đầu
              <strong>{Math.round(result.accuracy)}/55</strong>
            </span>
            <span>
              Tình huống
              <strong>{Math.round(result.decisions)}/30</strong>
            </span>
            <span>
              Thời gian
              <strong>{Math.round(result.time)}/15</strong>
            </span>
            <span>
              Tổng
              <strong>{Math.round(result.total)}/100</strong>
            </span>
          </div>

          <p>
            Hoàn thành tuần đầu tiên nhận +{challenge.xpReward} XP và +
            {challenge.coinReward} xu. Chơi lại chỉ giúp nâng kỷ lục, không farm
            thưởng.
          </p>
          {previousBest ? (
            <p className="weekly-best">
              Kỷ lục trước: {previousBest.bestStars}/5 ★ ·{' '}
              {Math.round(previousBest.bestScore)} điểm
            </p>
          ) : null}
          <p className="weekly-submit-status">{submissionMessage}</p>

          <div className="work-result-actions">
            <button type="button" className="outline-button" onClick={resetRun}>
              Thi lại để nâng hạng
            </button>
            <button type="button" className="adventure-button" onClick={onBack}>
              Tiếp tục SmartMart
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <ArenaLeaderboard
          rows={leaderboard}
          loading={leaderboardLoading}
        />
      </section>
    )
  }

  const completedSteps =
    Math.min(mathIndex, exercises.length) + scenarioIndex
  const totalSteps = exercises.length + scenarios.length

  return (
    <section className="weekly-arena">
      <div className="shop-toolbar">
        <button type="button" className="quiet-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <span className="weekly-time-left">
          <Clock3 size={16} />
          {remainingLabel(endsAt)}
        </span>
      </div>

      <header className="weekly-heading">
        <div>
          <p className="eyebrow">SMARTMART WEEKLY ARENA · {challenge.weekKey}</p>
          <h1>{challenge.title}</h1>
          <p>{challenge.subtitle}</p>
        </div>
        <div className="weekly-fairness">
          <ShieldCheck size={21} />
          <span>
            <strong>Cùng blueprint, dữ kiện riêng</strong>
            <small>Cùng độ khó · không truyền được đáp án số · xu không mua retry.</small>
          </span>
        </div>
      </header>

      <div className="weekly-progress">
        {Array.from({ length: totalSteps }, (_, index) => (
          <i
            key={index}
            className={
              index < completedSteps
                ? 'complete'
                : index === completedSteps
                  ? 'current'
                  : ''
            }
          />
        ))}
      </div>

      {exercise ? (
        <article className="weekly-round-card">
          <p className="eyebrow">
            VÒNG TOÁN · {mathIndex + 1}/{exercises.length}
          </p>
          <span className="weekly-topic">
            {getExerciseFamilyById(exercise.familyId).name}
          </span>
          <h2>{exercise.prompt}</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitMath()
            }}
          >
            <label htmlFor="weekly-answer">Đáp án</label>
            <div className="exercise-answer">
              <input
                id="weekly-answer"
                inputMode="numeric"
                autoComplete="off"
                value={answer}
                readOnly={feedback !== 'idle'}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Nhập kết quả"
              />
              <span>{exercise.unit}</span>
            </div>
            <div className={'exercise-response ' + feedback} role="status">
              {feedback === 'wrong' ? (
                <>
                  <RotateCcw size={21} />
                  <p>
                    <strong>Chưa khớp.</strong>
                    <span>
                      Em vẫn được sửa miễn phí, nhưng lượt này không còn điểm
                      first-attempt.
                    </span>
                  </p>
                </>
              ) : feedback === 'correct' ? (
                <>
                  <Check size={21} />
                  <p>
                    <strong>Khớp rồi.</strong>
                    <span>Đi tiếp, điểm số vẫn được giữ bí mật.</span>
                  </p>
                </>
              ) : (
                <p>
                  Weekly Arena không dùng xu để mua lợi thế. Cứ tập trung giải
                  chính xác nhất có thể.
                </p>
              )}
            </div>
            {feedback === 'wrong' ? (
              <button
                type="button"
                className="adventure-button"
                onClick={retryMath}
              >
                <RotateCcw size={18} />
                Sửa lại miễn phí
              </button>
            ) : feedback === 'correct' ? (
              <button
                type="button"
                className="adventure-button"
                onClick={continueMath}
              >
                Vòng tiếp theo
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="adventure-button"
                disabled={!answer.trim()}
              >
                Kiểm tra
                <ArrowRight size={18} />
              </button>
            )}
          </form>
        </article>
      ) : scenario ? (
        <article className="weekly-round-card weekly-scenario-round">
          <p className="eyebrow">
            VÒNG TÌNH HUỐNG · {scenarioIndex + 1}/{scenarios.length}
          </p>
          <h2>{scenario.title}</h2>
          <p className="weekly-scenario-description">{scenario.description}</p>
          <div className="scenario-options">
            {orderedScenarioChoices.map((choice, index) => (
              <button
                key={choice.id}
                type="button"
                className={selectedChoice?.id === choice.id ? 'is-selected' : ''}
                onClick={() => chooseScenario(choice)}
              >
                <span className="choice-index">{index + 1}</span>
                <span>
                  <strong>{choice.label}</strong>
                  <small>Điểm trade-off chỉ reveal sau khi kết thúc.</small>
                </span>
                {selectedChoice?.id === choice.id ? (
                  <Check size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="adventure-button"
            disabled={!selectedChoice}
            onClick={continueScenario}
          >
            Ghi nhận lựa chọn
            <ArrowRight size={18} />
          </button>
        </article>
      ) : null}

      <ArenaLeaderboard rows={leaderboard} loading={leaderboardLoading} />
    </section>
  )
}
