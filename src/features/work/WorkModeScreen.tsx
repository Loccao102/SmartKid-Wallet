import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
  CircleAlert,
  Boxes,
} from 'lucide-react'
import { getWorkScenario } from '../../data/workShift'
import { demoWorkStudentKey } from '../../data/workShiftInstances'
import { getWorkWorldEffect } from '../../data/workWorldEffects'
import { ResearchExportPanel } from '../research/ResearchExportPanel'
import {
  createResearchEvent,
  createResearchSnapshot,
  getShiftResearchContext,
} from '../../domain/researchEvents'
import {
  applyMathAttempt,
  applyScenarioChoice,
  applyWorkWorldEffect,
  calculateBasketTotal,
  calculateChange,
  calculateEffectiveTotal,
  createInitialWorkShiftProgress,
  resolveDueConsequences,
  settleCustomer,
} from '../../domain/workShiftEngine'
import type {
  ResearchEvent,
  WorkScenarioChoice,
  WorkShiftDefinition,
  WorkShiftProgress,
  WorkWorldFlag,
} from '../../domain/types'
import { useResearchLogStore } from '../../store/researchLog'
import { useWorkShiftStore } from '../../store/workShift'

const WorkModeGame = lazy(() => import('../../game/WorkModeGame'))

const money = new Intl.NumberFormat('vi-VN')

const worldFlagLabels: Record<WorkWorldFlag, string> = {
  'complaint-risk': 'Nguy cơ khiếu nại',
  'pricing-mismatch': 'Sai lệch giá',
  'inventory-pressure': 'Tồn kho căng',
  'cash-discrepancy': 'Chênh lệch tiền mặt',
  'billing-dispute': 'Tranh chấp hóa đơn',
  'stale-promo-sign': 'Biển khuyến mãi cũ',
}

function normalizeMoney(value: string) {
  return Number(value.replace(/[.,\sđ]/gi, ''))
}

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
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

