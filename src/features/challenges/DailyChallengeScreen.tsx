import { useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Coins,
  RotateCcw,
  Star,
  Trophy,
} from 'lucide-react'
import { demoStudentProfile } from '../../data/studentDemo'
import { getExerciseFamilyById } from '../../data/exerciseFamilies'
import { stalls } from '../../data/stalls'
import { generateExercise } from '../../domain/exerciseEngine'
import { retryCost } from '../../domain/progression'
import { starsFromScore, timeEfficiencyScore } from '../../domain/scoring'
import { playGameSfx } from '../../lib/audioEngine'
import { useProgressionStore } from '../../store/progression'

const CHALLENGE_SIZE = 5
const TARGET_SECONDS = 360
const DAILY_XP = 30
const DAILY_COINS = 20

function localDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

export function DailyChallengeScreen({ onBack }: { onBack: () => void }) {
  const unlockedStalls = useProgressionStore((state) => state.unlockedStalls)
  const coins = useProgressionStore((state) => state.coins)
  const spendCoins = useProgressionStore((state) => state.spendCoins)
  const awardXpOnce = useProgressionStore((state) => state.awardXpOnce)
  const claimChallengeReward = useProgressionStore(
    (state) => state.claimChallengeReward,
  )
  const recordActivityResult = useProgressionStore(
    (state) => state.recordActivityResult,
  )
  const activityResults = useProgressionStore((state) => state.activityResults)

  const dateKey = localDateKey()
  const activityId = 'daily:' + dateKey
  const previousBest = activityResults[activityId]

  const families = useMemo(() => {
    const eligibleStalls = stalls.filter((stall) =>
      unlockedStalls.includes(stall.id),
    )
    if (eligibleStalls.length === 0) return []

    const pool = eligibleStalls.flatMap((stall) => stall.exerciseFamilyIds)
    return Array.from({ length: CHALLENGE_SIZE }, (_, index) =>
      getExerciseFamilyById(pool[index % pool.length]),
    )
  }, [unlockedStalls])

  const exercises = useMemo(
    () =>
      families.map((family, index) =>
        generateExercise(
          family,
          demoStudentProfile.id + ':daily:' + dateKey,
          index + 17,
        ),
      ),
    [dateKey, families],
  )

  const startedAtRef = useRef(Date.now())
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [wrongAttempts, setWrongAttempts] = useState<number[]>(
    Array(CHALLENGE_SIZE).fill(0),
  )
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [finished, setFinished] = useState(false)
  const [finalStars, setFinalStars] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  if (families.length === 0) {
    return (
      <section className="daily-challenge empty">
        <CalendarDays size={42} />
        <h1>Mở một gian trước nhé</h1>
        <p>
          Daily Challenge chỉ lấy kiến thức từ những gian em đã học, nên hãy mở
          ít nhất một gian SmartMart trước.
        </p>
        <button type="button" className="adventure-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Về SmartMart
        </button>
      </section>
    )
  }

  const exercise = exercises[questionIndex]
  const currentWrong = wrongAttempts[questionIndex] ?? 0
  const currentRetry = retryCost(currentWrong)

  const submit = () => {
    if (!answer.trim() || feedback !== 'idle') return

    const numericAnswer = Number(answer.replace(/[.,\sđ]/gi, ''))
    const correct = numericAnswer === exercise.answer

    if (!correct) {
      setWrongAttempts((current) =>
        current.map((value, index) =>
          index === questionIndex ? value + 1 : value,
        ),
      )
      setFeedback('wrong')
      playGameSfx('retry')
      return
    }

    if (currentWrong === 0) setFirstTryCorrect((value) => value + 1)
    setFeedback('correct')
    playGameSfx('correct')
  }

  const retry = () => {
    const paid = spendCoins(retryCost(currentWrong))
    if (paid) playGameSfx('coin')
    setAnswer('')
    setFeedback('idle')
  }

  const resetRun = () => {
    startedAtRef.current = Date.now()
    setQuestionIndex(0)
    setAnswer('')
    setWrongAttempts(Array(CHALLENGE_SIZE).fill(0))
    setFirstTryCorrect(0)
    setFeedback('idle')
    setFinished(false)
    setFinalStars(0)
    setFinalScore(0)
    setElapsedMs(0)
  }

  const continueChallenge = () => {
    if (questionIndex < CHALLENGE_SIZE - 1) {
      setQuestionIndex((value) => value + 1)
      setAnswer('')
      setFeedback('idle')
      return
    }

    const elapsed = Date.now() - startedAtRef.current
    const accuracyPoints = (firstTryCorrect / CHALLENGE_SIZE) * 60
    const timePoints = timeEfficiencyScore(elapsed, TARGET_SECONDS, 30)
    const completionPoints = 10
    const score = Math.round(
      (accuracyPoints + timePoints + completionPoints) * 100,
    ) / 100
    const stars = starsFromScore(score)

    setElapsedMs(elapsed)
    setFinalScore(score)
    setFinalStars(stars)
    setFinished(true)

    const xpResult = awardXpOnce(activityId + ':xp', DAILY_XP)
    if (xpResult?.levelsGained) playGameSfx('level-up')
    else if (xpResult) playGameSfx('xp')

    const claimedCoins = claimChallengeReward(activityId + ':coins', DAILY_COINS)
    if (claimedCoins) playGameSfx('coin')

    recordActivityResult(activityId, stars, score, elapsed)
    playGameSfx('mission-complete')
  }

  if (finished) {
    return (
      <section className="daily-challenge daily-result">
        <Trophy size={52} />
        <p className="eyebrow">DAILY CHALLENGE · {dateKey}</p>
        <h1>{finalStars === 5 ? 'Một lượt 5 sao!' : 'Thử thách hôm nay hoàn thành!'}</h1>
        <div className="run-stars" aria-label={finalStars + ' trên 5 sao'}>
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              size={32}
              className={index < finalStars ? 'is-earned' : ''}
            />
          ))}
        </div>
        <div className="daily-result-grid">
          <span>
            Đúng lần đầu
            <strong>{firstTryCorrect}/{CHALLENGE_SIZE}</strong>
          </span>
          <span>
            Thời gian
            <strong>
              {Math.floor(elapsedMs / 60000)}:
              {String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')}
            </strong>
          </span>
          <span>
            Điểm lượt này
            <strong>{Math.round(finalScore)}</strong>
          </span>
        </div>
        <p>
          Thưởng ngày: +{DAILY_XP} XP và +{DAILY_COINS} xu chỉ nhận một lần.
          Chơi lại vẫn có thể nâng kỷ lục sao.
        </p>
        {previousBest ? (
          <p className="daily-best">
            Kỷ lục trước: {previousBest.bestStars}/5 ★ ·{' '}
            {Math.round(previousBest.bestScore)} điểm
          </p>
        ) : null}
        <div className="work-result-actions">
          <button
            type="button"
            className="outline-button"
            onClick={resetRun}
          >
            Chơi lại challenge
          </button>
          <button type="button" className="adventure-button" onClick={onBack}>
            Tiếp tục hành trình
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="daily-challenge">
      <div className="shop-toolbar">
        <button type="button" className="quiet-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <span className="daily-wallet">
          <Coins size={17} />
          {coins.toLocaleString('vi-VN')} xu
        </span>
      </div>

      <header className="daily-heading">
        <div>
          <p className="eyebrow">THỬ THÁCH HÔM NAY · SEED {dateKey}</p>
          <h1>5 câu từ những gian em đã mở</h1>
          <p>
            Mỗi bạn chơi cùng ngày nhận cùng một bộ seed theo tiến trình đã học.
            Kết quả sao chỉ được bật mí sau câu cuối.
          </p>
        </div>
        <span>{questionIndex + 1}/{CHALLENGE_SIZE}</span>
      </header>

      <div className="daily-progress" aria-hidden="true">
        {Array.from({ length: CHALLENGE_SIZE }, (_, index) => (
          <i
            key={index}
            className={
              index < questionIndex
                ? 'complete'
                : index === questionIndex
                  ? 'current'
                  : ''
            }
          />
        ))}
      </div>

      <article className="daily-question-card">
        <span>{getExerciseFamilyById(exercise.familyId).name}</span>
        <h2>{exercise.prompt}</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <label htmlFor="daily-answer">Đáp án của em</label>
          <div className="exercise-answer">
            <input
              id="daily-answer"
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
                  <strong>Kết quả chưa khớp.</strong>
                  <span>
                    Kiểm tra dữ kiện và từng bước tính. Muốn thử lại, phí lượt
                    này là {currentRetry} xu.
                  </span>
                </p>
              </>
            ) : feedback === 'correct' ? (
              <>
                <Check size={21} />
                <p>
                  <strong>Khớp rồi!</strong>
                  <span>Đi tiếp nhé, số sao vẫn đang được giữ bí mật.</span>
                </p>
              </>
            ) : (
              <p>Không có đồng hồ đếm ngược. Thời gian chỉ là một phần của mastery score.</p>
            )}
          </div>

          {feedback === 'wrong' ? (
            <button
              type="button"
              className="adventure-button"
              onClick={retry}
            >
              <RotateCcw size={18} />
              Thử lại · {currentRetry} xu
            </button>
          ) : feedback === 'correct' ? (
            <button
              type="button"
              className="adventure-button"
              onClick={continueChallenge}
            >
              {questionIndex === CHALLENGE_SIZE - 1
                ? 'Xem kết quả'
                : 'Câu tiếp theo'}
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
    </section>
  )
}
