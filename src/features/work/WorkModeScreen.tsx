import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Star,
  Store,
  UserRound,
  Users,
  WalletCards,
  Gamepad2,
} from 'lucide-react'
import {
  getWorkScenario,
  traineeShift,
} from '../../data/workShift'
import {
  applyMathAttempt,
  applyScenarioChoice,
  calculateBasketTotal,
  calculateChange,
  calculateEffectiveTotal,
  settleCustomer,
} from '../../domain/workShiftEngine'
import type {
  WorkScenarioChoice,
  WorkShiftProgress,
} from '../../domain/types'
import { useWorkShiftStore } from '../../store/workShift'

const WorkModeGame = lazy(() => import('../../game/WorkModeGame'))

const money = new Intl.NumberFormat('vi-VN')

function normalizeMoney(value: string) {
  return Number(value.replace(/[.,\sđ]/gi, ''))
}

function MetricCard({
  icon,
  label,
  value,
  suffix = '/5',
}: {
  icon: ReactNode
  label: string
  value: number
  suffix?: string
}) {
  return (
    <div className="work-metric-card">
      <span aria-hidden="true">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>
          {value.toFixed(suffix === '/5' ? 1 : 0)}
          {suffix}
        </strong>
      </div>
    </div>
  )
}

function updateCustomerProgress(
  progress: WorkShiftProgress,
  customerId: string,
  patch: Partial<WorkShiftProgress['customerProgress'][string]>,
): WorkShiftProgress {
  return {
    ...progress,
    customerProgress: {
      ...progress.customerProgress,
      [customerId]: {
        ...progress.customerProgress[customerId],
        ...patch,
      },
    },
  }
}

