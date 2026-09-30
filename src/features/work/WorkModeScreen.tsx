import { WorkCounter, WorkResult } from './WorkPresentation'
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
    return <WorkResult shift={shift} progress={progress} onBack={onBack} onReplay={() => resetShift(shift.id)} />
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

  return <WorkCounter shift={shift} progress={progress} stage={stage} answer={answer} feedback={feedback} selectedChoice={selectedChoice} baseTotal={baseTotal} effectiveTotal={effectiveTotal} expectedChange={expectedChange} onAnswer={(value) => { setAnswer(value); setFeedback('idle') }} onSubmit={submitNumeric} onChoice={chooseScenario} onContinue={continueCustomer} onBack={onBack} />
}
