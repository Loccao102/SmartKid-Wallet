import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Coins, Lightbulb, RotateCcw, X } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { AvatarCharacter } from '../../components/avatar/AvatarCharacter'
import { useAvatarProfileStore } from '../../store/avatarProfile'
import { getExerciseFamilyById } from '../../data/exerciseFamilies'
import { exerciseXp, retryCost } from '../../domain/progression'
import { createResearchEvent } from '../../domain/researchEvents'
import type { ExerciseInstance, StallDefinition } from '../../domain/types'
import { playGameSfx } from '../../lib/audioEngine'
import { useLearningProfileStore } from '../../store/learningProfile'
import { useProgressionStore } from '../../store/progression'
import { useResearchLogStore } from '../../store/researchLog'

export function ExerciseDialog({
  stall,
  exercise,
  mode,
  stepNumber,
  stepTotal,
  isFinalUnlock,
  onClose,
  onCorrect,
}: {
  stall: StallDefinition
  exercise: ExerciseInstance
  mode: 'unlock' | 'practice'
  stepNumber: number
  stepTotal: number
  isFinalUnlock: boolean
  onClose: () => void
  onCorrect: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const avatar = useAvatarProfileStore((state) => state.avatar)
  const answerInput = useRef<HTMLInputElement>(null)
  const continueButton = useRef<HTMLButtonElement>(null)
  const attemptStartedAtRef = useRef(
    typeof performance !== 'undefined' ? performance.now() : Date.now(),
  )
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [retryNote, setRetryNote] = useState('')
  const family = getExerciseFamilyById(exercise.familyId)
  const coins = useProgressionStore((state) => state.coins)
  const spendCoins = useProgressionStore((state) => state.spendCoins)
  const awardXpOnce = useProgressionStore((state) => state.awardXpOnce)
  const recordMathAttempt = useLearningProfileStore(
    (state) => state.recordMathAttempt,
  )
  const appendResearchEvent = useResearchLogStore((state) => state.appendEvent)
  const ensureShiftSession = useResearchLogStore(
    (state) => state.ensureShiftSession,
  )
  const currentRetryCost = mode === 'practice' ? 0 : retryCost(wrongAttempts)

  useEffect(() => {
    const element = dialog.current
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    answerInput.current?.focus()
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
      opener?.focus()
    }
  }, [])

  useEffect(() => {
    if (result === 'correct') continueButton.current?.focus()
  }, [result])

  const submit = () => {
    if (!answer.trim() || result !== 'idle') return
    const numericAnswer = Number(answer.replace(/[.,\sđ]/gi, ''))
    const correct = numericAnswer === exercise.answer
    const attemptNumber = wrongAttempts + 1
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const responseTimeMs = Math.max(0, Math.round(now - attemptStartedAtRef.current))
    const mastery = recordMathAttempt(
      family.skills,
      correct,
      attemptNumber,
      responseTimeMs,
    )
    const researchShiftId = 'exercise:' + exercise.id
    appendResearchEvent(
      createResearchEvent({
        sessionId: ensureShiftSession(researchShiftId, 'student-demo-minh-anh'),
        studentKey: 'student-demo-minh-anh',
        shiftId: researchShiftId,
        eventType: 'math_attempt',
        submittedAnswer: numericAnswer,
        expectedAnswer: exercise.answer,
        correct,
        attemptNumber,
        responseTimeMs,
        metadata: {
          source: 'smartmart-exercise',
          familyId: family.id,
          stallId: stall.id,
          mode,
          seed: exercise.seed,
          skills: family.skills.join(','),
          masteryBeforeMean: Number(mastery.beforeMean.toFixed(2)),
          masteryAfterMean: Number(mastery.afterMean.toFixed(2)),
        },
      }),
    )

    if (correct) {
      setResult('correct')
      setRetryNote('')
      playGameSfx('correct')
      return
    }

    setWrongAttempts((count) => count + 1)
    setResult('wrong')
    playGameSfx('retry')
  }

  const retry = () => {
    if (mode === 'practice') {
      setAnswer('')
      setResult('idle')
      setRetryNote('Luyện tập và thử lại đều miễn phí.')
      attemptStartedAtRef.current =
        typeof performance !== 'undefined' ? performance.now() : Date.now()
      requestAnimationFrame(() => answerInput.current?.focus())
      return
    }

    const cost = retryCost(wrongAttempts)
    const paid = spendCoins(cost)

    if (paid) {
      playGameSfx('coin')
      setRetryNote('Đã dùng ' + cost + ' xu để mở lượt thử tiếp theo.')
    } else {
      setRetryNote(
        'Em chưa đủ xu. Hệ thống mở một lượt hỗ trợ miễn phí để việc học không bị khóa.',
      )
    }

    setAnswer('')
    setResult('idle')
    attemptStartedAtRef.current =
      typeof performance !== 'undefined' ? performance.now() : Date.now()
    requestAnimationFrame(() => answerInput.current?.focus())
  }

  const finishCorrect = () => {
    if (mode === 'unlock') {
      const gained = awardXpOnce(
        'unlock-family:' + exercise.familyId,
        exerciseXp(wrongAttempts, mode),
      )
      if (gained?.levelsGained) playGameSfx('level-up')
      else if (gained) playGameSfx('xp')

      if (isFinalUnlock) {
        const stallReward = awardXpOnce('stall:' + stall.id, 30)
        if (stallReward?.levelsGained) playGameSfx('level-up')
        else if (stallReward) playGameSfx('unlock')
      }
    }

    onCorrect()
    if (mode === 'practice' || isFinalUnlock) onClose()
  }

  return (
    <dialog
      ref={dialog}
      className={`exercise-dialog stall-theme-${stall.id}`}
      aria-labelledby="exercise-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <button
        type="button"
        className="dialog-close"
        onClick={onClose}
        aria-label="Đóng bài Toán"
      >
        <X size={22} />
      </button>
      <aside className="exercise-setting" aria-label={`Gian ${stall.name}`}>
        <p className="eyebrow">
          {mode === 'unlock' ? 'CHÌA KHÓA CỦA EM' : 'CÙNG LUYỆN THÊM'}
        </p>
        <h2>{stall.name}</h2>
        <p>
          {mode === 'unlock'
            ? 'Một chút tính toán, một gian hàng mới!'
            : 'Ôn lại kỹ năng, tự tin mua sắm.'}
        </p>
        <img
          className="exercise-booth"
          src={gameAssets.production.stalls[stall.id]}
          alt=""
        />
        <div className="exercise-guide">
          <AvatarCharacter config={avatar} className="exercise-guide-avatar" decorative />
          <p>
            <Lightbulb size={19} aria-hidden="true" />
            Đọc kỹ đề và tính từng bước nhé.
          </p>
        </div>
      </aside>
      <div className="exercise-paper">
        <div className="exercise-progress-row">
          <strong>
            {mode === 'unlock' ? `Bài ${stepNumber}/${stepTotal}` : 'Luyện tập'}
          </strong>
          {mode === 'unlock' ? (
            <ol aria-label="Tiến độ mở gian">
              {Array.from({ length: stepTotal }, (_, index) => (
                <li
                  key={index}
                  className={
                    index < stepNumber - 1
                      ? 'complete'
                      : index === stepNumber - 1
                        ? 'current'
                        : ''
                  }
                  aria-current={index === stepNumber - 1 ? 'step' : undefined}
                  aria-label={`Bài ${index + 1}${index < stepNumber - 1 ? ' đã hoàn thành' : ''}`}
                >
                  {index < stepNumber - 1 ? (
                    <Check size={17} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
        <p className="exercise-topic">{family.name}</p>
        <h3 id="exercise-title">Bài Toán của em</h3>
        <p className="exercise-question">{exercise.prompt}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <label htmlFor="exercise-answer">Đáp án của em</label>
          <div
            className={`exercise-answer ${result === 'wrong' ? 'has-error' : ''}`}
          >
            <input
              id="exercise-answer"
              ref={answerInput}
              inputMode="numeric"
              autoComplete="off"
              value={answer}
              readOnly={result !== 'idle'}
              aria-invalid={result === 'wrong'}
              aria-describedby="exercise-response"
              placeholder="Nhập kết quả"
              onChange={(event) => setAnswer(event.target.value)}
            />
            <span>{exercise.unit}</span>
          </div>
          <div
            id="exercise-response"
            className={`exercise-response ${result}`}
            role="status"
            aria-live="polite"
          >
            {result === 'correct' ? (
              <>
                <Check size={22} aria-hidden="true" />
                <p>
                  <strong>Chính xác! Em làm tốt lắm.</strong>
                  <span>
                    {isFinalUnlock
                      ? 'Em đã hoàn thành đủ bài để mở gian này.'
                      : mode === 'practice'
                        ? 'Kỹ năng mua sắm của em thật vững vàng.'
                        : 'Cùng thử sức với bài tiếp theo nhé.'}
                  </span>
                </p>
              </>
            ) : result === 'wrong' ? (
              <>
                <RotateCcw size={22} aria-hidden="true" />
                <p>
                  <strong>Chưa khớp với dữ kiện rồi.</strong>
                  <span>
                    {wrongAttempts === 1
                      ? 'Kiểm tra lại phép tính và đơn vị trước nhé.'
                      : wrongAttempts === 2
                        ? 'Thử tách bài thành từng bước nhỏ hơn.'
                        : 'Hãy tìm số cần tính trước, rồi mới ghép phép tính cuối cùng.'}
                  </span>
                </p>
              </>
            ) : (
              <p>{retryNote || 'Em có thể thử lại nếu chưa tìm ra đáp án.'}</p>
            )}
          </div>
          {result === 'correct' ? (
            <button
              ref={continueButton}
              type="button"
              className="adventure-button"
              onClick={finishCorrect}
            >
              {mode === 'practice'
                ? 'Quay lại gian hàng'
                : isFinalUnlock
                  ? 'Mở gian hàng'
                  : 'Bài tiếp theo'}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          ) : result === 'wrong' ? (
            <button
              type="button"
              className="adventure-button retry-button"
              onClick={retry}
            >
              <RotateCcw size={19} aria-hidden="true" />
              {mode === 'practice'
                ? 'Thử lại miễn phí'
                : 'Thử lại · ' + currentRetryCost + ' xu'}
              {mode !== 'practice' ? <Coins size={18} aria-hidden="true" /> : null}
            </button>
          ) : (
            <button
              type="submit"
              className="adventure-button"
              disabled={!answer.trim()}
            >
              Kiểm tra đáp án
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          )}
          <div className="exercise-wallet" aria-label={'Ví hiện có ' + coins + ' xu'}>
            <Coins size={17} aria-hidden="true" />
            <span>{coins.toLocaleString('vi-VN')} xu</span>
            {mode === 'practice' ? <small>Luyện tập miễn phí</small> : null}
          </div>
        </form>
      </div>
    </dialog>
  )
}
