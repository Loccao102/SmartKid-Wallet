import type {
  ResearchEvent,
  ResearchEventSnapshot,
  WorkShiftDefinition,
  WorkShiftInstance,
  WorkShiftProgress,
} from './types'

let fallbackEventSequence = 0

function createEventId() {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID()
  }

  fallbackEventSequence += 1
  return 'event-' + Date.now() + '-' + fallbackEventSequence
}

export function createResearchSnapshot(
  progress: Pick<WorkShiftProgress, 'metrics' | 'worldState'>,
): ResearchEventSnapshot {
  return {
    metrics: {
      ...progress.metrics,
    },
    worldState: {
      flags: [...progress.worldState.flags],
      pendingConsequences: progress.worldState.pendingConsequences.map((item) => ({
        ...item,
        clearFlags: item.clearFlags ? [...item.clearFlags] : undefined,
      })),
      resolvedConsequences: progress.worldState.resolvedConsequences.map((item) => ({
        ...item,
        clearFlags: item.clearFlags ? [...item.clearFlags] : undefined,
      })),
      pendingFollowUps: progress.worldState.pendingFollowUps.map((item) => ({
        ...item,
        choices: item.choices.map((choice) => ({ ...choice })),
      })),
      resolvedFollowUps: progress.worldState.resolvedFollowUps.map((item) => ({
        ...item,
        choices: item.choices.map((choice) => ({ ...choice })),
      })),
    },
  }
}

export function getShiftResearchContext(shift: WorkShiftDefinition) {
  const instance = shift as Partial<WorkShiftInstance>

  return {
    shiftId: shift.id,
    shiftTemplateId: instance.templateId,
    shiftTemplateVersion: instance.templateVersion,
    shiftSeed: instance.seed,
    shiftVariantIndex: instance.variantIndex,
  }
}

export function createResearchEvent(
  input: Omit<ResearchEvent, 'schemaVersion' | 'eventId' | 'occurredAt'> & {
    eventId?: string
    occurredAt?: string
  },
): ResearchEvent {
  return {
    schemaVersion: 1,
    eventId: input.eventId ?? createEventId(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    ...input,
  }
}

function escapeCsv(value: unknown) {
  if (value === undefined || value === null) return ''

  const text =
    typeof value === 'object' ? JSON.stringify(value) : String(value)

  if (/[",\n\r]/.test(text)) {
    return '"' + text.replaceAll('"', '""') + '"'
  }

  return text
}

export function researchEventsToCsv(events: ResearchEvent[]) {
  const headers = [
    'schemaVersion',
    'eventId',
    'sessionId',
    'eventType',
    'occurredAt',
    'studentKey',
    'shiftId',
    'shiftTemplateId',
    'shiftTemplateVersion',
    'shiftSeed',
    'shiftVariantIndex',
    'customerId',
    'customerIndex',
    'scenarioId',
    'scenarioVersion',
    'choiceId',
    'mathStage',
    'submittedAnswer',
    'expectedAnswer',
    'correct',
    'attemptNumber',
    'responseTimeMs',
    'consequenceId',
    'consequenceInstanceId',
    'before',
    'after',
    'metadata',
  ] as const

  const lines = events.map((event) =>
    headers
      .map((header) => escapeCsv(event[header]))
      .join(','),
  )

  return [headers.join(','), ...lines].join('\n')
}
