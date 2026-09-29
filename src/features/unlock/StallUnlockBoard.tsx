import { useMemo, useState } from 'react'
import { stalls } from '../../data/stalls'
import type { StallDefinition } from '../../domain/types'
import { useProgressionStore } from '../../store/progression'

function StallCard({
  stall,
  locked,
  completed,
  onOpen,
}: {
  stall: StallDefinition
  locked: boolean
  completed: boolean
  onOpen: () => void
}) {
  return (
    <button
      className={`stall-card ${locked ? 'is-locked' : ''} ${completed ? 'is-complete' : ''}`}
      disabled={locked}
      onClick={onOpen}
      type="button"
    >
      <span className="stall-icon" aria-hidden="true">{stall.icon}</span>
      <span className="stall-step">Gian {stall.order}</span>
      <strong>{stall.name}</strong>
      <span>{stall.description}</span>
      <span className="stall-status">
        {completed ? '✓ Đã mở khóa' : locked ? '🔒 Chưa mở' : 'Bắt đầu thử thách →'}
      </span>
    </button>
  )
}

export function StallUnlockBoard() {
  const completedStalls = useProgressionStore((state) => state.completedStalls)
  const completeStall = useProgressionStore((state) => state.completeStall)
  const reset = useProgressionStore((state) => state.reset)
  const [active, setActive] = useState<StallDefinition | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const completedCount = completedStalls.length
  const fullShiftUnlocked = completedCount === stalls.length
  const unlockedIndex = useMemo(
    () => Math.min(completedCount, stalls.length - 1),
    [completedCount],
  )

  const openChallenge = (stall: StallDefinition) => {
    setActive(stall)
    setAnswer('')
    setFeedback(null)
  }

  const submitAnswer = () => {
    if (!active) return

    const numericAnswer = Number(answer.replace(/[.,\s]/g, ''))

    if (numericAnswer === active.challenge.answer) {
      completeStall(active.id)
      setFeedback('Chính xác! Gian hàng đã được mở khóa.')
      return
    }

    setFeedback('Chưa đúng. Hãy kiểm tra lại phép tính nhé.')
  }

  return (
    <section className="unlock-shell">
      <div className="progress-card">
        <div>
          <p className="eyebrow">PHASE 1 · LEARN TO UNLOCK</p>
          <h2>Mở khóa 5 gian hàng</h2>
          <p>Hoàn thành các thử thách Toán nền trước khi nhận ca làm việc đầu tiên.</p>
        </div>

        <div className="progress-number" aria-label={`${completedCount} trên 5 gian đã mở`}>
          <strong>{completedCount}/5</strong>
          <span>gian đã mở</span>
        </div>
      </div>

      <div className="stall-grid">
        {stalls.map((stall, index) => {
          const completed = completedStalls.includes(stall.id)
          const locked = !completed && index > unlockedIndex

          return (
            <StallCard
              key={stall.id}
              stall={stall}
              locked={locked}
              completed={completed}
              onOpen={() => openChallenge(stall)}
            />
          )
        })}
      </div>

      <div className={`shift-gate ${fullShiftUnlocked ? 'is-unlocked' : ''}`}>
        <div>
          <p className="eyebrow">PHASE 2 · FULL SHIFT</p>
          <h3>{fullShiftUnlocked ? '🎉 Ca làm việc đã mở khóa!' : '🔒 Ca làm việc đang khóa'}</h3>
          <p>
            {fullShiftUnlocked
              ? 'Tiếp theo: 5–6 khách hàng, mục tiêu doanh thu, đánh giá nhân viên, danh tiếng siêu thị và các event ngẫu nhiên.'
              : 'Hãy mở đủ 5 gian hàng để bước vào phần mô phỏng chính.'}
          </p>
        </div>

        <button type="button" disabled={!fullShiftUnlocked}>
          Vào ca làm việc
        </button>
      </div>

      <button className="reset-button" type="button" onClick={reset}>
        Reset tiến trình demo
      </button>

      {active ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setActive(null)}
        >
          <div
            className="challenge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="challenge-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              onClick={() => setActive(null)}
              aria-label="Đóng"
            >
              ×
            </button>

            <span className="modal-icon" aria-hidden="true">{active.icon}</span>
            <p className="eyebrow">THỬ THÁCH MỞ KHÓA · GIAN {active.order}</p>
            <h3 id="challenge-title">{active.name}</h3>
            <p className="question">{active.challenge.prompt}</p>

            <label>
              Câu trả lời
              <div className="answer-row">
                <input
                  inputMode="numeric"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Nhập kết quả"
                />
                <span>{active.challenge.unit}</span>
              </div>
            </label>

            <button className="primary-button" type="button" onClick={submitAnswer}>
              Kiểm tra
            </button>

            {feedback ? (
              <p className={feedback.startsWith('Chính xác') ? 'feedback success' : 'feedback'}>
                {feedback}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
