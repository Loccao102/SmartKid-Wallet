import { useMemo, useRef, useState, useEffect, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  GraduationCap,
  KeyRound,
  LogOut,
  RotateCcw,
  School,
  ShieldCheck,
  Star,
  Trophy,
  UsersRound,
} from 'lucide-react'
import {
  createWeeklyMathExercises,
  createWeeklyScenarioRounds,
  scoreWeeklyChallenge,
  type WeeklyChallengeRunScore,
} from '../../domain/weeklyChallenge'
import type { WorkScenarioChoice } from '../../domain/types'
import {
  fetchStudentAssignments,
  parseAssignmentChallenge,
  signInStudent,
  signOutStudent,
  submitClassAssignmentAttempt,
  type AssignmentAttemptRow,
  type WeeklyAssignmentRow,
} from '../../lib/classroomRemote'
import { playGameSfx } from '../../lib/audioEngine'
import { useProgressionStore } from '../../store/progression'
import { useStudentAccountStore } from '../../store/studentAccount'

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ClassAssignmentPlay({
  assignment,
  onBack,
  onSubmitted,
}: {
  assignment: WeeklyAssignmentRow
  onBack: () => void
  onSubmitted: () => void
}) {
  const challenge = useMemo(
    () => parseAssignmentChallenge(assignment),
    [assignment],
  )
  const sharedVariantKey = 'class-shared:' + assignment.assignment_id
  const exercises = useMemo(
    () => createWeeklyMathExercises(challenge, sharedVariantKey),
    [challenge, sharedVariantKey],
  )
  const scenarioRounds = useMemo(
    () => createWeeklyScenarioRounds(challenge, sharedVariantKey),
    [challenge, sharedVariantKey],
  )

  const startedAtRef = useRef(Date.now())
  const [mathIndex, setMathIndex] = useState(0)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] =
    useState<'idle' | 'wrong' | 'correct'>('idle')
  const [attemptCounts, setAttemptCounts] = useState<number[]>(
    Array(exercises.length).fill(0),
  )
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [choiceIds, setChoiceIds] = useState<string[]>([])
  const [selectedChoice, setSelectedChoice] =
    useState<WorkScenarioChoice | null>(null)
  const [result, setResult] = useState<WeeklyChallengeRunScore | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const awardXpOnce = useProgressionStore((state) => state.awardXpOnce)
  const awardCoinsOnce = useProgressionStore((state) => state.awardCoinsOnce)
  const recordActivityResult = useProgressionStore(
    (state) => state.recordActivityResult,
  )

  const inMath = mathIndex < exercises.length
  const inScenario = !inMath && scenarioIndex < scenarioRounds.length
  const exercise = inMath ? exercises[mathIndex] : null
  const scenarioRound = inScenario ? scenarioRounds[scenarioIndex] : null
  const scenario = scenarioRound?.scenario ?? null
  const orderedChoices =
    scenario && scenarioRound
      ? scenarioRound.choiceOrder
          .map((id) => scenario.choices.find((choice) => choice.id === id))
          .filter((choice): choice is WorkScenarioChoice => Boolean(choice))
      : []

  const submitMath = () => {
    if (!exercise || !answer.trim() || feedback !== 'idle') return
    const numericAnswer = Number(answer.replace(/[.,\sđ]/gi, ''))
    const attemptsBefore = attemptCounts[mathIndex] ?? 0
    const correct = numericAnswer === exercise.answer

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

    setSubmitting(true)
    setSubmissionMessage('Đang nộp bài cho giáo viên…')

    try {
      await submitClassAssignmentAttempt({
        assignment,
        score,
        elapsedMs: elapsed,
        firstTryCorrect,
        totalMathAttempts,
        payload: {
          choiceIds: finalChoiceIds,
          attemptCounts,
          sharedVariantKey,
        },
      })

      const rewardKey = 'class-assignment:' + assignment.assignment_id
      awardXpOnce(rewardKey + ':xp', assignment.xp_reward)
      awardCoinsOnce(rewardKey + ':coins', assignment.coin_reward)
      recordActivityResult(rewardKey, score.stars, score.total, elapsed)
      setElapsedMs(elapsed)
      setResult(score)
      setSubmissionMessage('Đã nộp bài. Giáo viên có thể xem kết quả ngay.')
      playGameSfx('mission-complete')
      onSubmitted()
    } catch (error) {
      setSubmissionMessage(
        error instanceof Error
          ? error.message
          : 'Chưa nộp được bài. Hãy thử lại.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const continueScenario = () => {
    if (!scenario || !selectedChoice) return
    const nextChoiceIds = [...choiceIds, selectedChoice.id]
    setChoiceIds(nextChoiceIds)
    setSelectedChoice(null)

    if (scenarioIndex >= scenarioRounds.length - 1) {
      void finishRun(nextChoiceIds)
      return
    }
    setScenarioIndex((value) => value + 1)
  }

  if (result) {
    return (
      <section className="classroom-assignment-play classroom-result">
        <BadgeCheck size={54} />
        <p className="eyebrow">ĐÃ NỘP BÀI CHO GIÁO VIÊN</p>
        <h1>{assignment.title}</h1>
        <div className="classroom-result-stars">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              size={32}
              className={index < result.stars ? 'is-earned' : ''}
              fill={index < result.stars ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        <div className="classroom-result-grid">
          <span>Điểm<strong>{Math.round(result.total)}</strong></span>
          <span>Toán lần đầu<strong>{firstTryCorrect}/{exercises.length}</strong></span>
          <span>Thời gian<strong>{formatDuration(elapsedMs)}</strong></span>
        </div>
        <p>{submissionMessage}</p>
        <button type="button" className="adventure-button" onClick={onBack}>
          Về bài tập lớp <ArrowRight size={18} />
        </button>
      </section>
    )
  }

  if (exercise) {
    return (
      <section className="classroom-assignment-play">
        <div className="classroom-play-toolbar">
          <button type="button" className="quiet-button" onClick={onBack}>
            <ArrowLeft size={18} /> Thoát
          </button>
          <span>Bài Toán {mathIndex + 1}/{exercises.length}</span>
        </div>

        <div className="classroom-question-card">
          <p className="eyebrow">BÀI TẬP CHUNG CỦA LỚP</p>
          <h2>{exercise.prompt}</h2>
          <div className="classroom-answer-row">
            <input
              inputMode="numeric"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Nhập kết quả"
              disabled={feedback !== 'idle'}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitMath()
              }}
            />
            <span>{exercise.unit}</span>
          </div>

          {feedback === 'wrong' ? (
            <div className="classroom-feedback is-wrong">
              <RotateCcw size={19} />
              <div>
                <strong>Chưa đúng.</strong>
                <span>Thử tính lại. Em vẫn làm đúng câu này, đề không đổi.</span>
              </div>
            </div>
          ) : feedback === 'correct' ? (
            <div className="classroom-feedback is-correct">
              <Check size={19} />
              <strong>Chính xác!</strong>
            </div>
          ) : (
            <p className="classroom-question-note">
              Cả lớp nhận cùng dữ kiện ở bài này.
            </p>
          )}

          <div className="classroom-question-actions">
            {feedback === 'wrong' ? (
              <button type="button" className="outline-button" onClick={retryMath}>
                Làm lại câu này
              </button>
            ) : feedback === 'correct' ? (
              <button type="button" className="adventure-button" onClick={continueMath}>
                Câu tiếp theo <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="adventure-button"
                disabled={!answer.trim()}
                onClick={submitMath}
              >
                Kiểm tra <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (scenario) {
    return (
      <section className="classroom-assignment-play">
        <div className="classroom-play-toolbar">
          <button type="button" className="quiet-button" onClick={onBack}>
            <ArrowLeft size={18} /> Thoát
          </button>
          <span>Tình huống {scenarioIndex + 1}/{scenarioRounds.length}</span>
        </div>

        <div className="classroom-scenario-card">
          <p className="eyebrow">{scenario.category}</p>
          <h2>{scenario.title}</h2>
          <p>{scenario.description}</p>

          <div className="classroom-choice-list">
            {orderedChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={selectedChoice?.id === choice.id ? 'is-selected' : ''}
                onClick={() => setSelectedChoice(choice)}
              >
                <strong>{choice.label}</strong>
                <span>{choice.description}</span>
                <ArrowRight size={17} />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="adventure-button"
            disabled={!selectedChoice || submitting}
            onClick={continueScenario}
          >
            {scenarioIndex >= scenarioRounds.length - 1
              ? submitting
                ? 'Đang nộp…'
                : 'Nộp bài'
              : 'Tình huống tiếp'}
            <ArrowRight size={18} />
          </button>
          {submissionMessage ? (
            <p className="classroom-submit-message">{submissionMessage}</p>
          ) : null}
        </div>
      </section>
    )
  }

  return null
}

export function ClassroomScreen() {
  const student = useStudentAccountStore((state) => state.student)
  const classroom = useStudentAccountStore((state) => state.classroom)
  const setAccount = useStudentAccountStore((state) => state.setAccount)
  const clearAccount = useStudentAccountStore((state) => state.clear)
  const loaded = useStudentAccountStore((state) => state.loaded)

  const [classCode, setClassCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [message, setMessage] = useState('')

  const [assignments, setAssignments] = useState<WeeklyAssignmentRow[]>([])
  const [attempts, setAttempts] = useState<AssignmentAttemptRow[]>([])
  const [loading, setLoading] = useState(false)
  const [activeAssignment, setActiveAssignment] =
    useState<WeeklyAssignmentRow | null>(null)

  const loadAssignments = async () => {
    if (!student) return
    setLoading(true)
    try {
      const result = await fetchStudentAssignments()
      if (result.account) setAccount(result.account)
      setAssignments(result.assignments)
      setAttempts(result.attempts)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Không tải được bài lớp.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (student) void loadAssignments()
  }, [student?.auth_user_id])

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setLoginBusy(true)
    setMessage('')
    try {
      const account = await signInStudent({
        classCode,
        username,
        password,
      })
      if (!account) throw new Error('Không tìm thấy tài khoản học sinh.')
      setAccount(account)
      setPassword('')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Không đăng nhập được tài khoản lớp.',
      )
    } finally {
      setLoginBusy(false)
    }
  }

  const logout = async () => {
    await signOutStudent()
    clearAccount()
    setAssignments([])
    setAttempts([])
  }

  if (!loaded) {
    return (
      <section className="classroom-page classroom-loading">
        <School size={36} />
        <strong>Đang kiểm tra tài khoản lớp…</strong>
      </section>
    )
  }

  if (!student) {
    return (
      <section className="classroom-page">
        <div className="classroom-login-layout">
          <div className="classroom-login-intro">
            <span><GraduationCap size={33} /></span>
            <p className="eyebrow">LỚP HỌC CỦA EM</p>
            <h1>Nhận bài trực tiếp từ giáo viên.</h1>
            <p>
              Giáo viên sẽ gửi cho em mã lớp, username và mật khẩu tạm. Sau khi
              đăng nhập, bài tuần và kết quả của em chỉ hiện trong lớp đó.
            </p>
            <div>
              <span><ShieldCheck size={18} /> Tên thật không hiện trên bảng công khai</span>
              <span><UsersRound size={18} /> Bài lớp dùng cùng một đề cho mọi bạn</span>
            </div>
          </div>

          <form className="classroom-login-card" onSubmit={login}>
            <p className="eyebrow">ĐĂNG NHẬP HỌC SINH</p>
            <h2>Vào lớp học</h2>
            <label>
              Mã lớp
              <input
                value={classCode}
                onChange={(event) => setClassCode(event.target.value.toUpperCase())}
                placeholder="ABC1234"
                required
              />
            </label>
            <label>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="minhanh05"
                required
              />
            </label>
            <label>
              Mật khẩu
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {message ? <p className="classroom-login-message">{message}</p> : null}
            <button type="submit" className="adventure-button" disabled={loginBusy}>
              <KeyRound size={18} />
              {loginBusy ? 'Đang đăng nhập…' : 'Vào lớp'}
            </button>
          </form>
        </div>
      </section>
    )
  }

  if (activeAssignment) {
    return (
      <ClassAssignmentPlay
        assignment={activeAssignment}
        onBack={() => setActiveAssignment(null)}
        onSubmitted={() => void loadAssignments()}
      />
    )
  }

  return (
    <section className="classroom-page">
      <header className="classroom-header">
        <div>
          <p className="eyebrow">{classroom?.name?.toUpperCase() ?? 'LỚP HỌC'}</p>
          <h1>Chào {student.display_name}!</h1>
          <p>
            Mã lớp <strong>{classroom?.join_code ?? '—'}</strong> · @{student.username}
          </p>
        </div>
        <button type="button" className="outline-button" onClick={logout}>
          <LogOut size={17} /> Đăng xuất lớp
        </button>
      </header>

      <aside className="classroom-fair-note">
        <ShieldCheck size={23} />
        <div>
          <strong>Bài giáo viên giao dùng cùng một đề</strong>
          <p>
            Khác Weekly Arena công khai, bài lớp không tạo dữ kiện riêng cho từng
            bạn. Điểm xếp hạng vì thế so trực tiếp trên cùng điều kiện.
          </p>
        </div>
      </aside>

      {loading ? (
        <div className="classroom-empty">Đang tải bài tập lớp…</div>
      ) : assignments.length === 0 ? (
        <div className="classroom-empty">
          <CalendarDays size={37} />
          <h2>Chưa có bài tuần nào</h2>
          <p>Khi giáo viên giao bài, nó sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="classroom-assignment-grid">
          {assignments.map((assignment) => {
            const ownAttempts = attempts.filter(
              (attempt) => attempt.assignment_id === assignment.assignment_id,
            )
            const best = ownAttempts.reduce<AssignmentAttemptRow | null>(
              (current, attempt) =>
                !current || Number(attempt.score) > Number(current.score)
                  ? attempt
                  : current,
              null,
            )
            const now = Date.now()
            const opens = new Date(assignment.opens_at).getTime()
            const due = new Date(assignment.due_at).getTime()
            const available =
              assignment.status === 'published' &&
              now >= opens &&
              now <= due &&
              ownAttempts.length < assignment.max_attempts

            return (
              <article key={assignment.assignment_id} className="classroom-assignment-card">
                <header>
                  <span className={'classroom-status is-' + assignment.status}>
                    {assignment.status === 'published'
                      ? now > due
                        ? 'Hết hạn'
                        : 'Đang mở'
                      : assignment.status === 'closed'
                        ? 'Đã đóng'
                        : 'Bản nháp'}
                  </span>
                  <span>{assignment.week_key}</span>
                </header>
                <h2>{assignment.title}</h2>
                <p>{assignment.description || 'Bài tập hàng tuần của lớp.'}</p>
                <div className="classroom-assignment-meta">
                  <span><Trophy size={16} /> {best ? Math.round(Number(best.score)) + ' điểm tốt nhất' : 'Chưa có điểm'}</span>
                  <span><Star size={16} /> {best ? best.stars + '/5 sao' : '—'}</span>
                  <span><Clock3 size={16} /> {ownAttempts.length}/{assignment.max_attempts} lượt</span>
                </div>
                <footer>
                  <small>Hạn {formatDate(assignment.due_at)}</small>
                  <button
                    type="button"
                    className="adventure-button"
                    disabled={!available}
                    onClick={() => setActiveAssignment(assignment)}
                  >
                    {ownAttempts.length
                      ? available
                        ? 'Làm lại để cải thiện'
                        : 'Đã hết lượt / hết hạn'
                      : available
                        ? 'Bắt đầu làm bài'
                        : 'Chưa thể làm'}
                    <ArrowRight size={17} />
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
