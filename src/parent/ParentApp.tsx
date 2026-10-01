import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Coins,
  GraduationCap,
  KeyRound,
  LogOut,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  UserRoundCheck,
  Wallet,
} from 'lucide-react'
import type {
  ParentWorkspace,
  StudentActivitySubmissionRow,
} from '../lib/parentRemote'
import {
  fetchParentWorkspace,
  getParentUser,
  redeemParentLink,
  signInParent,
  signOutParent,
  signUpParent,
} from '../lib/parentRemote'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatScore(value: number) {
  return Math.round(Number(value) * 10) / 10
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function averageMastery(workspace: ParentWorkspace) {
  const mastery = workspace.snapshot?.mastery
  if (!mastery || typeof mastery !== 'object' || Array.isArray(mastery)) {
    return null
  }

  const values = Object.values(mastery as Record<string, unknown>)
    .map((entry) => {
      const record = asRecord(entry)
      return Number(record.score ?? NaN)
    })
    .filter(Number.isFinite)

  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function activityLabel(activity: StudentActivitySubmissionRow) {
  if (activity.activity_kind === 'class_assignment') return 'Bài tập lớp'
  if (activity.activity_kind === 'shopping_mission') return 'Nhiệm vụ mua sắm'
  return 'Ca làm SmartMart'
}

function ParentAuth({ onReady }: { onReady: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'login') {
        await signInParent(email, password)
        onReady()
        return
      }

      const result = await signUpParent({
        email,
        password,
        displayName,
      })
      if (result.needsEmailConfirmation) {
        setMode('login')
        setMessage(
          'Tài khoản đã tạo. Hãy xác nhận email rồi quay lại đăng nhập.',
        )
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
    <main className="parent-auth">
      <section className="parent-auth-intro">
        <span className="parent-brand-mark">
          <Wallet size={34} />
        </span>
        <p className="parent-eyebrow">SMARTKID WALLET · PHỤ HUYNH</p>
        <h1>Theo dõi tiến bộ của con mà không biến việc học thành áp lực.</h1>
        <p>
          Xem kết quả, nhận xét giáo viên, xu và tiến trình chơi của đúng học
          sinh đã được liên kết.
        </p>
        <div>
          <span><ShieldCheck size={18} /> Chỉ xem học sinh đã liên kết</span>
          <span><MessageSquareText size={18} /> Nhận xét trực tiếp từ giáo viên</span>
          <span><TrendingUp size={18} /> Theo dõi tiến bộ qua nhiều lượt chơi</span>
        </div>
      </section>

      <section className="parent-auth-card">
        <div className="parent-auth-switch">
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
            Tạo tài khoản
          </button>
        </div>

        <form onSubmit={submit}>
          <div>
            <p className="parent-eyebrow">
              {mode === 'login' ? 'CHÀO MỪNG QUAY LẠI' : 'TÀI KHOẢN PHỤ HUYNH'}
            </p>
            <h2>
              {mode === 'login'
                ? 'Đăng nhập phụ huynh'
                : 'Tạo tài khoản phụ huynh'}
            </h2>
          </div>

          {mode === 'register' ? (
            <label>
              Tên phụ huynh
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Mật khẩu
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {message ? <p className="parent-message">{message}</p> : null}

          <button type="submit" className="parent-primary" disabled={busy}>
            {busy
              ? 'Đang xử lý…'
              : mode === 'login'
                ? 'Vào trang phụ huynh'
                : 'Tạo tài khoản'}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}

function ParentLinkScreen({
  workspace,
  onLinked,
}: {
  workspace: ParentWorkspace
  onLinked: () => void
}) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await redeemParentLink({
        displayName: workspace.parent.display_name,
        linkCode: code,
      })
      onLinked()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Không liên kết được.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="parent-link-page">
      <section>
        <span className="parent-brand-mark"><KeyRound size={30} /></span>
        <p className="parent-eyebrow">LIÊN KẾT HỌC SINH</p>
        <h1>Nhập mã do giáo viên cung cấp.</h1>
        <p>
          Mã chỉ dùng một lần và liên kết tài khoản này với đúng một học sinh.
        </p>
        <form onSubmit={submit}>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="VD: H7K9M2PQ4T"
            minLength={8}
            maxLength={16}
            required
          />
          {message ? <p className="parent-message">{message}</p> : null}
          <button type="submit" className="parent-primary" disabled={busy}>
            <UserRoundCheck size={18} />
            {busy ? 'Đang liên kết…' : 'Liên kết với con'}
          </button>
        </form>
      </section>
    </main>
  )
}

export function ParentApp() {
  const [status, setStatus] = useState<'loading' | 'guest' | 'ready'>('loading')
  const [workspace, setWorkspace] = useState<ParentWorkspace | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const user = await getParentUser()
      if (!user) {
        setWorkspace(null)
        setStatus('guest')
        return
      }

      const next = await fetchParentWorkspace()
      setWorkspace(next)
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.')
      setStatus('guest')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const logout = async () => {
    await signOutParent()
    setWorkspace(null)
    setStatus('guest')
  }

  const assignmentBest = useMemo(() => {
    if (!workspace) return new Map<string, number>()

    const best = new Map<string, number>()
    for (const attempt of workspace.attempts) {
      const current = best.get(attempt.assignment_id)
      const score = Number(attempt.score)
      if (current === undefined || score > current) {
        best.set(attempt.assignment_id, score)
      }
    }
    return best
  }, [workspace])

  if (status === 'loading') {
    return (
      <main className="parent-loading">
        <span className="parent-brand-mark"><Wallet size={30} /></span>
        <strong>Đang mở trang phụ huynh…</strong>
      </main>
    )
  }

  if (status === 'guest' || !workspace) {
    return (
      <>
        <ParentAuth onReady={() => void load()} />
        {error ? <p className="parent-floating-error">{error}</p> : null}
      </>
    )
  }

  if (!workspace.link || !workspace.student) {
    return (
      <ParentLinkScreen
        workspace={workspace}
        onLinked={() => void load()}
      />
    )
  }

  const mastery = averageMastery(workspace)
  const recentSubmissions = workspace.submissions.slice(0, 8)
  const chronological = [...workspace.submissions].reverse()
  const scoreTrend =
    chronological.length >= 2
      ? Number(chronological.at(-1)?.score ?? 0) -
        Number(chronological[0]?.score ?? 0)
      : null

  return (
    <div className="parent-shell">
      <header className="parent-header">
        <a href="/parent" className="parent-brand">
          <span className="parent-brand-mark"><Wallet size={27} /></span>
          <span><strong>SmartKid Wallet</strong><small>Phụ huynh</small></span>
        </a>
        <div>
          <button type="button" onClick={() => void load()}>
            <RefreshCw size={18} /> Làm mới
          </button>
          <button type="button" onClick={logout}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </header>

      <main className="parent-main">
        <section className="parent-child-hero">
          <span className="parent-child-avatar">
            {workspace.student.display_name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="parent-eyebrow">
              {workspace.classroom?.name?.toUpperCase() ?? 'HỌC SINH'}
            </p>
            <h1>{workspace.student.display_name}</h1>
            <p>
              @{workspace.student.username} · dữ liệu cập nhật tự động từ tài
              khoản lớp
            </p>
          </div>
          <span className="parent-linked-badge">
            <BadgeCheck size={18} /> Đã liên kết
          </span>
        </section>

        <section className="parent-kpis">
          <article>
            <GraduationCap size={21} />
            <span>Cấp hiện tại</span>
            <strong>{workspace.snapshot?.level ?? '—'}</strong>
          </article>
          <article>
            <Star size={21} />
            <span>Tổng XP</span>
            <strong>{workspace.snapshot?.total_xp ?? '—'}</strong>
          </article>
          <article>
            <Coins size={21} />
            <span>Xu hiện có</span>
            <strong>
              {workspace.snapshot?.coins?.toLocaleString('vi-VN') ?? '—'}
            </strong>
          </article>
          <article>
            <Sparkles size={21} />
            <span>Mastery trung bình</span>
            <strong>
              {mastery === null ? '—' : Math.round(mastery) + '/100'}
            </strong>
          </article>
          <article>
            <TrendingUp size={21} />
            <span>Xu hướng điểm</span>
            <strong>
              {scoreTrend === null
                ? 'Chưa đủ lượt'
                : (scoreTrend >= 0 ? '+' : '') + formatScore(scoreTrend)}
            </strong>
          </article>
        </section>

        <div className="parent-dashboard-grid">
          <section className="parent-card parent-assignments">
            <header>
              <div>
                <p className="parent-eyebrow">KẾT QUẢ BÀI LỚP</p>
                <h2>Assignment gần đây</h2>
              </div>
              <Trophy size={24} />
            </header>
            {workspace.assignments.length ? (
              <div>
                {workspace.assignments.slice(0, 8).map((assignment) => {
                  const attempts = workspace.attempts.filter(
                    (item) => item.assignment_id === assignment.assignment_id,
                  )
                  const best = assignmentBest.get(assignment.assignment_id)
                  return (
                    <article key={assignment.assignment_id}>
                      <div>
                        <strong>{assignment.title}</strong>
                        <span>
                          {assignment.week_key} · {attempts.length} lượt
                        </span>
                      </div>
                      <b>{best === undefined ? 'Chưa làm' : formatScore(best)}</b>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="parent-muted">Chưa có bài lớp.</p>
            )}
          </section>

          <section className="parent-card parent-reviews">
            <header>
              <div>
                <p className="parent-eyebrow">NHẬN XÉT GIÁO VIÊN</p>
                <h2>Điều giáo viên ghi nhận</h2>
              </div>
              <MessageSquareText size={24} />
            </header>
            {workspace.reviews.length ? (
              <div>
                {workspace.reviews.slice(0, 6).map((review) => (
                  <article key={review.review_id}>
                    <p>{review.comment}</p>
                    <span>{formatDate(review.created_at)}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="parent-muted">Chưa có nhận xét mới.</p>
            )}
          </section>

          <section className="parent-card parent-progress-card">
            <header>
              <div>
                <p className="parent-eyebrow">TIẾN ĐỘ CHƠI</p>
                <h2>Hành trình của con</h2>
              </div>
              <BookOpenCheck size={24} />
            </header>
            <div className="parent-progress-stats">
              <span>
                Chapter đã hoàn thành
                <strong>
                  {workspace.snapshot?.completed_world_chapters.length ?? 0}
                </strong>
              </span>
              <span>
                Nhiệm vụ đã hoàn thành
                <strong>
                  {workspace.snapshot?.completed_missions.length ?? 0}
                </strong>
              </span>
              <span>
                Lượt kết quả chi tiết
                <strong>{workspace.submissions.length}</strong>
              </span>
            </div>
          </section>

          <section className="parent-card parent-activity-card">
            <header>
              <div>
                <p className="parent-eyebrow">KẾT QUẢ GẦN ĐÂY</p>
                <h2>Điểm theo từng lượt</h2>
              </div>
              <TrendingUp size={24} />
            </header>
            {recentSubmissions.length ? (
              <div className="parent-activity-list">
                {recentSubmissions.map((submission) => (
                  <article key={submission.submission_id}>
                    <div>
                      <strong>{activityLabel(submission)}</strong>
                      <span>
                        Lượt {submission.attempt_number} ·{' '}
                        {formatDate(submission.created_at)}
                      </span>
                    </div>
                    <span>{submission.stars}/5 ★</span>
                    <b>{formatScore(Number(submission.score))}</b>
                  </article>
                ))}
              </div>
            ) : (
              <p className="parent-muted">
                Chưa có lượt chơi chi tiết được đồng bộ.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
