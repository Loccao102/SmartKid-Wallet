import { useMemo, useState } from 'react'
import { demoAssignment } from '../../data/demoAssignment'
import { stalls } from '../../data/stalls'
import type { StallDefinition } from '../../domain/types'
import { useProgressionStore } from '../../store/progression'

const skillLabels: Record<string, string> = {
  addition: 'Cộng',
  subtraction: 'Trừ',
  multiplication: 'Nhân',
  division: 'Chia',
  'unit-price': 'Đơn giá',
  budget: 'Ngân sách',
  percentage: 'Phần trăm',
}

function formatDueDate(date?: string) {
  if (!date) return 'Không giới hạn'
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function StallCard({
  stall,
  locked,
  completed,
  available,
  onOpen,
}: {
  stall: StallDefinition
  locked: boolean
  completed: boolean
  available: boolean
  onOpen: () => void
}) {
  const stateLabel = completed
    ? 'Đã hoàn thành'
    : available
      ? 'Nhiệm vụ đang mở'
      : 'Chưa mở khóa'

  return (
    <button
      className={`market-stall stall-${stall.id} ${locked ? 'is-locked' : ''} ${completed ? 'is-complete' : ''} ${available ? 'is-available' : ''}`}
      disabled={locked}
      onClick={onOpen}
      type="button"
    >
      <span className="stall-order">0{stall.order}</span>
      <span className="stall-awning" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>

      <span className="stall-body">
        <span className="stall-illustration" aria-hidden="true">{stall.icon}</span>
        <span className="stall-name">{stall.name}</span>
        <span className="stall-skills">
          {stall.skills.slice(0, 2).map((skill) => (
            <span key={skill}>{skillLabels[skill] ?? skill}</span>
          ))}
        </span>
      </span>

      <span className="stall-footer">
        <span className="stall-state-dot" aria-hidden="true" />
        {stateLabel}
      </span>

      {locked ? <span className="stall-lock" aria-hidden="true">🔒</span> : null}
      {completed ? <span className="stall-check" aria-hidden="true">✓</span> : null}
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
  const progressPercent = Math.round((completedCount / Math.max(assignedStalls.length, 1)) * 100)

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
      setFeedback('Chính xác! Em đã mở khóa gian hàng này.')
      return
    }

    setFeedback('Chưa đúng. Hãy thử tính lại từng bước nhé.')
  }

  return (
    <section className="assignment-screen">
      <article className="assignment-banner">
        <div className="teacher-badge">
          <span className="teacher-avatar">M</span>
          <span>
            <small>Giáo viên giao</small>
            <strong>{assignment.teacherName}</strong>
          </span>
        </div>

        <div className="assignment-banner-copy">
          <div className="assignment-meta-row">
            <span className="assignment-type">Nhiệm vụ tuần này</span>
            <span>•</span>
            <span>Lớp {assignment.grade}</span>
          </div>
          <h2>{assignment.title}</h2>
          <p>Mở khóa đủ 5 gian bằng các bài Toán cô đã giao. Sau đó em sẽ được nhận ca làm việc đầu tiên tại SmartMart.</p>
        </div>

        <div className="assignment-deadline">
          <small>Hạn hoàn thành</small>
          <strong>{formatDueDate(assignment.dueAt)}</strong>
        </div>
      </article>

      <div className="mission-layout">
        <div className="mission-main">
          <div className="section-heading">
            <div>
              <p className="page-kicker">BẢN ĐỒ NHIỆM VỤ</p>
              <h3>Siêu thị SmartMart</h3>
              <p>Đi lần lượt qua từng gian. Gian tiếp theo sẽ mở khi em hoàn thành nhiệm vụ hiện tại.</p>
            </div>

            <div className="progress-chip">
              <span className="progress-chip-value">{completedCount}/5</span>
              <span>gian đã mở</span>
            </div>
          </div>

          <div className="supermarket-map">
            <div className="market-sign">
              <span className="market-sign-icon">S</span>
              <div>
                <strong>SMARTMART</strong>
                <small>HỌC TOÁN QUA MỖI GIAN HÀNG</small>
              </div>
            </div>

            <div className="map-decor decor-cart" aria-hidden="true">🛒</div>
            <div className="map-decor decor-basket" aria-hidden="true">🧺</div>
            <div className="map-decor decor-plant" aria-hidden="true">🌿</div>

            <div className="market-floor" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <div className="stalls-map-grid">
              {assignedStalls.map((stall, index) => {
                const completed = completedStalls.includes(stall.id)
                const available = !completed && index === unlockedIndex
                const locked = !completed && index > unlockedIndex

                return (
                  <StallCard
                    key={stall.id}
                    stall={stall}
                    locked={locked}
                    completed={completed}
                    available={available}
                    onOpen={() => openChallenge(stall)}
                  />
                )
              })}

              <div className={`full-shift-counter ${fullShiftUnlocked ? 'is-unlocked' : ''}`}>
                <span className="counter-icon" aria-hidden="true">{fullShiftUnlocked ? '🎟️' : '🔐'}</span>
                <div>
                  <small>ĐÍCH ĐẾN</small>
                  <strong>Ca làm việc</strong>
                  <span>
                    {fullShiftUnlocked
                      ? 'Sẵn sàng nhận khách!'
                      : 'Mở đủ 5 gian để nhận ca'}
                  </span>
                </div>
                <button type="button" disabled={!fullShiftUnlocked}>
                  {fullShiftUnlocked ? 'Bắt đầu ca →' : 'Đang khóa'}
                </button>
              </div>
            </div>

            <div className="market-route" aria-hidden="true">
              <span className="route-dot route-1">1</span>
              <span className="route-dot route-2">2</span>
              <span className="route-dot route-3">3</span>
              <span className="route-dot route-4">4</span>
              <span className="route-dot route-5">5</span>
            </div>
          </div>
        </div>

        <aside className="mission-side">
          <div className="progress-panel">
            <div className="progress-panel-heading">
              <div>
                <p className="page-kicker">TIẾN ĐỘ</p>
                <h3>{progressPercent}%</h3>
              </div>
              <span className="progress-medal" aria-hidden="true">🏅</span>
            </div>

            <div className="progress-track" aria-label={`Tiến độ ${progressPercent}%`}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="progress-details">
              <div>
                <strong>{completedCount}</strong>
                <span>Đã xong</span>
              </div>
              <div>
                <strong>{5 - completedCount}</strong>
                <span>Còn lại</span>
              </div>
              <div>
                <strong>5</strong>
                <span>Tổng gian</span>
              </div>
            </div>
          </div>

          <div className="teacher-note">
            <div className="note-heading">
              <span aria-hidden="true">💬</span>
              <strong>Lời nhắn từ cô Mai</strong>
            </div>
            <p>“Không cần làm thật nhanh. Cô muốn em đọc kỹ yêu cầu và hiểu vì sao mình chọn đáp án đó.”</p>
          </div>

          <div className="mission-reward">
            <div className="reward-icon" aria-hidden="true">✨</div>
            <div>
              <small>PHẦN THƯỞNG</small>
              <strong>Huy hiệu Nhân viên tập sự</strong>
              <p>Nhận khi mở đủ 5 gian và hoàn thành ca đầu tiên.</p>
            </div>
          </div>

          <button
            className="demo-reset"
            type="button"
            onClick={() => resetAssignment(assignment.id)}
          >
            ↻ Reset tiến trình demo
          </button>
        </aside>
      </div>

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

            <div className="challenge-topline">
              <div className="challenge-icon" aria-hidden="true">{active.icon}</div>
              <div>
                <p className="page-kicker">GIAN {active.order} · BÀI CÔ MAI GIAO</p>
                <h3 id="challenge-title">{active.name}</h3>
              </div>
            </div>

            <div className="challenge-skill-row">
              {active.skills.map((skill) => (
                <span key={skill}>{skillLabels[skill] ?? skill}</span>
              ))}
            </div>

            <div className="question-card">
              <small>THỬ THÁCH MỞ KHÓA</small>
              <p>{active.challenge.prompt}</p>
            </div>

            <label className="answer-label">
              <span>Đáp án của em</span>
              <div className="answer-row">
                <input
                  autoFocus
                  inputMode="numeric"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') submitAnswer()
                  }}
                  placeholder="Nhập kết quả"
                />
                <span>{active.challenge.unit}</span>
              </div>
            </label>

            <button className="primary-button" type="button" onClick={submitAnswer}>
              Kiểm tra đáp án
            </button>

            {feedback ? (
              <div className={feedback.startsWith('Chính xác') ? 'feedback success' : 'feedback'}>
                <span aria-hidden="true">{feedback.startsWith('Chính xác') ? '✓' : '↻'}</span>
                <p>{feedback}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
