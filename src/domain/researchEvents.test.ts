import { describe, expect, it } from 'vitest'
import { traineeShift } from '../data/workShift'
import { createInitialWorkShiftProgress } from './workShiftEngine'
import {
  createResearchEvent,
  createResearchSnapshot,
  getShiftResearchContext,
  researchEventsToCsv,
} from './researchEvents'

describe('research events', () => {
  it('creates schema-v1 events with stable supplied ids and timestamps', () => {
    const event = createResearchEvent({
      eventId: 'event-test-1',
      occurredAt: '2026-09-29T10:00:00.000Z',
      sessionId: 'session-test',
      eventType: 'math_attempt',
      studentKey: 'student-a',
      shiftId: 'shift-a',
      customerId: 'customer-a',
      customerIndex: 0,
      mathStage: 'total',
      submittedAnswer: 100000,
      expectedAnswer: 100000,
      correct: true,
      attemptNumber: 1,
      responseTimeMs: 4500,
    })

    expect(event.schemaVersion).toBe(1)
    expect(event.eventId).toBe('event-test-1')
    expect(event.occurredAt).toBe('2026-09-29T10:00:00.000Z')
    expect(event.correct).toBe(true)
  })

  it('deep-copies metrics and world state snapshots', () => {
    const progress = createInitialWorkShiftProgress(traineeShift)
    progress.worldState.flags.push('complaint-risk')

    const snapshot = createResearchSnapshot(progress)

    progress.metrics.employeeRating = 1
    progress.worldState.flags.push('billing-dispute')

    expect(snapshot.metrics.employeeRating).toBe(4)
    expect(snapshot.worldState.flags).toEqual(['complaint-risk'])
  })

  it('returns only available seeded shift context fields', () => {
    const fixed = getShiftResearchContext(traineeShift)

    expect(fixed.shiftId).toBe(traineeShift.id)
    expect(fixed.shiftSeed).toBeUndefined()
    expect(fixed.shiftTemplateId).toBeUndefined()
  })

  it('exports nested snapshots and metadata as valid escaped CSV cells', () => {
    const event = createResearchEvent({
      eventId: 'event-csv',
      occurredAt: '2026-09-29T10:05:00.000Z',
      sessionId: 'session-csv',
      eventType: 'scenario_choice',
      studentKey: 'student-a',
      shiftId: 'shift-a',
      scenarioId: 'SCENARIO_TEST',
      scenarioVersion: 1,
      choiceId: 'choice-a',
      before: createResearchSnapshot(
        createInitialWorkShiftProgress(traineeShift),
      ),
      after: createResearchSnapshot(
        createInitialWorkShiftProgress(traineeShift),
      ),
      metadata: {
        category: 'billing',
        note: 'contains,comma',
      },
    })

    const csv = researchEventsToCsv([event])

    expect(csv.split('\n')).toHaveLength(2)
    expect(csv).toContain('scenario_choice')
    expect(csv).toContain('SCENARIO_TEST')
    expect(csv).toContain('""contains,comma""')
  })
})