export function WorkModeScreen({
  shift,
  onBack,
}: {
  shift: WorkShiftDefinition
  onBack: () => void
}) {
  const storedProgress = useWorkShiftStore(
    (state) => state.progressByShiftId[shift.id],
  )
  const setProgress = useWorkShiftStore((state) => state.setProgress)
  const resetShift = useWorkShiftStore((state) => state.resetShift)
  const appendResearchEvent = useResearchLogStore((state) => state.appendEvent)
  const ensureShiftSession = useResearchLogStore((state) => state.ensureShiftSession)
  const endShiftSession = useResearchLogStore((state) => state.endShiftSession)
  const progress = storedProgress ?? createInitialWorkShiftProgress(shift)
  const shiftSeed =
    'seed' in shift && typeof shift.seed === 'number' ? shift.seed : null
  const studentKey =
    'studentKey' in shift && typeof shift.studentKey === 'string'
      ? shift.studentKey
      : demoWorkStudentKey
  const shiftResearchContext = getShiftResearchContext(shift)
  const sessionIdRef = useRef<string | null>(null)
  const stageStartedAtRef = useRef(nowMs())

  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')

  const customer = shift.customers[progress.customerIndex] ?? null
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

  const stage = !customerProgress
    ? 'total'
    : !customerProgress.totalSolved
      ? 'total'
      : scenario && !customerProgress.scenarioChoiceId
        ? 'scenario'
        : !customerProgress.changeSolved
          ? 'change'
          : 'done'

  const getSessionId = () => {
    if (sessionIdRef.current) return sessionIdRef.current

    const sessionId = ensureShiftSession(shift.id, studentKey)
    sessionIdRef.current = sessionId
    return sessionId
  }

  const logResearchEvent = (
    event: Omit<
      ResearchEvent,
      | 'schemaVersion'
      | 'eventId'
      | 'occurredAt'
      | 'sessionId'
      | 'studentKey'
      | 'shiftId'
      | 'shiftTemplateId'
      | 'shiftTemplateVersion'
      | 'shiftSeed'
      | 'shiftVariantIndex'
    >,
  ) => {
    appendResearchEvent(
      createResearchEvent({
        sessionId: getSessionId(),
        studentKey,
        ...shiftResearchContext,
        ...event,
      }),
    )
  }

  useEffect(() => {
    if (progress.completed) return

    const sessionId = ensureShiftSession(shift.id, studentKey)
    sessionIdRef.current = sessionId

    const alreadyStarted = useResearchLogStore
      .getState()
      .events.some(
        (event) =>
          event.sessionId === sessionId &&
          event.eventType === 'shift_started',
      )

    if (!alreadyStarted) {
      appendResearchEvent(
        createResearchEvent({
          sessionId,
          studentKey,
          ...shiftResearchContext,
          eventType: 'shift_started',
          before: createResearchSnapshot(progress),
          after: createResearchSnapshot(progress),
          metadata: {
            customerCount: shift.customers.length,
            scenarioCount: shift.customers.filter(
              (item) => Boolean(item.scenarioId),
            ).length,
          },
        }),
      )
    }
  }, [
    appendResearchEvent,
    ensureShiftSession,
    progress.completed,
    shift.id,
    studentKey,
  ])

  useEffect(() => {
    stageStartedAtRef.current = nowMs()
  }, [shift.id, progress.customerIndex, stage])

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
          <h1>{shift.title} đã kết thúc</h1>
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
              <strong>{progress.metrics.servedCustomers}/{shift.customers.length}</strong>
            </div>
            <div>
              <span>Sai số tính toán</span>
              <strong>{progress.metrics.mathMistakes}</strong>
            </div>
            <div>
              <span>Hệ quả đã phát sinh</span>
              <strong>{progress.worldState.resolvedConsequences.length}</strong>
            </div>
          </div>

          {progress.worldState.resolvedConsequences.length > 0 ? (
            <div className="work-consequence-history">
              <strong>Những việc đã xảy ra sau quyết định của em</strong>
              {progress.worldState.resolvedConsequences.map((item) => (
                <div key={item.instanceId}>
                  <CircleAlert size={15} aria-hidden="true" />
                  <span>
                    <b>{item.title}</b>
                    <small>{item.description}</small>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <ResearchExportPanel shiftId={shift.id} />

          <button
            type="button"
            className="primary-button"
            onClick={() => resetShift(shift.id)}
          >
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

  const submitNumeric = () => {
    const mathStage = stage === 'change' ? 'change' : 'total'
    const expected = mathStage === 'total' ? baseTotal : expectedChange
    const submittedAnswer = normalizeMoney(answer)
    const correct = submittedAnswer === expected
    const attemptNumber =
      mathStage === 'total'
        ? customerProgress.totalAttempts + 1
        : customerProgress.changeAttempts + 1
    const responseTimeMs = Math.max(
      0,
      Math.round(nowMs() - stageStartedAtRef.current),
    )

    const attemptPatch =
      mathStage === 'total'
        ? {
            totalAttempts: attemptNumber,
            ...(correct ? { totalSolved: true } : {}),
          }
        : {
            changeAttempts: attemptNumber,
            ...(correct ? { changeSolved: true } : {}),
          }

    const next = updateCustomerProgress(
      progress,
      customer.id,
      attemptPatch,
    )
    const nextProgress = correct
      ? next
      : {
          ...next,
          metrics: applyMathAttempt(progress.metrics, false),
        }

    setProgress(shift.id, nextProgress)

    logResearchEvent({
      eventType: 'math_attempt',
      customerId: customer.id,
      customerIndex: progress.customerIndex,
      scenarioId: customer.scenarioId,
      scenarioVersion: customer.scenarioVersion,
      mathStage,
      submittedAnswer,
      expectedAnswer: expected,
      correct,
      attemptNumber,
      responseTimeMs,
      before: createResearchSnapshot(progress),
      after: createResearchSnapshot(nextProgress),
    })

    stageStartedAtRef.current = nowMs()

    if (!correct) {
      setFeedback('wrong')
      return
    }

    setAnswer('')
    setFeedback('correct')
  }

  const chooseScenario = (choice: WorkScenarioChoice) => {
    if (!scenario) return

    const next = updateCustomerProgress(progress, customer.id, {
      scenarioChoiceId: choice.id,
    })
    const worldEffect = getWorkWorldEffect(scenario.id, choice.id)
    const nextProgress = {
      ...next,
      metrics: applyScenarioChoice(progress.metrics, choice),
      worldState: applyWorkWorldEffect(
        progress.worldState,
        worldEffect,
        progress.metrics.servedCustomers,
      ),
    }

    setProgress(shift.id, nextProgress)

    logResearchEvent({
      eventType: 'scenario_choice',
      customerId: customer.id,
      customerIndex: progress.customerIndex,
      scenarioId: scenario.id,
      scenarioVersion: scenario.version,
      choiceId: choice.id,
      responseTimeMs: Math.max(
        0,
        Math.round(nowMs() - stageStartedAtRef.current),
      ),
      before: createResearchSnapshot(progress),
      after: createResearchSnapshot(nextProgress),
      metadata: {
        category: scenario.category,
        difficulty: scenario.difficulty,
        billDelta: choice.billDelta,
      },
    })

    stageStartedAtRef.current = nowMs()
    setFeedback('idle')
  }

  const continueCustomer = () => {
    const settledMetrics = settleCustomer(
      progress.metrics,
      customer.basket,
      selectedChoice,
    )
    const isLast = progress.customerIndex >= shift.customers.length - 1
    const resolved = resolveDueConsequences(
      settledMetrics,
      progress.worldState,
      settledMetrics.servedCustomers,
      isLast,
    )
    const nextProgress: WorkShiftProgress = {
      ...progress,
      metrics: resolved.metrics,
      worldState: resolved.worldState,
      customerIndex: isLast
        ? progress.customerIndex
        : progress.customerIndex + 1,
      completed: isLast,
    }

    setProgress(shift.id, nextProgress)

    logResearchEvent({
      eventType: 'customer_settled',
      customerId: customer.id,
      customerIndex: progress.customerIndex,
      scenarioId: customer.scenarioId,
      scenarioVersion: customer.scenarioVersion,
      choiceId: selectedChoice?.id,
      before: createResearchSnapshot(progress),
      after: createResearchSnapshot(nextProgress),
      metadata: {
        baseTotal,
        effectiveTotal,
        cashGiven: customer.cashGiven,
        changeGiven: expectedChange,
        consequencesResolved: resolved.newlyResolved.length,
      },
    })

    for (const consequence of resolved.newlyResolved) {
      logResearchEvent({
        eventType: 'consequence_resolved',
        customerId: customer.id,
        customerIndex: progress.customerIndex,
        scenarioId: customer.scenarioId,
        scenarioVersion: customer.scenarioVersion,
        consequenceId: consequence.id,
        consequenceInstanceId: consequence.instanceId,
        before: createResearchSnapshot(progress),
        after: createResearchSnapshot(nextProgress),
        metadata: {
          trigger: consequence.trigger,
          resolvedAtServedCustomers: consequence.resolvedAtServedCustomers,
        },
      })
    }

    if (isLast) {
      logResearchEvent({
        eventType: 'shift_completed',
        customerId: customer.id,
        customerIndex: progress.customerIndex,
        before: createResearchSnapshot(progress),
        after: createResearchSnapshot(nextProgress),
        metadata: {
          servedCustomers: nextProgress.metrics.servedCustomers,
          mathMistakes: nextProgress.metrics.mathMistakes,
          resolvedConsequences:
            nextProgress.worldState.resolvedConsequences.length,
        },
      })

      endShiftSession(shift.id)
      sessionIdRef.current = null
    }

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
            Khách {progress.customerIndex + 1}/{shift.customers.length}
          </span>
          <div>
            <i
              style={{
                width:
                  ((progress.customerIndex +
                    (stage === 'done' ? 1 : 0)) /
                    shift.customers.length) *
                    100 +
                  '%',
              }}
            />
          </div>
        </div>
      </div>

      <header className="work-mode-hero">
        <div>
          <p className="page-kicker">WORK MODE · {shift.roleTitle.toUpperCase()}</p>
          <h1>{shift.title}</h1>
          <p>{shift.subtitle}</p>
          {shiftSeed !== null ? (
            <span className="work-seed-chip">Seed #{shiftSeed}</span>
          ) : null}
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
            customers={shift.customers}
            customerIndex={progress.customerIndex}
            stage={stage}
            selectedChoice={selectedChoice}
            worldFlags={progress.worldState.flags}
          />
        </Suspense>

        <div className="work-game-legend">
          <span><i className="queue" /> Khách đang chờ</span>
          <span><i className="active" /> Khách tại quầy</span>
          <span><i className="event" /> Event cần xử lý</span>
        </div>
      </section>

      <section className="work-world-state-card">
        <div className="work-world-state-heading">
          <div>
            <p className="page-kicker">WORLD STATE</p>
            <h2>Trạng thái cửa hàng đang được mang sang khách tiếp theo</h2>
          </div>
          <span>
            <Boxes size={17} aria-hidden="true" />
            {progress.worldState.pendingConsequences.length} hệ quả đang chờ
          </span>
        </div>

        <div className="work-world-flags">
          {progress.worldState.flags.length > 0 ? (
            progress.worldState.flags.map((flag) => (
              <span key={flag}>
                <CircleAlert size={13} aria-hidden="true" />
                {worldFlagLabels[flag]}
              </span>
            ))
          ) : (
            <span className="is-stable">
              <Check size={13} aria-hidden="true" />
              Cửa hàng đang ổn định
            </span>
          )}
        </div>

        {progress.worldState.resolvedConsequences.length > 0 ? (
          <div className="work-latest-consequence">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>
                {
                  progress.worldState.resolvedConsequences[
                    progress.worldState.resolvedConsequences.length - 1
                  ].title
                }
              </strong>
              <p>
                {
                  progress.worldState.resolvedConsequences[
                    progress.worldState.resolvedConsequences.length - 1
                  ].description
                }
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <div className="work-mode-layout">
        <aside className="work-customer-queue">
          <p className="page-kicker">HÀNG CHỜ</p>
          {shift.customers.map((item, index) => {
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
                {progress.customerIndex === shift.customers.length - 1
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
