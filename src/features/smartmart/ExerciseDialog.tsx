import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Lightbulb, RotateCcw, X } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { getExerciseFamilyById } from '../../data/exerciseFamilies'
import type { ExerciseInstance, StallDefinition } from '../../domain/types'

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
  const answerInput = useRef<HTMLInputElement>(null)
  const continueButton = useRef<HTMLButtonElement>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const family = getExerciseFamilyById(exercise.familyId)

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
    if (!answer.trim() || result === 'correct') return
    const numericAnswer = Number(answer.replace(/[.,\sđ]/gi, ''))
    setResult(numericAnswer === exercise.answer ? 'correct' : 'wrong')
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
          <img src={gameAssets.production.student} alt="" />
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
              readOnly={result === 'correct'}
              aria-invalid={result === 'wrong'}
              aria-describedby="exercise-response"
              placeholder="Nhập kết quả"
              onChange={(event) => {
                setAnswer(event.target.value)
                setResult('idle')
              }}
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
                  <strong>Thử lại một chút nhé.</strong>
                  <span>Đọc lại dữ kiện và tính từng bước.</span>
                </p>
              </>
            ) : (
              <p>Em có thể thử lại nếu chưa tìm ra đáp án.</p>
            )}
          </div>
          {result === 'correct' ? (
            <button
              ref={continueButton}
              type="button"
              className="adventure-button"
              onClick={() => {
                onCorrect()
                if (mode === 'practice' || isFinalUnlock) onClose()
              }}
            >
              {mode === 'practice'
                ? 'Quay lại gian hàng'
                : isFinalUnlock
                  ? 'Mở gian hàng'
                  : 'Bài tiếp theo'}
              <ArrowRight size={20} aria-hidden="true" />
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
        </form>
      </div>
    </dialog>
  )
}
