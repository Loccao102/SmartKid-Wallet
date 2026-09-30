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
import { retryCost } from '../../domain/progression'
import { scoreWorkShift } from '../../domain/scoring'
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
import { playGameSfx } from '../../lib/audioEngine'
import { useLearningProfileStore } from '../../store/learningProfile'
import { useProgressionStore } from '../../store/progression'
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
  onReplayShift,
}: {
  shift: WorkShiftDefinition
  onBack: () => void
  onReplayShift?: () => void
}) {
  const storedProgress = useWorkShiftStore(
    (state) => state.progressByShiftId[shift.id],
  )
  const setProgress = useWorkShiftStore((state) => state.setProgress)
  const resetShift = useWorkShiftStore((state) => state.resetShift)
  const appendResearchEvent = useResearchLogStore((state) => state.appendEvent)
  const ensureShiftSession = useResearchLogStore((state) => state.ensureShiftSession)
  const endShiftSession = useResearchLogStore((state) => state.endShiftSession)
  const coins = useProgressionStore((state) => state.coins)
  const spendCoins = useProgressionStore((state) => state.spendCoins)
  const awardXpOnce = useProgressionStore((state) => state.awardXpOnce)
  const recordActivityResult = useProgressionStore((state) => state.recordActivityResult)
  const recordMathAttempt = useLearningProfileStore(
    (state) => state.recordMathAttempt,
  )
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
            fingerprint:
              'fingerprint' in shift && typeof shift.fingerprint === 'string'
                ? shift.fingerprint
                : null,
            difficultyScore:
              'difficultyScore' in shift &&
              typeof shift.difficultyScore === 'number'
                ? shift.difficultyScore
                : null,
            generationAttempt:
              'generationAttempt' in shift &&
              typeof shift.generationAttempt === 'number'
                ? shift.generationAttempt
                : null,
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
      <WorkResult
        shift={shift}
        progress={progress}
        onBack={onBack}
        onReplay={() => {
          if (onReplayShift) {
            onReplayShift()
            return
          }

          resetShift(shift.id)
        }}
      />
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
    if (feedback === 'wrong') return
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
    const skills =
      mathStage === 'total'
        ? (['multiplication', 'addition'] as const)
        : (['subtraction'] as const)
    const mastery = recordMathAttempt(
      skills,
      correct,
      attemptNumber,
      responseTimeMs,
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
      metadata: {
        skills: skills.join(','),
        masteryBeforeMean: Number(mastery.beforeMean.toFixed(2)),
        masteryAfterMean: Number(mastery.afterMean.toFixed(2)),
      },
    })

    stageStartedAtRef.current = nowMs()

    if (!correct) {
      playGameSfx('retry')
      setFeedback('wrong')
      return
    }

    playGameSfx('correct')
    setAnswer('')
    setFeedback('correct')
  }

  const retryNumeric = () => {
    if (!customerProgress) return

    const wrongAttempts =
      stage === 'change'
        ? customerProgress.changeAttempts
        : customerProgress.totalAttempts
    const cost = retryCost(wrongAttempts)
    const paid = spendCoins(cost)

    if (paid) playGameSfx('coin')
    setAnswer('')
    setFeedback('idle')
    stageStartedAtRef.current = nowMs()
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
      completedAtEpochMs: isLast ? Date.now() : progress.completedAtEpochMs,
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
      const hiddenScore = scoreWorkShift(
        shift,
        nextProgress,
        (scenarioId) => getWorkScenario(scenarioId),
      )
      recordActivityResult(
        'work:' + shift.id,
        hiddenScore.stars,
        hiddenScore.total,
        Math.max(
          0,
          (nextProgress.completedAtEpochMs ?? Date.now()) -
            (nextProgress.startedAtEpochMs ?? Date.now()),
        ),
      )
      const xpResult = awardXpOnce('work:' + shift.id, 90)
      if (xpResult?.levelsGained) playGameSfx('level-up')
      else if (xpResult) playGameSfx('xp')
      playGameSfx('mission-complete')

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

  const wrongAttempts =
    stage === 'change'
      ? customerProgress.changeAttempts
      : customerProgress.totalAttempts

  return <WorkCounter shift={shift} progress={progress} stage={stage} answer={answer} feedback={feedback} selectedChoice={selectedChoice} baseTotal={baseTotal} effectiveTotal={effectiveTotal} expectedChange={expectedChange} coins={coins} retryPrice={retryCost(wrongAttempts)} onAnswer={(value) => { setAnswer(value); if (feedback !== 'wrong') setFeedback('idle') }} onSubmit={submitNumeric} onRetry={retryNumeric} onChoice={chooseScenario} onContinue={continueCustomer} onBack={onBack} />
}
