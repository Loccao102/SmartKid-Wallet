import { describe, expect, it } from 'vitest'
import { createInitialWorkShiftProgress } from '../domain/workShiftEngine'
import { traineeShift } from '../data/workShift'
import { createResearchEvent, createResearchSnapshot } from '../domain/researchEvents'
import { researchEventToRow } from './researchRemote'

describe('research remote mapping', () => {
  it('maps schema-v1 events to Supabase columns without PII fields', () => {
    const progress = createInitialWorkShiftProgress(traineeShift)

    const event = createResearchEvent({
      eventId: 'event-remote-test',
      occurredAt: '2026-09-29T09:00:00.000Z',
      sessionId: 'session-remote-test',
      eventType: 'math_attempt',
      studentKey: 'student-pseudo-001',
      shiftId: traineeShift.id,
      customerId: traineeShift.customers[0].id,
      customerIndex: 0,
      mathStage: 'total',
      submittedAnswer: 102000,
      expectedAnswer: 102000,
      correct: true,
      attemptNumber: 1,
      responseTimeMs: 3200,
      before: createResearchSnapshot(progress),
      after: createResearchSnapshot(progress),
      metadata: {
        source: 'work-mode',
      },
    })

    const row = researchEventToRow(event)

    expect(row.event_id).toBe('event-remote-test')
    expect(row.schema_version).toBe(1)
    expect(row.student_key).toBe('student-pseudo-001')
    expect(row.correct).toBe(true)
    expect(row.before_state).toMatchObject({ metrics: { employeeRating: 4 } })
    expect(row.metadata).toEqual({ source: 'work-mode' })

    expect(Object.keys(row)).not.toContain('name')
    expect(Object.keys(row)).not.toContain('email')
    expect(Object.keys(row)).not.toContain('phone')
  })

  it('maps absent optional event fields to null for PostgREST', () => {
    const event = createResearchEvent({
      eventId: 'event-minimal',
      occurredAt: '2026-09-29T09:01:00.000Z',
      sessionId: 'session-minimal',
      eventType: 'shift_started',
      studentKey: 'student-pseudo-002',
      shiftId: traineeShift.id,
    })

    const row = researchEventToRow(event)

    expect(row.scenario_id).toBeNull()
    expect(row.choice_id).toBeNull()
    expect(row.math_stage).toBeNull()
    expect(row.before_state).toBeNull()
    expect(row.metadata).toBeNull()
  })
})