export function WorkModeScreen({ onBack }: { onBack: () => void }) {
  const progress = useWorkShiftStore((state) => state.progress)
  const setProgress = useWorkShiftStore((state) => state.setProgress)
  const resetShift = useWorkShiftStore((state) => state.resetShift)

  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')

  const customer = traineeShift.customers[progress.customerIndex] ?? null
  const customerProgress = customer
    ? progress.customerProgress[customer.id]
    : null

  const scenario = customer?.scenarioId
    ? getWorkScenario(customer.scenarioId)
    : null

  const selectedChoice = useMemo(() => {
    if (!scenario || !customerProgress?.scenarioChoiceId) return undefined

    return scenario.choices.find(
      (choice) => choice.id === customerProgress.scenarioChoiceId,
    )
  }, [scenario, customerProgress?.scenarioChoiceId])

  if (progress.completed || !customer || !customerProgress) {
    return (
      <section className="work-mode-screen">
        <div className="smartmart-toolbar">
          <button type="button" className="back-button" onClick={onBack}>
            <ArrowLeft size={15} aria-hidden="true" />
            Quay lại nhiệm vụ
          </button>
        </div>

        <div className="work-complete-card">
          <div className="work-complete-icon" aria-hidden="true">
            <BadgeCheck size={42} strokeWidth={1.8} />
          </div>
          <p className="page-kicker">CA LÀM VIỆC HOÀN THÀNH</p>
          <h1>Ca đầu tiên của em đã kết thúc</h1>
          <p>
            Kết quả phản ánh cả độ chính xác khi tính toán và cách em xử lý tình
            huống trong cửa hàng.
          </p>

          <div className="work-complete-metrics">
            <MetricCard
              icon={<Star size={20} />}
              label="Đánh giá nhân viên"
              value={progress.metrics.employeeRating}
            />
            <MetricCard
              icon={<Store size={20} />}
              label="Uy tín cửa hàng"
              value={progress.metrics.storeReputation}
            />
            <MetricCard
              icon={<Users size={20} />}
              label="Hài lòng khách"
              value={progress.metrics.customerSatisfaction}
            />
            <MetricCard
              icon={<CircleDollarSign size={20} />}
              label="Doanh thu"
              value={progress.metrics.revenue}
              suffix="đ"
            />
          </div>

          <div className="work-complete-summary">
            <div>
              <span>Khách đã phục vụ</span>
              <strong>{progress.metrics.servedCustomers}/3</strong>
            </div>
            <div>
              <span>Sai số tính toán</span>
              <strong>{progress.metrics.mathMistakes}</strong>
            </div>
          </div>

          <button type="button" className="primary-button" onClick={resetShift}>
            <RefreshCcw size={15} aria-hidden="true" />
            Chơi lại ca làm việc
          </button>
        </div>
      </section>
    )
  }

  const baseTotal = calculateBasketTotal(customer.basket)
  const effectiveTotal = calculateEffectiveTotal(customer.basket, selectedChoice)
  const expectedChange = calculateChange(
    customer.basket,
    customer.cashGiven,
    selectedChoice,
  )

  const stage = !customerProgress.totalSolved
    ? 'total'
    : scenario && !customerProgress.scenarioChoiceId
      ? 'scenario'
      : !customerProgress.changeSolved
        ? 'change'
        : 'done'

  const submitNumeric = () => {
    const expected = stage === 'total' ? baseTotal : expectedChange
    const correct = normalizeMoney(answer) === expected

    if (!correct) {
      const attemptPatch =
        stage === 'total'
          ? { totalAttempts: customerProgress.totalAttempts + 1 }
          : { changeAttempts: customerProgress.changeAttempts + 1 }
      const next = updateCustomerProgress(
        progress,
        customer.id,
        attemptPatch,
      )

      setProgress({
        ...next,
        metrics: applyMathAttempt(progress.metrics, false),
      })
      setFeedback('wrong')
      return
    }

    const patch =
      stage === 'total'
        ? {
            totalSolved: true,
            totalAttempts: customerProgress.totalAttempts + 1,
          }
        : {
            changeSolved: true,
            changeAttempts: customerProgress.changeAttempts + 1,
          }

    setProgress(updateCustomerProgress(progress, customer.id, patch))
    setAnswer('')
    setFeedback('correct')
  }

  const chooseScenario = (choice: WorkScenarioChoice) => {
    const next = updateCustomerProgress(progress, customer.id, {
      scenarioChoiceId: choice.id,
    })

    setProgress({
      ...next,
      metrics: applyScenarioChoice(progress.metrics, choice),
    })
    setFeedback('idle')
  }

  const continueCustomer = () => {
    const settledMetrics = settleCustomer(
      progress.metrics,
      customer.basket,
      selectedChoice,
    )
    const isLast = progress.customerIndex >= traineeShift.customers.length - 1

    setProgress({
      ...progress,
      metrics: settledMetrics,
      customerIndex: isLast
        ? progress.customerIndex
        : progress.customerIndex + 1,
      completed: isLast,
    })

    setAnswer('')
    setFeedback('idle')
  }

  return (
    <section className="work-mode-screen">
      <div className="smartmart-toolbar">
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={15} aria-hidden="true" />
          Quay lại nhiệm vụ
        </button>

        <div className="work-shift-progress">
          <span>
            Khách {progress.customerIndex + 1}/{traineeShift.customers.length}
          </span>
          <div>
            <i
              style={{
                width:
                  ((progress.customerIndex +
                    (stage === 'done' ? 1 : 0)) /
                    traineeShift.customers.length) *
                    100 +
                  '%',
              }}
            />
          </div>
        </div>
      </div>

      <header className="work-mode-hero">
        <div>
          <p className="page-kicker">WORK MODE · {traineeShift.roleTitle.toUpperCase()}</p>
          <h1>{traineeShift.title}</h1>
          <p>{traineeShift.subtitle}</p>
        </div>

        <div className="work-live-metrics">
          <MetricCard
            icon={<Star size={18} />}
            label="Nhân viên"
            value={progress.metrics.employeeRating}
          />
          <MetricCard
            icon={<Store size={18} />}
            label="Cửa hàng"
            value={progress.metrics.storeReputation}
          />
          <MetricCard
            icon={<Users size={18} />}
            label="Khách hàng"
            value={progress.metrics.customerSatisfaction}
          />
        </div>
      </header>

      <section className="work-game-card">
        <div className="work-game-card-heading">
          <div>
            <p className="page-kicker">QUẦY SMARTMART</p>
            <h2>Phục vụ khách trực tiếp tại quầy</h2>
            <p>
              Scene phản ánh đúng trạng thái giao dịch bên dưới: khách xếp hàng,
              sản phẩm trên băng chuyền và tình huống phát sinh.
            </p>
          </div>
          <span>
            <Gamepad2 size={17} aria-hidden="true" />
            Phaser scene
          </span>
        </div>

        <Suspense
          fallback={
            <div className="work-game-loading">
              <Gamepad2 size={27} aria-hidden="true" />
              <strong>Đang mở quầy thu ngân...</strong>
            </div>
          }
        >
          <WorkModeGame
            customers={traineeShift.customers}
            customerIndex={progress.customerIndex}
            stage={stage}
            selectedChoice={selectedChoice}
          />
        </Suspense>

        <div className="work-game-legend">
          <span><i className="queue" /> Khách đang chờ</span>
          <span><i className="active" /> Khách tại quầy</span>
          <span><i className="event" /> Event cần xử lý</span>
        </div>
      </section>

      <div className="work-mode-layout">
        <aside className="work-customer-queue">
          <p className="page-kicker">HÀNG CHỜ</p>
          {traineeShift.customers.map((item, index) => {
            const itemProgress = progress.customerProgress[item.id]
            const completed =
              index < progress.customerIndex ||
              (index === progress.customerIndex && stage === 'done')

            return (
              <div
                key={item.id}
                className={
                  index === progress.customerIndex
                    ? 'is-current'
                    : completed
                      ? 'is-complete'
                      : ''
                }
              >
                <span aria-hidden="true">
                  {completed ? <Check size={14} /> : <UserRound size={15} />}
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {completed
                      ? 'Đã phục vụ'
                      : index === progress.customerIndex
                        ? 'Đang tại quầy'
                        : 'Đang chờ'}
                  </small>
                </div>
                {itemProgress.scenarioChoiceId ? (
                  <ShieldCheck size={14} aria-label="Đã xử lý tình huống" />
                ) : null}
              </div>
            )
          })}

          <div className="work-shift-stats">
            <div>
              <span>Doanh thu</span>
              <strong>{money.format(progress.metrics.revenue)}đ</strong>
            </div>
            <div>
              <span>Sai phép tính</span>
              <strong>{progress.metrics.mathMistakes}</strong>
            </div>
          </div>
        </aside>

        <main className="work-counter">
          <div className="work-customer-heading">
            <div className="work-customer-avatar">{customer.name.charAt(0)}</div>
            <div>
              <p className="page-kicker">KHÁCH HÀNG HIỆN TẠI</p>
              <h2>{customer.name}</h2>
            </div>
          </div>

          <div className="work-receipt">
            <div className="work-receipt-title">
              <ReceiptText size={18} aria-hidden="true" />
              <strong>Hóa đơn SmartMart</strong>
            </div>

            {customer.basket.map((item) => (
              <div className="work-receipt-line" key={item.name}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>{money.format(item.quantity * item.unitPrice)}đ</strong>
              </div>
            ))}

            <div className="work-receipt-total">
              <span>Tổng trước xử lý</span>
              <strong>
                {customerProgress.totalSolved
                  ? money.format(baseTotal) + 'đ'
                  : '???'}
              </strong>
            </div>

            {selectedChoice?.billDelta ? (
              <div className="work-receipt-adjustment">
                <span>Điều chỉnh từ tình huống</span>
                <strong>
                  {selectedChoice.billDelta > 0 ? '+' : ''}
                  {money.format(selectedChoice.billDelta)}đ
                </strong>
              </div>
            ) : null}

            {selectedChoice ? (
              <div className="work-receipt-total final">
                <span>Cần thanh toán</span>
                <strong>{money.format(effectiveTotal)}đ</strong>
              </div>
            ) : null}
          </div>

          {stage === 'total' ? (
            <div className="work-task-card">
              <div className="work-task-heading">
                <PackageCheck size={21} aria-hidden="true" />
                <div>
                  <p className="page-kicker">BƯỚC 1 · TÍNH HÓA ĐƠN</p>
                  <h3>Khách cần trả bao nhiêu tiền?</h3>
                </div>
              </div>

              <label className="answer-label">
                <span>Nhập tổng hóa đơn</span>
                <div className="answer-row">
                  <input
                    autoFocus
                    inputMode="numeric"
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value)
                      setFeedback('idle')
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') submitNumeric()
                    }}
                    placeholder="Ví dụ: 102000"
                  />
                  <span>đ</span>
                </div>
              </label>

              {feedback === 'wrong' ? (
                <div className="feedback">
                  <RefreshCcw size={15} aria-hidden="true" />
                  <p>Chưa đúng. Kiểm tra lại số lượng × đơn giá của từng món.</p>
                </div>
              ) : null}

              <button type="button" className="primary-button" onClick={submitNumeric}>
                Kiểm tra hóa đơn
              </button>
            </div>
          ) : null}

          {stage === 'scenario' && scenario ? (
            <div className="work-scenario-card">
              <div className="work-task-heading">
                <ShieldCheck size={21} aria-hidden="true" />
                <div>
                  <p className="page-kicker">TÌNH HUỐNG TẠI QUẦY</p>
                  <h3>{scenario.title}</h3>
                </div>
              </div>

              <p>{scenario.description}</p>

              <div className="work-choice-list">
                {scenario.choices.map((choice) => (
                  <button
                    type="button"
                    key={choice.id}
                    onClick={() => chooseScenario(choice)}
                  >
                    <span>{choice.label}</span>
                    {choice.billDelta !== 0 ? (
                      <small>
                        Hóa đơn {choice.billDelta < 0 ? 'giảm ' : 'tăng '}
                        {money.format(Math.abs(choice.billDelta))}đ
                      </small>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {stage === 'change' ? (
            <div className="work-task-card">
              <div className="work-task-heading">
                <WalletCards size={21} aria-hidden="true" />
                <div>
                  <p className="page-kicker">BƯỚC CUỐI · THANH TOÁN</p>
                  <h3>Em cần trả lại khách bao nhiêu tiền?</h3>
                </div>
              </div>

              {selectedChoice ? (
                <div className="work-choice-feedback">
                  <strong>Quyết định vừa chọn</strong>
                  <p>{selectedChoice.feedback}</p>
                </div>
              ) : null}

              <div className="work-payment-summary">
                <div>
                  <span>Khách đưa</span>
                  <strong>{money.format(customer.cashGiven)}đ</strong>
                </div>
                <div>
                  <span>Hóa đơn cần trả</span>
                  <strong>{money.format(effectiveTotal)}đ</strong>
                </div>
              </div>

              <label className="answer-label">
                <span>Tiền thừa</span>
                <div className="answer-row">
                  <input
                    autoFocus
                    inputMode="numeric"
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value)
                      setFeedback('idle')
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') submitNumeric()
                    }}
                    placeholder="Nhập số tiền"
                  />
                  <span>đ</span>
                </div>
              </label>

              {feedback === 'wrong' ? (
                <div className="feedback">
                  <RefreshCcw size={15} aria-hidden="true" />
                  <p>Chưa đúng. Lấy tiền khách đưa trừ số tiền cần thanh toán.</p>
                </div>
              ) : null}

              <button type="button" className="primary-button" onClick={submitNumeric}>
                Xác nhận tiền thừa
              </button>
            </div>
          ) : null}

          {stage === 'done' ? (
            <div className="work-customer-complete">
              <span aria-hidden="true">
                <Check size={24} strokeWidth={2.5} />
              </span>
              <div>
                <p className="page-kicker">GIAO DỊCH HOÀN TẤT</p>
                <h3>{customer.name} đã được phục vụ</h3>
                <p>
                  Tiền thừa đúng: {money.format(expectedChange)}đ. Em có thể gọi
                  khách tiếp theo.
                </p>
              </div>
              <button type="button" onClick={continueCustomer}>
                {progress.customerIndex === traineeShift.customers.length - 1
                  ? 'Kết thúc ca'
                  : 'Khách tiếp theo →'}
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </section>
  )
}
