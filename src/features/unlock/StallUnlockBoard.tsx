import { useMemo, useState } from 'react'
import { demoAssignment } from '../../data/demoAssignment'
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
        {completed ? '✓ Đã hoàn thành bài được giao' : locked ? '🔒 Chưa đến nhiệm vụ này' : 'Làm bài giáo viên giao →'}
      </span>
    </button>
  )
}

export function StallUnlockBoard() {
  const assignment = demoAssignment
  const completedByAssignment = useProgressionStore((state) => state.completedByAssignment)
  const completeStall = useProgressionStore((state) => state.completeStall)
  const resetAssignment = useProgressionStore((state) => state.resetAssignment)
  const [active, setActive] = useState<StallDefinition | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const assignedStallIds = assignment.stalls.map((item) => item.stallId)
  const assignedStalls = stalls.filter((stall) => assignedStallIds.includes(stall.id))
  const completedStalls = completedByAssignment[assignment.id] ?? []
  const completedCount = completedStalls.filter((stallId) => assignedStallIds.includes(stallId)).length
  const fullShiftUnlocked =
    assignment.fullShiftEnabled &&
    completedCount === assignedStalls.length &&
    assignedStalls.length === 5

  const unlockedIndex = useMemo(
    () => Math.min(completedCount, Math.max(assignedStalls.length - 1, 0)),
    [completedCount, assignedStalls.length],
  )

  const openChallenge = (stall: StallDefinition) => {
    const assignmentItem = assignment.stalls.find((item) => item.stallId === stall.id)

    if (!assignmentItem?.challengeIds.includes(stall.challenge.id)) {
      setFeedback('Bài tập ở gian này chưa được giáo viên giao.')
      return
    }

    setActive(stall)
    setAnswer('')
    setFeedback(null)
  }

  const submitAnswer = () => {
    if (!active) return

    const numericAnswer = Number(answer.replace(/[.,\s]/g, ''))

    if (numericAnswer === active.challenge.answer) {
      completeStall(assignment.id, active.id)
      setFeedback('Chính xác! Em đã hoàn thành nhiệm vụ giáo viên giao ở gian này.')
      return
    }

    setFeedback('Chưa đúng. Hãy kiểm tra lại phép tính nhé.')
  }

  return (
    <section className="unlock-shell">
      <div className="progress-card">
        <div>
          <p className="eyebrow">BÀI TẬP ĐƯỢC GIAO · LỚP {assignment.grade}</p>
          <h2>{assignment.title}</h2>
          <p>
            Giáo viên: <strong>{assignment.teacherName}</strong> · {assignment.target.type === 'class' ? assignment.target.className : assignment.target.studentName}
          </p>
          <p>Hoàn thành các gian hàng trong nhiệm vụ này trước khi nhận ca làm việc.</p>
        </div>

        <div className="progress-number" aria-label={`${completedCount} trên ${assignedStalls.length} gian đã hoàn thành`}>
          <strong>{completedCount}/{assignedStalls.length}</strong>
          <span>gian hoàn thành</span>
        </div>
      </div>

      <div className="stall-grid">
        {assignedStalls.map((stall, index) => {
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
              ? 'Em đã hoàn thành phần bài tập giáo viên giao. Bây giờ có thể bước vào phần mô phỏng chính.'
              : assignment.fullShiftEnabled
                ? 'Hoàn thành đủ 5 gian trong Assignment này để mở ca làm việc.'
                : 'Giáo viên chưa bật Full Shift cho Assignment này.'}
          </p>
        </div>

        <button type="button" disabled={!fullShiftUnlocked}>
          Vào ca làm việc
        </button>
      </div>

      <button className="reset-button" type="button" onClick={() => resetAssignment(assignment.id)}>
        Reset tiến trình Assignment demo
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
            <p className="eyebrow">BÀI GIÁO VIÊN GIAO · GIAN {active.order}</p>
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
              Nộp câu trả lời
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
