import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Copy,
  FileSpreadsheet,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Medal,
  Plus,
  RefreshCw,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react'
import { products } from '../data/products'
import {
  bestAttemptsForAssignment,
  rankClassAssignment,
} from '../domain/classroomAnalytics'
import type {
  AssignmentAttemptRow,
  ClassroomRow,
  ResearchEventRow,
  StudentLearningSnapshotRow,
  StudentProfileRow,
  TeacherWorkspace,
  WeeklyAssignmentRow,
  StudentActivitySubmissionRow,
} from '../lib/teacherRemote'
import {
  createClassroom,
  createParentLinkCode,
  createStudentAccount,
  createTeacherReview,
  createTeacherAssignment,
  fetchStudentResearchEvents,
  fetchTeacherWorkspace,
  getTeacherUser,
  resetStudentPassword,
  setAssignmentStatus,
  setStudentActive,
  signInTeacher,
  signOutTeacher,
  signUpTeacher,
} from '../lib/teacherRemote'
import { RosterImportPanel } from './RosterImportPanel'

type TeacherPage =
  | 'overview'
  | 'classes'
  | 'assignments'
  | 'leaderboard'
  | 'students'

const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'classes', label: 'Lớp học', icon: UsersRound },
  { id: 'assignments', label: 'Bài tuần', icon: ClipboardList },
  { id: 'leaderboard', label: 'Xếp hạng', icon: Trophy },
  { id: 'students', label: 'Tiến độ học sinh', icon: BarChart3 },
] satisfies Array<{
  id: TeacherPage
  label: string
  icon: typeof LayoutDashboard
}>

const skillLabels: Record<string, string> = {
  addition: 'Cộng tiền',
  subtraction: 'Tiền thừa',
  multiplication: 'Nhân & số lượng',
  division: 'Chia đều',
  'unit-price': 'Đơn giá',
  budget: 'Ngân sách',
  percentage: 'Khuyến mãi',
  measurement: 'Khối lượng',
  fraction: 'Phân số',
  comparison: 'So sánh lựa chọn',
}

function currentVietnamMonday() {
  const now = new Date()
  const local = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const day = local.getUTCDay()
  const diff = (day + 6) % 7
  local.setUTCDate(local.getUTCDate() - diff)
  return [
    local.getUTCFullYear(),
    String(local.getUTCMonth() + 1).padStart(2, '0'),
    String(local.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

function datePlusDays(dateText: string, days: number) {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

function toIsoAtVietnam(dateText: string, time = '00:00:00') {
  return new Date(dateText + 'T' + time + '+07:00').toISOString()
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatScore(value: number) {
  return Math.round(Number(value) * 10) / 10
}

function createTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = new Uint32Array(10)
  crypto.getRandomValues(bytes)
  return 'Sk!' + Array.from(bytes, (value) => chars[value % chars.length]).join('')
}

function TeacherAuth({ onReady }: { onReady: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'login') {
        await signInTeacher(email, password)
        onReady()
        return
      }

      const result = await signUpTeacher({
        email,
        password,
        displayName,
        schoolName,
      })
      if (result.needsEmailConfirmation) {
        setMessage(
          'Tài khoản đã được tạo. Hãy xác nhận email rồi quay lại đăng nhập.',
        )
        setMode('login')
      } else {
        onReady()
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Không thể đăng nhập.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="teacher-auth">
      <section className="teacher-auth-brand">
        <span className="teacher-brand-mark">
          <GraduationCap size={34} aria-hidden="true" />
        </span>
        <p className="teacher-eyebrow">SMARTKID WALLET · TEACHER</p>
        <h1>Quản lý lớp học mà vẫn giữ trải nghiệm của trẻ thật nhẹ nhàng.</h1>
        <p>
          Tạo lớp, cấp tài khoản, giao bài tuần, xem xếp hạng và theo dõi tiến
          độ từng học sinh trong cùng một nơi.
        </p>
        <div className="teacher-auth-points">
          <span><ShieldCheck size={18} /> Dữ liệu lớp được bảo vệ bằng RLS</span>
          <span><UsersRound size={18} /> Tên thật chỉ hiện trong lớp</span>
          <span><BookOpenCheck size={18} /> Cùng một đề cho bài tuần của lớp</span>
        </div>
      </section>

      <section className="teacher-auth-card">
        <div className="teacher-auth-switch">
          <button
            type="button"
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => setMode('login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => setMode('register')}
          >
            Tạo tài khoản giáo viên
          </button>
        </div>

        <form onSubmit={submit}>
          <div>
            <p className="teacher-eyebrow">
              {mode === 'login' ? 'CHÀO MỪNG QUAY LẠI' : 'BẮT ĐẦU MỘT LỚP MỚI'}
            </p>
            <h2>
              {mode === 'login'
                ? 'Đăng nhập Teacher Console'
                : 'Tạo tài khoản giáo viên'}
            </h2>
          </div>

          {mode === 'register' ? (
            <>
              <label>
                Tên giáo viên
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nguyễn Minh Anh"
                  required
                />
              </label>
              <label>
                Trường / đơn vị
                <input
                  value={schoolName}
                  onChange={(event) => setSchoolName(event.target.value)}
                  placeholder="Trường Tiểu học..."
                />
              </label>
            </>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="giaovien@example.com"
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {message ? <p className="teacher-form-message">{message}</p> : null}

          <button type="submit" className="teacher-primary" disabled={busy}>
            {busy ? 'Đang xử lý…' : mode === 'login' ? 'Vào Teacher Console' : 'Tạo tài khoản'}
            <ChevronRight size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof School
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="teacher-empty">
      <span><Icon size={30} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string
  value: string | number
  note: string
  icon: typeof UsersRound
}) {
  return (
    <article className="teacher-stat-card">
      <span className="teacher-stat-icon"><Icon size={21} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}


function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function ClassStudentOverview({
  workspace,
  selectedClass,
  onOpenStudent,
}: {
  workspace: TeacherWorkspace
  selectedClass?: ClassroomRow
  onOpenStudent: (studentId: string) => void
}) {
  const assignments = useMemo(
    () =>
      selectedClass
        ? workspace.assignments
            .filter(
              (item) => item.classroom_id === selectedClass.classroom_id,
            )
            .sort((a, b) => {
              const draftOrder =
                Number(a.status === 'draft') - Number(b.status === 'draft')
              if (draftOrder) return draftOrder
              return b.week_key.localeCompare(a.week_key)
            })
        : [],
    [selectedClass, workspace.assignments],
  )
  const students = useMemo(
    () =>
      selectedClass
        ? workspace.students
            .filter(
              (item) => item.classroom_id === selectedClass.classroom_id,
            )
            .sort((a, b) => {
              if (a.active !== b.active) return a.active ? -1 : 1
              return a.display_name.localeCompare(b.display_name, 'vi')
            })
        : [],
    [selectedClass, workspace.students],
  )
  const [assignmentId, setAssignmentId] = useState(
    assignments[0]?.assignment_id ?? '',
  )

  useEffect(() => {
    if (!assignments.some((item) => item.assignment_id === assignmentId)) {
      setAssignmentId(assignments[0]?.assignment_id ?? '')
    }
  }, [assignmentId, assignments])

  const assignment = assignments.find(
    (item) => item.assignment_id === assignmentId,
  )
  const bestAttempts = assignment
    ? bestAttemptsForAssignment(assignment.assignment_id, workspace.attempts)
    : new Map<string, AssignmentAttemptRow>()

  const attemptCounts = new Map<string, number>()
  if (assignment) {
    for (const attempt of workspace.attempts) {
      if (attempt.assignment_id !== assignment.assignment_id) continue
      attemptCounts.set(
        attempt.student_id,
        (attemptCounts.get(attempt.student_id) ?? 0) + 1,
      )
    }
  }

  const snapshotByStudent = new Map(
    workspace.snapshots.map((snapshot) => [snapshot.auth_user_id, snapshot]),
  )

  const rows = students.map((student) => {
    const snapshot = snapshotByStudent.get(student.auth_user_id)
    const bestAttempt = bestAttempts.get(student.auth_user_id)
    const skills = masteryEntries(snapshot)
    const masteryAverage = skills.length
      ? average(skills.map((skill) => skill.score))
      : null

    return {
      student,
      snapshot,
      bestAttempt,
      assignmentAttempts: attemptCounts.get(student.auth_user_id) ?? 0,
      masteryAverage,
    }
  })

  const submittedRows = rows.filter((row) => row.bestAttempt)
  const scoreAverage = submittedRows.length
    ? average(
        submittedRows.map((row) => Number(row.bestAttempt?.score ?? 0)),
      )
    : null
  const snapshots = rows
    .map((row) => row.snapshot)
    .filter(
      (snapshot): snapshot is StudentLearningSnapshotRow => Boolean(snapshot),
    )
  const levelAverage = snapshots.length
    ? average(snapshots.map((snapshot) => snapshot.level))
    : null
  const masteryValues = rows
    .map((row) => row.masteryAverage)
    .filter((value): value is number => value !== null)
  const classMasteryAverage = masteryValues.length
    ? average(masteryValues)
    : null

  return (
    <section className="teacher-card teacher-class-roster-card">
      <header className="teacher-card-heading teacher-roster-heading">
        <div>
          <p className="teacher-eyebrow">HỒ SƠ NHANH CẢ LỚP</p>
          <h2>{selectedClass?.name ?? 'Chọn lớp'}</h2>
          <p>
            Điểm assignment, tiến độ chơi và dữ liệu học tập của từng bé trong
            cùng một bảng.
          </p>
        </div>
        <label className="teacher-roster-assignment-picker">
          Assignment
          <select
            value={assignmentId}
            onChange={(event) => setAssignmentId(event.target.value)}
            disabled={!assignments.length}
          >
            {assignments.length ? (
              assignments.map((item) => (
                <option key={item.assignment_id} value={item.assignment_id}>
                  {item.title} · {item.week_key}
                </option>
              ))
            ) : (
              <option value="">Chưa có bài tuần</option>
            )}
          </select>
        </label>
      </header>

      <div className="teacher-roster-kpis">
        <div>
          <span>Sĩ số</span>
          <strong>{students.length}</strong>
        </div>
        <div>
          <span>Đã nộp assignment</span>
          <strong>
            {assignment ? submittedRows.length + '/' + students.length : '—'}
          </strong>
        </div>
        <div>
          <span>Điểm assignment TB</span>
          <strong>
            {scoreAverage === null ? '—' : formatScore(scoreAverage)}
          </strong>
        </div>
        <div>
          <span>Cấp chơi TB</span>
          <strong>
            {levelAverage === null
              ? '—'
              : Math.round(levelAverage * 10) / 10}
          </strong>
        </div>
        <div>
          <span>Mastery TB</span>
          <strong>
            {classMasteryAverage === null
              ? '—'
              : Math.round(classMasteryAverage) + '/100'}
          </strong>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="teacher-roster-empty">
          Chưa có học sinh trong lớp này.
        </div>
      ) : (
        <div className="teacher-table-wrap teacher-roster-table-wrap">
          <table className="teacher-table teacher-roster-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Assignment</th>
                <th>Tiến độ chơi</th>
                <th>Mastery</th>
                <th>Dữ liệu gần nhất</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                ({
                  student,
                  snapshot,
                  bestAttempt,
                  assignmentAttempts,
                  masteryAverage,
                }) => (
                  <tr key={student.auth_user_id}>
                    <td>
                      <div className="teacher-roster-student">
                        <span>
                          {student.display_name.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>{student.display_name}</strong>
                          <small>
                            @{student.username} · {student.student_code}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {bestAttempt ? (
                        <div className="teacher-roster-score">
                          <strong>
                            {formatScore(Number(bestAttempt.score))}
                          </strong>
                          <span>
                            <Star size={14} fill="currentColor" />
                            {bestAttempt.stars}/5 · {assignmentAttempts} lượt
                          </span>
                        </div>
                      ) : (
                        <span className="teacher-roster-muted">
                          {assignment ? 'Chưa nộp' : 'Chưa có bài'}
                        </span>
                      )}
                    </td>
                    <td>
                      {snapshot ? (
                        <div className="teacher-roster-progress">
                          <strong>
                            Cấp {snapshot.level} · {snapshot.total_xp} XP
                          </strong>
                          <span>
                            {snapshot.completed_world_chapters.length} chapter ·{' '}
                            {snapshot.completed_missions.length} nhiệm vụ
                          </span>
                        </div>
                      ) : (
                        <span className="teacher-roster-muted">
                          Chưa đồng bộ tiến độ
                        </span>
                      )}
                    </td>
                    <td>
                      {masteryAverage === null ? (
                        <span className="teacher-roster-muted">Chưa có dữ liệu</span>
                      ) : (
                        <div className="teacher-roster-mastery">
                          <strong>{Math.round(masteryAverage)}/100</strong>
                          <progress value={masteryAverage} max={100} />
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="teacher-roster-sync">
                        {snapshot
                          ? formatDateTime(snapshot.updated_at)
                          : student.last_seen_at
                            ? formatDateTime(student.last_seen_at)
                            : 'Chưa có'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          'teacher-status ' +
                          (student.active ? 'is-published' : 'is-closed')
                        }
                      >
                        {student.active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="teacher-roster-open"
                        onClick={() => onOpenStudent(student.auth_user_id)}
                      >
                        Xem bé <ChevronRight size={15} />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function ClassCreatePanel({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('5')
  const [year, setYear] = useState('2026-2027')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createClassroom({
        name,
        gradeLevel: Number(grade),
        academicYear: year,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được lớp.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="teacher-dialog-backdrop" role="presentation">
      <section className="teacher-dialog" role="dialog" aria-modal="true">
        <header>
          <div>
            <p className="teacher-eyebrow">LỚP HỌC MỚI</p>
            <h2>Tạo lớp</h2>
          </div>
          <button type="button" className="teacher-icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            Tên lớp
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Lớp 5A"
              required
            />
          </label>
          <div className="teacher-form-grid">
            <label>
              Khối
              <select value={grade} onChange={(event) => setGrade(event.target.value)}>
                <option value="4">Khối 4</option>
                <option value="5">Khối 5</option>
              </select>
            </label>
            <label>
              Năm học
              <input value={year} onChange={(event) => setYear(event.target.value)} />
            </label>
          </div>
          {error ? <p className="teacher-form-message">{error}</p> : null}
          <div className="teacher-dialog-actions">
            <button type="button" className="teacher-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="teacher-primary" disabled={busy}>
              <Plus size={18} />
              {busy ? 'Đang tạo…' : 'Tạo lớp'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function StudentCreatePanel({
  classroom,
  onClose,
  onCreated,
}: {
  classroom: ClassroomRow
  onClose: () => void
  onCreated: () => void
}) {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState(createTempPassword)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createStudentAccount({
        classroomId: classroom.classroom_id,
        displayName,
        username,
        password,
      })
      setCreated(true)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được học sinh.')
    } finally {
      setBusy(false)
    }
  }

  const copyCredentials = async () => {
    await navigator.clipboard.writeText(
      [
        'SmartKid Wallet',
        'Mã lớp: ' + classroom.join_code,
        'Username: ' + username.trim().toLowerCase(),
        'Mật khẩu tạm: ' + password,
      ].join('\n'),
    )
  }

  return (
    <div className="teacher-dialog-backdrop">
      <section className="teacher-dialog teacher-dialog-wide">
        <header>
          <div>
            <p className="teacher-eyebrow">{classroom.name.toUpperCase()}</p>
            <h2>Tạo tài khoản học sinh</h2>
          </div>
          <button type="button" className="teacher-icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {created ? (
          <div className="teacher-credential-card">
            <span className="teacher-success-icon"><Check size={25} /></span>
            <div>
              <h3>Tài khoản đã tạo</h3>
              <p>Gửi 3 thông tin này cho học sinh hoặc phụ huynh.</p>
            </div>
            <dl>
              <div><dt>Mã lớp</dt><dd>{classroom.join_code}</dd></div>
              <div><dt>Username</dt><dd>{username.trim().toLowerCase()}</dd></div>
              <div><dt>Mật khẩu tạm</dt><dd>{password}</dd></div>
            </dl>
            <button type="button" className="teacher-secondary" onClick={copyCredentials}>
              <Copy size={17} /> Sao chép thông tin
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              Tên hiển thị trong lớp
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Nguyễn Minh Anh"
                required
              />
            </label>
            <label>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="minhanh05"
                minLength={3}
                required
              />
              <small>Chỉ a-z, 0-9, dấu chấm, gạch dưới hoặc gạch ngang.</small>
            </label>
            <label>
              Mật khẩu tạm
              <div className="teacher-password-row">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <button type="button" className="teacher-secondary" onClick={() => setPassword(createTempPassword())}>
                  Tạo lại
                </button>
              </div>
            </label>
            <div className="teacher-login-preview">
              <KeyRound size={19} />
              <span>
                Học sinh đăng nhập bằng <strong>{classroom.join_code}</strong> + username + mật khẩu.
              </span>
            </div>
            {error ? <p className="teacher-form-message">{error}</p> : null}
            <div className="teacher-dialog-actions">
              <button type="button" className="teacher-secondary" onClick={onClose}>Hủy</button>
              <button type="submit" className="teacher-primary" disabled={busy}>
                <UserPlus size={18} />
                {busy ? 'Đang tạo…' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function AssignmentCreatePanel({
  classroom,
  onClose,
  onCreated,
}: {
  classroom: ClassroomRow
  onClose: () => void
  onCreated: () => void
}) {
  const monday = currentVietnamMonday()
  const [title, setTitle] = useState('Bài tập tuần · SmartMart')
  const [description, setDescription] = useState(
    '6 bài Toán và 2 tình huống. Cả lớp làm cùng một bộ đề.',
  )
  const [weekKey, setWeekKey] = useState(monday)
  const [dueDate, setDueDate] = useState(datePlusDays(monday, 6))
  const [maxAttempts, setMaxAttempts] = useState('3')
  const [publishNow, setPublishNow] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createTeacherAssignment({
        classroomId: classroom.classroom_id,
        title,
        description,
        weekKey,
        opensAt: toIsoAtVietnam(weekKey, '00:00:00'),
        dueAt: toIsoAtVietnam(dueDate, '23:59:00'),
        maxAttempts: Number(maxAttempts),
        status: publishNow ? 'published' : 'draft',
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được bài tuần.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="teacher-dialog-backdrop">
      <section className="teacher-dialog teacher-dialog-wide">
        <header>
          <div>
            <p className="teacher-eyebrow">{classroom.name.toUpperCase()}</p>
            <h2>Tạo bài tập hàng tuần</h2>
          </div>
          <button type="button" className="teacher-icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            Bộ nội dung
            <select value="smartmart-standard" disabled>
              <option value="smartmart-standard">
                SmartMart chuẩn · 6 câu Toán + 2 tình huống
              </option>
            </select>
            <small>
              Bộ câu hỏi và tình huống đã cấu hình; mọi học sinh trong lớp nhận
              cùng một đề.
            </small>
          </label>
          <label>
            Tên bài
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label>
            Mô tả
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          </label>
          <div className="teacher-form-grid">
            <label>
              Tuần bắt đầu
              <input
                type="date"
                value={weekKey}
                onChange={(event) => {
                  setWeekKey(event.target.value)
                  setDueDate(datePlusDays(event.target.value, 6))
                }}
                required
              />
            </label>
            <label>
              Hạn nộp
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </label>
          </div>
          <div className="teacher-form-grid">
            <label>
              Số lượt tối đa
              <input
                type="number"
                min="1"
                max="20"
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(event.target.value)}
              />
            </label>
            <label className="teacher-check-row">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(event) => setPublishNow(event.target.checked)}
              />
              <span>Xuất bản ngay cho học sinh</span>
            </label>
          </div>
          <div className="teacher-assignment-info">
            <ShieldCheck size={20} />
            <span>
              Bài của lớp dùng một challenge cố định. Mọi học sinh nhận cùng family,
              cùng dữ kiện số và cùng thứ tự tình huống.
            </span>
          </div>
          {error ? <p className="teacher-form-message">{error}</p> : null}
          <div className="teacher-dialog-actions">
            <button type="button" className="teacher-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="teacher-primary" disabled={busy}>
              <BookOpenCheck size={18} />
              {busy ? 'Đang tạo…' : publishNow ? 'Tạo & giao bài' : 'Lưu bản nháp'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function OverviewPage({
  workspace,
  selectedClass,
  onSelectClass,
  onOpenClasses,
  onOpenAssignments,
  onOpenStudent,
}: {
  workspace: TeacherWorkspace
  selectedClass?: ClassroomRow
  onSelectClass: (id: string) => void
  onOpenClasses: () => void
  onOpenAssignments: () => void
  onOpenStudent: (studentId: string) => void
}) {
  const activeStudents = workspace.students.filter((student) => student.active)
  const published = workspace.assignments.filter((item) => item.status === 'published')
  const latestAssignment = selectedClass
    ? workspace.assignments.find((item) => item.classroom_id === selectedClass.classroom_id)
    : undefined
  const latestBest = latestAssignment
    ? bestAttemptsForAssignment(latestAssignment.assignment_id, workspace.attempts)
    : new Map<string, AssignmentAttemptRow>()
  const classStudentCount = selectedClass
    ? activeStudents.filter((student) => student.classroom_id === selectedClass.classroom_id).length
    : 0

  return (
    <div className="teacher-page-stack">
      <section className="teacher-page-heading">
        <div>
          <p className="teacher-eyebrow">TỔNG QUAN</p>
          <h1>Nhìn nhanh tình hình lớp học.</h1>
          <p>Thông tin lấy trực tiếp từ tài khoản và lượt làm của học sinh.</p>
        </div>
      </section>

      <div className="teacher-stats-grid">
        <StatCard icon={School} label="Lớp đang quản lý" value={workspace.classrooms.length} note="Có thể tạo nhiều lớp" />
        <StatCard icon={UsersRound} label="Học sinh đang hoạt động" value={activeStudents.length} note="Không tính tài khoản đã khóa" />
        <StatCard icon={ClipboardList} label="Bài đang mở" value={published.length} note="Weekly assignments đã xuất bản" />
        <StatCard icon={BookOpenCheck} label="Lượt nộp bài" value={workspace.attempts.length} note="Tổng trên các bài của lớp" />
      </div>

      {workspace.classrooms.length && selectedClass ? (
        <ClassStudentOverview
          workspace={workspace}
          selectedClass={selectedClass}
          onOpenStudent={onOpenStudent}
        />
      ) : null}

      {workspace.classrooms.length ? (
        <section className="teacher-card">
          <header className="teacher-card-heading">
            <div>
              <p className="teacher-eyebrow">LỚP ĐANG XEM</p>
              <h2>{selectedClass?.name ?? 'Chọn lớp'}</h2>
            </div>
            <select
              value={selectedClass?.classroom_id ?? ''}
              onChange={(event) => onSelectClass(event.target.value)}
            >
              {workspace.classrooms.map((classroom) => (
                <option key={classroom.classroom_id} value={classroom.classroom_id}>
                  {classroom.name} · Khối {classroom.grade_level ?? '-'}
                </option>
              ))}
            </select>
          </header>

          <div className="teacher-class-summary">
            <div><span>Học sinh</span><strong>{classStudentCount}</strong></div>
            <div>
              <span>Bài gần nhất</span>
              <strong>{latestAssignment?.title ?? 'Chưa có'}</strong>
            </div>
            <div>
              <span>Đã nộp bài gần nhất</span>
              <strong>
                {latestAssignment ? latestBest.size + '/' + classStudentCount : '—'}
              </strong>
            </div>
            <div>
              <span>Mã lớp</span>
              <strong>{selectedClass?.join_code ?? '—'}</strong>
            </div>
          </div>

          <div className="teacher-quick-actions">
            <button type="button" className="teacher-secondary" onClick={onOpenClasses}>
              <UsersRound size={18} /> Quản lý học sinh
            </button>
            <button type="button" className="teacher-primary" onClick={onOpenAssignments}>
              <Plus size={18} /> Tạo bài tuần
            </button>
          </div>
        </section>
      ) : (
        <EmptyState
          icon={School}
          title="Chưa có lớp nào"
          description="Tạo lớp đầu tiên để bắt đầu cấp tài khoản và giao bài."
          action={
            <button type="button" className="teacher-primary" onClick={onOpenClasses}>
              <Plus size={18} /> Tạo lớp đầu tiên
            </button>
          }
        />
      )}
    </div>
  )
}

function ClassesPage({
  workspace,
  selectedClass,
  onSelectClass,
  onCreateClass,
  onCreateStudent,
  onImportRoster,
  onRefresh,
}: {
  workspace: TeacherWorkspace
  selectedClass?: ClassroomRow
  onSelectClass: (id: string) => void
  onCreateClass: () => void
  onCreateStudent: () => void
  onImportRoster: () => void
  onRefresh: () => void
}) {
  const students = selectedClass
    ? workspace.students.filter((item) => item.classroom_id === selectedClass.classroom_id)
    : []
  const [actionBusy, setActionBusy] = useState('')
  const [error, setError] = useState('')

  const toggleStudent = async (student: StudentProfileRow) => {
    setActionBusy(student.auth_user_id)
    setError('')
    try {
      await setStudentActive({
        classroomId: student.classroom_id,
        studentId: student.auth_user_id,
        active: !student.active,
      })
      onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được tài khoản.')
    } finally {
      setActionBusy('')
    }
  }

  const resetPassword = async (student: StudentProfileRow) => {
    const password = window.prompt(
      'Nhập mật khẩu mới (ít nhất 8 ký tự) cho ' + student.display_name,
      createTempPassword(),
    )
    if (!password) return
    setActionBusy(student.auth_user_id)
    setError('')
    try {
      await resetStudentPassword({
        classroomId: student.classroom_id,
        studentId: student.auth_user_id,
        password,
      })
      window.alert('Đã đổi mật khẩu cho ' + student.display_name + '.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đổi được mật khẩu.')
    } finally {
      setActionBusy('')
    }
  }

  return (
    <div className="teacher-page-stack">
      <section className="teacher-page-heading">
        <div>
          <p className="teacher-eyebrow">LỚP HỌC</p>
          <h1>Quản lý lớp và tài khoản học sinh.</h1>
          <p>Mỗi học sinh có username riêng, gắn cố định với lớp.</p>
        </div>
        <button type="button" className="teacher-primary" onClick={onCreateClass}>
          <Plus size={18} /> Tạo lớp
        </button>
      </section>

      {workspace.classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="Chưa có lớp"
          description="Tạo lớp trước, sau đó bạn có thể tạo tài khoản học sinh ngay trong lớp đó."
          action={<button type="button" className="teacher-primary" onClick={onCreateClass}><Plus size={18} /> Tạo lớp</button>}
        />
      ) : (
        <>
          <div className="teacher-class-tabs">
            {workspace.classrooms.map((classroom) => (
              <button
                key={classroom.classroom_id}
                type="button"
                className={selectedClass?.classroom_id === classroom.classroom_id ? 'is-active' : ''}
                onClick={() => onSelectClass(classroom.classroom_id)}
              >
                <strong>{classroom.name}</strong>
                <span>{workspace.students.filter((student) => student.classroom_id === classroom.classroom_id).length} học sinh</span>
              </button>
            ))}
          </div>

          {selectedClass ? (
            <section className="teacher-card">
              <header className="teacher-card-heading">
                <div>
                  <p className="teacher-eyebrow">
                    KHỐI {selectedClass.grade_level ?? '-'} · {selectedClass.academic_year}
                  </p>
                  <h2>{selectedClass.name}</h2>
                  <p>
                    Mã lớp: <strong className="teacher-code">{selectedClass.join_code}</strong>
                  </p>
                </div>
                <div className="teacher-card-actions">
                  <button type="button" className="teacher-secondary" onClick={onImportRoster}>
                    <FileSpreadsheet size={18} /> Import Excel
                  </button>
                  <button type="button" className="teacher-primary" onClick={onCreateStudent}>
                    <UserPlus size={18} /> Tạo học sinh
                  </button>
                </div>
              </header>

              {error ? <p className="teacher-form-message">{error}</p> : null}

              {students.length === 0 ? (
                <EmptyState
                  icon={CircleUserRound}
                  title="Lớp chưa có học sinh"
                  description="Tạo tài khoản đầu tiên hoặc import cả danh sách từ file Excel, sau đó gửi mã lớp, username, mật khẩu tạm cho học sinh."
                  action={
                    <div className="teacher-card-actions">
                      <button type="button" className="teacher-secondary" onClick={onImportRoster}>
                        <FileSpreadsheet size={18} /> Import Excel
                      </button>
                      <button type="button" className="teacher-primary" onClick={onCreateStudent}>
                        <UserPlus size={18} /> Tạo tài khoản
                      </button>
                    </div>
                  }
                />
              ) : (
                <div className="teacher-table-wrap">
                  <table className="teacher-table">
                    <thead>
                      <tr>
                        <th>Học sinh</th>
                        <th>Username</th>
                        <th>Mã học sinh</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.auth_user_id}>
                          <td>
                            <div className="teacher-student-cell">
                              <span>{student.display_name.slice(0, 1).toUpperCase()}</span>
                              <strong>{student.display_name}</strong>
                            </div>
                          </td>
                          <td>{student.username}</td>
                          <td><code>{student.student_code}</code></td>
                          <td>
                            <span className={'teacher-status ' + (student.active ? 'is-published' : 'is-closed')}>
                              {student.active ? 'Đang hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td>
                            <div className="teacher-row-actions">
                              <button type="button" onClick={() => resetPassword(student)} disabled={actionBusy === student.auth_user_id}>
                                <KeyRound size={16} /> Đổi mật khẩu
                              </button>
                              <button type="button" onClick={() => toggleStudent(student)} disabled={actionBusy === student.auth_user_id}>
                                <LockKeyhole size={16} />
                                {student.active ? 'Khóa' : 'Mở'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}

function AssignmentsPage({
  workspace,
  selectedClass,
  onSelectClass,
  onCreate,
  onRefresh,
}: {
  workspace: TeacherWorkspace
  selectedClass?: ClassroomRow
  onSelectClass: (id: string) => void
  onCreate: () => void
  onRefresh: () => void
}) {
  const assignments = selectedClass
    ? workspace.assignments.filter((item) => item.classroom_id === selectedClass.classroom_id)
    : []
  const students = selectedClass
    ? workspace.students.filter((item) => item.classroom_id === selectedClass.classroom_id && item.active)
    : []
  const [busy, setBusy] = useState('')

  const changeStatus = async (
    assignment: WeeklyAssignmentRow,
    status: 'draft' | 'published' | 'closed',
  ) => {
    setBusy(assignment.assignment_id)
    try {
      await setAssignmentStatus(assignment.assignment_id, status)
      onRefresh()
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="teacher-page-stack">
      <section className="teacher-page-heading">
        <div>
          <p className="teacher-eyebrow">BÀI TẬP HÀNG TUẦN</p>
          <h1>Giao một đề chung cho cả lớp.</h1>
          <p>Không dùng variant riêng từng học sinh trong chế độ bài tập giáo viên.</p>
        </div>
        {selectedClass ? (
          <button type="button" className="teacher-primary" onClick={onCreate}>
            <Plus size={18} /> Tạo bài tuần
          </button>
        ) : null}
      </section>

      {workspace.classrooms.length ? (
        <div className="teacher-filter-row">
          <label>
            Lớp
            <select value={selectedClass?.classroom_id ?? ''} onChange={(event) => onSelectClass(event.target.value)}>
              {workspace.classrooms.map((classroom) => (
                <option key={classroom.classroom_id} value={classroom.classroom_id}>{classroom.name}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Chưa có bài tuần"
          description="Tạo một Weekly Assignment để cả lớp nhận cùng một bộ đề."
          action={selectedClass ? <button type="button" className="teacher-primary" onClick={onCreate}><Plus size={18} /> Tạo bài tuần</button> : undefined}
        />
      ) : (
        <div className="teacher-assignment-grid">
          {assignments.map((assignment) => {
            const best = bestAttemptsForAssignment(assignment.assignment_id, workspace.attempts)
            const avg = best.size
              ? Array.from(best.values()).reduce((sum, item) => sum + Number(item.score), 0) / best.size
              : 0
            return (
              <article key={assignment.assignment_id} className="teacher-assignment-card">
                <header>
                  <span className={'teacher-status is-' + assignment.status}>
                    {assignment.status === 'published' ? 'Đang mở' : assignment.status === 'closed' ? 'Đã đóng' : 'Bản nháp'}
                  </span>
                  <span>Tuần {assignment.week_key}</span>
                </header>
                <h2>{assignment.title}</h2>
                <p>{assignment.description || 'Không có mô tả.'}</p>
                <div className="teacher-assignment-metrics">
                  <span><strong>{best.size}/{students.length}</strong> đã nộp</span>
                  <span><strong>{best.size ? formatScore(avg) : '—'}</strong> điểm TB</span>
                  <span><strong>{assignment.max_attempts}</strong> lượt tối đa</span>
                </div>
                <footer>
                  <small>Hạn: {formatDateTime(assignment.due_at)}</small>
                  <div>
                    {assignment.status === 'draft' ? (
                      <button type="button" onClick={() => changeStatus(assignment, 'published')} disabled={busy === assignment.assignment_id}>
                        <Check size={16} /> Xuất bản
                      </button>
                    ) : assignment.status === 'published' ? (
                      <button type="button" onClick={() => changeStatus(assignment, 'closed')} disabled={busy === assignment.assignment_id}>
                        <LockKeyhole size={16} /> Đóng bài
                      </button>
                    ) : (
                      <button type="button" onClick={() => changeStatus(assignment, 'published')} disabled={busy === assignment.assignment_id}>
                        <RefreshCw size={16} /> Mở lại
                      </button>
                    )}
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LeaderboardPage({
  workspace,
  selectedClass,
  onSelectClass,
}: {
  workspace: TeacherWorkspace
  selectedClass?: ClassroomRow
  onSelectClass: (id: string) => void
}) {
  const assignments = selectedClass
    ? workspace.assignments.filter((item) => item.classroom_id === selectedClass.classroom_id)
    : []
  const [assignmentId, setAssignmentId] = useState(assignments[0]?.assignment_id ?? '')

  useEffect(() => {
    if (!assignments.some((item) => item.assignment_id === assignmentId)) {
      setAssignmentId(assignments[0]?.assignment_id ?? '')
    }
  }, [assignmentId, assignments])

  const assignment = assignments.find((item) => item.assignment_id === assignmentId)
  const students = selectedClass
    ? workspace.students.filter((item) => item.classroom_id === selectedClass.classroom_id && item.active)
    : []
  const best = assignment
    ? bestAttemptsForAssignment(assignment.assignment_id, workspace.attempts)
    : new Map<string, AssignmentAttemptRow>()

  const rows = assignment
    ? rankClassAssignment(assignment.assignment_id, students, workspace.attempts)
    : []

  return (
    <div className="teacher-page-stack">
      <section className="teacher-page-heading">
        <div>
          <p className="teacher-eyebrow">BẢNG XẾP HẠNG LỚP</p>
          <h1>Xếp hạng theo bài giáo viên giao.</h1>
          <p>Ưu tiên điểm cao hơn; nếu bằng điểm thì xét thời gian tốt hơn.</p>
        </div>
      </section>

      <div className="teacher-filter-row">
        <label>
          Lớp
          <select value={selectedClass?.classroom_id ?? ''} onChange={(event) => onSelectClass(event.target.value)}>
            {workspace.classrooms.map((classroom) => (
              <option key={classroom.classroom_id} value={classroom.classroom_id}>{classroom.name}</option>
            ))}
          </select>
        </label>
        <label>
          Bài tuần
          <select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}>
            {assignments.map((item) => (
              <option key={item.assignment_id} value={item.assignment_id}>{item.title} · {item.week_key}</option>
            ))}
          </select>
        </label>
      </div>

      {!assignment ? (
        <EmptyState icon={Trophy} title="Chưa có bài để xếp hạng" description="Tạo và giao một bài tuần trước." />
      ) : (
        <section className="teacher-card">
          <header className="teacher-card-heading">
            <div>
              <p className="teacher-eyebrow">{selectedClass?.name.toUpperCase()}</p>
              <h2>{assignment.title}</h2>
              <p>{best.size}/{students.length} học sinh đã có kết quả.</p>
            </div>
            <span className="teacher-ranking-badge"><Trophy size={20} /> Top lớp</span>
          </header>

          <div className="teacher-ranking-list">
            {rows.map(({ student, attempt }, index) => (
              <article key={student.auth_user_id} className={!attempt ? 'is-pending' : ''}>
                <span className="teacher-rank-number">
                  {attempt ? index + 1 : '—'}
                </span>
                <span className="teacher-rank-avatar">{student.display_name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{student.display_name}</strong>
                  <span>@{student.username}</span>
                </div>
                {attempt ? (
                  <>
                    <span className="teacher-rank-stars"><Star size={16} fill="currentColor" /> {attempt.stars}/5</span>
                    <strong className="teacher-rank-score">{formatScore(Number(attempt.score))}</strong>
                    <span>{Math.floor(attempt.elapsed_ms / 60000)}:{String(Math.floor((attempt.elapsed_ms % 60000) / 1000)).padStart(2, '0')}</span>
                  </>
                ) : (
                  <span className="teacher-pending-label">Chưa nộp</span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function masteryEntries(snapshot?: StudentLearningSnapshotRow) {
  if (!snapshot || !snapshot.mastery || typeof snapshot.mastery !== 'object' || Array.isArray(snapshot.mastery)) {
    return [] as Array<{ key: string; score: number; attempts: number }>
  }

  return Object.entries(snapshot.mastery as Record<string, unknown>)
    .map(([key, value]) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null
      const record = value as Record<string, unknown>
      return {
        key,
        score: Number(record.score ?? 0),
        attempts: Number(record.attempts ?? 0),
      }
    })
    .filter((item): item is { key: string; score: number; attempts: number } => Boolean(item))
    .sort((a, b) => a.score - b.score)
}


const criteriaLabels: Record<string, string> = {
  accuracy: 'Chính xác',
  time: 'Thời gian',
  resources: 'Tài nguyên',
  decisions: 'Lựa chọn',
  objectives: 'Mục tiêu',
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function submissionTitle(submission: StudentActivitySubmissionRow) {
  if (submission.activity_kind === 'class_assignment') return 'Assignment lớp'
  if (submission.activity_kind === 'shopping_mission') return 'Nhiệm vụ mua sắm'
  return 'Ca làm SmartMart'
}

function SubmissionDetail({
  submission,
}: {
  submission: StudentActivitySubmissionRow
}) {
  const criteria = asRecord(submission.criteria)
  const result = asRecord(submission.result)
  const cart = Array.isArray(submission.cart) ? submission.cart : []
  const productById = new Map(products.map((product) => [product.id, product]))

  return (
    <div className="teacher-submission-detail">
      <div className="teacher-submission-rubric">
        {Object.entries(criteria).map(([key, value]) => (
          <div key={key}>
            <span>{criteriaLabels[key] ?? key}</span>
            <strong>{Math.round(Number(value) * 10) / 10}</strong>
          </div>
        ))}
      </div>

      {cart.length ? (
        <div className="teacher-cart-review">
          <strong>Giỏ hàng đã chọn</strong>
          <div>
            {cart.map((raw, index) => {
              const line = asRecord(raw)
              const product = productById.get(String(line.productId ?? ''))
              const quantity = Number(line.quantity ?? 0)
              return (
                <span key={String(line.productId ?? index)}>
                  {product?.name ?? String(line.productId ?? 'Sản phẩm')}
                  <b>×{quantity}</b>
                </span>
              )
            })}
          </div>
        </div>
      ) : null}

      {Object.keys(result).length ? (
        <div className="teacher-result-facts">
          {Object.entries(result)
            .filter(
              ([key, value]) =>
                ['string', 'number', 'boolean'].includes(typeof value) &&
                !['choiceIds'].includes(key),
            )
            .slice(0, 8)
            .map(([key, value]) => (
              <span key={key}>
                {key}
                <strong>{String(value)}</strong>
              </span>
            ))}
        </div>
      ) : null}
    </div>
  )
}

function StudentsPage({
  workspace,
  selectedClass,
  onSelectClass,
  focusStudentId,
  onRefresh,
}: {
  workspace: TeacherWorkspace
  selectedClass?: ClassroomRow
  onSelectClass: (id: string) => void
  focusStudentId?: string
  onRefresh: () => void
}) {
  const students = selectedClass
    ? workspace.students.filter((item) => item.classroom_id === selectedClass.classroom_id)
    : []
  const [studentId, setStudentId] = useState(students[0]?.auth_user_id ?? '')
  const [events, setEvents] = useState<ResearchEventRow[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewBusy, setReviewBusy] = useState(false)
  const [parentCode, setParentCode] = useState('')

  useEffect(() => {
    if (
      focusStudentId &&
      students.some((item) => item.auth_user_id === focusStudentId)
    ) {
      setStudentId(focusStudentId)
      return
    }

    if (!students.some((item) => item.auth_user_id === studentId)) {
      setStudentId(students[0]?.auth_user_id ?? '')
    }
  }, [focusStudentId, studentId, students])

  useEffect(() => {
    if (!studentId) {
      setEvents([])
      return
    }
    let disposed = false
    setEventsLoading(true)
    fetchStudentResearchEvents(studentId, 400)
      .then((rows) => {
        if (!disposed) setEvents(rows)
      })
      .catch(() => {
        if (!disposed) setEvents([])
      })
      .finally(() => {
        if (!disposed) setEventsLoading(false)
      })
    return () => {
      disposed = true
    }
  }, [studentId])

  const student = students.find((item) => item.auth_user_id === studentId)
  const snapshot = workspace.snapshots.find((item) => item.auth_user_id === studentId)
  const attempts = workspace.attempts.filter((item) => item.student_id === studentId)
  const mathEvents = events.filter((event) => event.event_type === 'math_attempt')
  const correctEvents = mathEvents.filter((event) => event.correct === true)
  const firstTry = correctEvents.filter((event) => event.attempt_number === 1)
  const skills = masteryEntries(snapshot)
  const submissions = workspace.submissions.filter(
    (item) => item.student_id === studentId,
  )
  const reviews = workspace.reviews.filter(
    (item) => item.student_id === studentId,
  )
  const selectedSubmission =
    submissions.find((item) => item.submission_id === selectedSubmissionId) ??
    submissions[0]

  const saveReview = async () => {
    if (!student || !reviewText.trim()) return
    setReviewBusy(true)
    try {
      await createTeacherReview({
        studentId: student.auth_user_id,
        comment: reviewText,
        submissionId: selectedSubmission?.submission_id,
        assignmentId: selectedSubmission?.assignment_id ?? undefined,
      })
      setReviewText('')
      onRefresh()
    } finally {
      setReviewBusy(false)
    }
  }

  const makeParentCode = async () => {
    if (!student) return
    const code = await createParentLinkCode(student.auth_user_id)
    setParentCode(code.link_code)
  }

  return (
    <div className="teacher-page-stack">
      <section className="teacher-page-heading">
        <div>
          <p className="teacher-eyebrow">TIẾN ĐỘ HỌC SINH</p>
          <h1>Xem từng bé đang mạnh và vướng ở đâu.</h1>
          <p>Dữ liệu kết hợp từ bài lớp, progression và research telemetry.</p>
        </div>
      </section>

      <div className="teacher-filter-row">
        <label>
          Lớp
          <select value={selectedClass?.classroom_id ?? ''} onChange={(event) => onSelectClass(event.target.value)}>
            {workspace.classrooms.map((classroom) => (
              <option key={classroom.classroom_id} value={classroom.classroom_id}>{classroom.name}</option>
            ))}
          </select>
        </label>
      </div>

      {students.length === 0 ? (
        <EmptyState icon={CircleUserRound} title="Chưa có học sinh" description="Tạo tài khoản học sinh trong mục Lớp học." />
      ) : (
        <div className="teacher-student-detail-layout">
          <aside className="teacher-student-list">
            {students.map((item) => (
              <button
                key={item.auth_user_id}
                type="button"
                className={studentId === item.auth_user_id ? 'is-active' : ''}
                onClick={() => setStudentId(item.auth_user_id)}
              >
                <span>{item.display_name.slice(0, 1).toUpperCase()}</span>
                <div><strong>{item.display_name}</strong><small>@{item.username}</small></div>
                <ChevronRight size={17} />
              </button>
            ))}
          </aside>

          {student ? (
            <section className="teacher-student-detail">
              <header>
                <span className="teacher-student-big-avatar">{student.display_name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <p className="teacher-eyebrow">{selectedClass?.name.toUpperCase()}</p>
                  <h2>{student.display_name}</h2>
                  <span>@{student.username} · {student.student_code}</span>
                </div>
                <span className={'teacher-status ' + (student.active ? 'is-published' : 'is-closed')}>
                  {student.active ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </header>

              <div className="teacher-student-metrics">
                <div><span>Cấp</span><strong>{snapshot?.level ?? '—'}</strong></div>
                <div><span>Tổng XP</span><strong>{snapshot?.total_xp ?? '—'}</strong></div>
                <div><span>Bài lớp đã làm</span><strong>{new Set(attempts.map((item) => item.assignment_id)).size}</strong></div>
                <div>
                  <span>Đúng Toán</span>
                  <strong>{mathEvents.length ? Math.round((correctEvents.length / mathEvents.length) * 100) + '%' : '—'}</strong>
                </div>
                <div>
                  <span>Đúng lần đầu</span>
                  <strong>{correctEvents.length ? Math.round((firstTry.length / correctEvents.length) * 100) + '%' : '—'}</strong>
                </div>
                <div><span>Chapter đã xong</span><strong>{snapshot?.completed_world_chapters.length ?? 0}</strong></div>
              </div>

              <section className="teacher-subsection">
                <header><h3>Năng lực Toán</h3><span>Mastery thấp hiển thị trước</span></header>
                {skills.length ? (
                  <div className="teacher-mastery-grid">
                    {skills.slice(0, 10).map((skill) => (
                      <article key={skill.key}>
                        <span>{skillLabels[skill.key] ?? skill.key}</span>
                        <strong>{Math.round(skill.score)}/100</strong>
                        <progress value={skill.score} max={100} />
                        <small>{skill.attempts} lượt ghi nhận</small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="teacher-muted">Chưa có snapshot mastery từ tài khoản học sinh.</p>
                )}
              </section>

              <section className="teacher-subsection">
                <header><h3>Lịch sử bài lớp</h3><span>{attempts.length} lượt làm</span></header>
                {attempts.length ? (
                  <div className="teacher-mini-table">
                    {attempts.slice(0, 8).map((attempt) => {
                      const assignment = workspace.assignments.find((item) => item.assignment_id === attempt.assignment_id)
                      return (
                        <div key={attempt.attempt_id}>
                          <div><strong>{assignment?.title ?? 'Bài tuần'}</strong><span>{formatDateTime(attempt.completed_at)}</span></div>
                          <span><Star size={15} fill="currentColor" /> {attempt.stars}/5</span>
                          <strong>{formatScore(Number(attempt.score))}</strong>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="teacher-muted">Học sinh chưa nộp bài lớp nào.</p>
                )}
              </section>

              <section className="teacher-subsection">
                <header>
                  <h3>Lượt làm chi tiết</h3>
                  <span>{submissions.length} lượt đã đồng bộ</span>
                </header>
                {submissions.length ? (
                  <>
                    <div className="teacher-submission-list">
                      {submissions.slice(0, 10).map((submission) => (
                        <button
                          key={submission.submission_id}
                          type="button"
                          className={
                            selectedSubmission?.submission_id ===
                            submission.submission_id
                              ? 'is-active'
                              : ''
                          }
                          onClick={() =>
                            setSelectedSubmissionId(submission.submission_id)
                          }
                        >
                          <span>
                            <strong>{submissionTitle(submission)}</strong>
                            <small>
                              Lượt {submission.attempt_number} ·{' '}
                              {formatDateTime(submission.created_at)}
                            </small>
                          </span>
                          <b>{formatScore(Number(submission.score))}</b>
                          <em>{submission.stars}/5 ★</em>
                        </button>
                      ))}
                    </div>
                    {selectedSubmission ? (
                      <SubmissionDetail submission={selectedSubmission} />
                    ) : null}
                  </>
                ) : (
                  <p className="teacher-muted">
                    Chưa có lượt chơi chi tiết được đồng bộ từ tài khoản lớp.
                  </p>
                )}
              </section>

              <section className="teacher-subsection">
                <header>
                  <h3>Nhận xét giáo viên</h3>
                  <span>{reviews.length} nhận xét</span>
                </header>
                <div className="teacher-review-compose">
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    placeholder="Ví dụ: Con tính tiền khá chắc, nhưng cần cân nhắc ngân sách dự phòng tốt hơn..."
                  />
                  <button
                    type="button"
                    className="teacher-primary"
                    disabled={reviewBusy || !reviewText.trim()}
                    onClick={() => void saveReview()}
                  >
                    {reviewBusy ? 'Đang lưu…' : 'Ghi nhận xét'}
                  </button>
                </div>
                {reviews.length ? (
                  <div className="teacher-review-list">
                    {reviews.slice(0, 6).map((review) => (
                      <article key={review.review_id}>
                        <p>{review.comment}</p>
                        <span>{formatDateTime(review.created_at)}</span>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="teacher-subsection">
                <header>
                  <h3>Liên kết phụ huynh</h3>
                  <span>Mỗi tài khoản phụ huynh liên kết một học sinh</span>
                </header>
                <div className="teacher-parent-link">
                  <div>
                    <strong>{parentCode || 'Chưa tạo mã liên kết mới'}</strong>
                    <span>
                      Mã dùng một lần, hết hạn sau 7 ngày.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="teacher-secondary"
                    onClick={() => void makeParentCode()}
                  >
                    <KeyRound size={16} />
                    Tạo mã phụ huynh
                  </button>
                  {parentCode ? (
                    <button
                      type="button"
                      className="teacher-secondary"
                      onClick={() => void navigator.clipboard.writeText(parentCode)}
                    >
                      <Copy size={16} /> Sao chép
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="teacher-subsection">
                <header><h3>Telemetry gần đây</h3><span>{eventsLoading ? 'Đang tải…' : events.length + ' sự kiện'}</span></header>
                <div className="teacher-telemetry-summary">
                  <span><strong>{mathEvents.length}</strong> lần trả lời Toán</span>
                  <span><strong>{events.filter((event) => event.event_type === 'scenario_choice').length}</strong> quyết định tình huống</span>
                  <span><strong>{events.filter((event) => event.event_type === 'shift_completed').length}</strong> ca đã hoàn thành</span>
                </div>
              </section>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function TeacherApp() {
  const [page, setPage] = useState<TeacherPage>('overview')
  const [status, setStatus] = useState<'loading' | 'guest' | 'ready'>('loading')
  const [workspace, setWorkspace] = useState<TeacherWorkspace | null>(null)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [focusedStudentId, setFocusedStudentId] = useState('')
  const [createClassOpen, setCreateClassOpen] = useState(false)
  const [createStudentOpen, setCreateStudentOpen] = useState(false)
  const [importRosterOpen, setImportRosterOpen] = useState(false)
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false)
  const [loadError, setLoadError] = useState('')

  const load = async () => {
    setLoadError('')
    try {
      const user = await getTeacherUser()
      if (!user) {
        setWorkspace(null)
        setStatus('guest')
        return
      }
      const next = await fetchTeacherWorkspace()
      setWorkspace(next)
      setSelectedClassId((current) =>
        next.classrooms.some((item) => item.classroom_id === current)
          ? current
          : next.classrooms[0]?.classroom_id ?? '',
      )
      setStatus('ready')
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được Teacher Console.')
      setStatus('guest')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const selectedClass = workspace?.classrooms.find(
    (item) => item.classroom_id === selectedClassId,
  )

  const logout = async () => {
    await signOutTeacher()
    setWorkspace(null)
    setStatus('guest')
  }

  if (status === 'loading') {
    return (
      <main className="teacher-loading">
        <span className="teacher-brand-mark"><GraduationCap size={31} /></span>
        <strong>Đang mở Teacher Console…</strong>
      </main>
    )
  }

  if (status === 'guest' || !workspace) {
    return (
      <>
        <TeacherAuth onReady={() => void load()} />
        {loadError ? <p className="teacher-global-error">{loadError}</p> : null}
      </>
    )
  }

  return (
    <div className="teacher-shell">
      <aside className="teacher-sidebar">
        <a className="teacher-brand" href="/teacher">
          <span className="teacher-brand-mark"><GraduationCap size={28} /></span>
          <span><strong>SmartKid</strong><small>Teacher Console</small></span>
        </a>

        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={page === id ? 'is-active' : ''}
              onClick={() => setPage(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="teacher-sidebar-profile">
          <span>{workspace.teacher.display_name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{workspace.teacher.display_name}</strong>
            <small>{workspace.teacher.school_name || 'Giáo viên'}</small>
          </div>
          <button type="button" onClick={logout} aria-label="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="teacher-main">
        <header className="teacher-mobile-header">
          <a className="teacher-brand" href="/teacher">
            <span className="teacher-brand-mark"><GraduationCap size={24} /></span>
            <strong>Teacher</strong>
          </a>
          <div>
            <button
              type="button"
              className="teacher-icon-button"
              onClick={() => void load()}
              aria-label="Tải lại dữ liệu"
            >
              <RefreshCw size={19} />
            </button>
            <button
              type="button"
              className="teacher-icon-button"
              onClick={logout}
              aria-label="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <nav className="teacher-mobile-nav" aria-label="Điều hướng giáo viên">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={page === id ? 'is-active' : ''}
              onClick={() => setPage(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {page === 'overview' ? (
          <OverviewPage
            workspace={workspace}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClassId}
            onOpenClasses={() => {
              setPage('classes')
              if (!workspace.classrooms.length) setCreateClassOpen(true)
            }}
            onOpenAssignments={() => {
              setPage('assignments')
              setCreateAssignmentOpen(true)
            }}
            onOpenStudent={(studentId) => {
              setFocusedStudentId(studentId)
              setPage('students')
            }}
          />
        ) : page === 'classes' ? (
          <ClassesPage
            workspace={workspace}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClassId}
            onCreateClass={() => setCreateClassOpen(true)}
            onCreateStudent={() => setCreateStudentOpen(true)}
            onImportRoster={() => setImportRosterOpen(true)}
            onRefresh={() => void load()}
          />
        ) : page === 'assignments' ? (
          <AssignmentsPage
            workspace={workspace}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClassId}
            onCreate={() => setCreateAssignmentOpen(true)}
            onRefresh={() => void load()}
          />
        ) : page === 'leaderboard' ? (
          <LeaderboardPage
            workspace={workspace}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClassId}
          />
        ) : (
          <StudentsPage
            workspace={workspace}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClassId}
            focusStudentId={focusedStudentId}
            onRefresh={() => void load()}
          />
        )}
      </main>

      {createClassOpen ? (
        <ClassCreatePanel
          onClose={() => setCreateClassOpen(false)}
          onCreated={() => {
            setCreateClassOpen(false)
            void load()
          }}
        />
      ) : null}

      {createStudentOpen && selectedClass ? (
        <StudentCreatePanel
          classroom={selectedClass}
          onClose={() => setCreateStudentOpen(false)}
          onCreated={() => void load()}
        />
      ) : null}

      {importRosterOpen && selectedClass ? (
        <RosterImportPanel
          classroom={selectedClass}
          onClose={() => setImportRosterOpen(false)}
          onFinished={() => void load()}
        />
      ) : null}

      {createAssignmentOpen && selectedClass ? (
        <AssignmentCreatePanel
          classroom={selectedClass}
          onClose={() => setCreateAssignmentOpen(false)}
          onCreated={() => {
            setCreateAssignmentOpen(false)
            void load()
          }}
        />
      ) : null}
    </div>
  )
}
