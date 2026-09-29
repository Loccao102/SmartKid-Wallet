import type { ResearchEvent } from '../domain/types'
import type { Json } from '../types/supabase'
import {
  anonymousResearchAuthEnabled,
  isSupabaseConfigured,
  supabase,
} from './supabase'

export interface ResearchEventRow {
  event_id: string
  schema_version: number
  session_id: string
  event_type: ResearchEvent['eventType']
  occurred_at: string
  student_key: string
  shift_id: string
  shift_template_id: string | null
  shift_template_version: number | null
  shift_seed: number | null
  shift_variant_index: number | null
  customer_id: string | null
  customer_index: number | null
  scenario_id: string | null
  scenario_version: number | null
  choice_id: string | null
  math_stage: ResearchEvent['mathStage'] | null
  submitted_answer: number | null
  expected_answer: number | null
  correct: boolean | null
  attempt_number: number | null
  response_time_ms: number | null
  consequence_id: string | null
  consequence_instance_id: string | null
  before_state: Json | null
  after_state: Json | null
  metadata: Json | null
}

function toJson(value: unknown): Json | null {
  if (value === undefined || value === null) return null

  return JSON.parse(JSON.stringify(value)) as Json
}

export function researchEventToRow(event: ResearchEvent): ResearchEventRow {
  return {
    event_id: event.eventId,
    schema_version: event.schemaVersion,
    session_id: event.sessionId,
    event_type: event.eventType,
    occurred_at: event.occurredAt,
    student_key: event.studentKey,
    shift_id: event.shiftId,
    shift_template_id: event.shiftTemplateId ?? null,
    shift_template_version: event.shiftTemplateVersion ?? null,
    shift_seed: event.shiftSeed ?? null,
    shift_variant_index: event.shiftVariantIndex ?? null,
    customer_id: event.customerId ?? null,
    customer_index: event.customerIndex ?? null,
    scenario_id: event.scenarioId ?? null,
    scenario_version: event.scenarioVersion ?? null,
    choice_id: event.choiceId ?? null,
    math_stage: event.mathStage ?? null,
    submitted_answer: event.submittedAnswer ?? null,
    expected_answer: event.expectedAnswer ?? null,
    correct: event.correct ?? null,
    attempt_number: event.attemptNumber ?? null,
    response_time_ms: event.responseTimeMs ?? null,
    consequence_id: event.consequenceId ?? null,
    consequence_instance_id: event.consequenceInstanceId ?? null,
    before_state: toJson(event.before),
    after_state: toJson(event.after),
    metadata: toJson(event.metadata),
  }
}

async function ensureResearchIdentity() {
  if (!supabase || !isSupabaseConfigured) return null

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) throw sessionError
  if (session?.user) return session.user

  if (!anonymousResearchAuthEnabled) {
    return null
  }

  const { data, error } = await supabase.auth.signInAnonymously()

  if (error) throw error
  return data.user
}

export type ResearchSyncResult =
  | { status: 'synced'; eventIds: string[] }
  | { status: 'disabled'; reason: string }

export async function syncResearchEvents(
  events: ResearchEvent[],
): Promise<ResearchSyncResult> {
  if (events.length === 0) {
    return { status: 'synced', eventIds: [] }
  }

  if (!supabase || !isSupabaseConfigured) {
    return {
      status: 'disabled',
      reason: 'Supabase environment variables are not configured.',
    }
  }

  const user = await ensureResearchIdentity()

  if (!user) {
    return {
      status: 'disabled',
      reason:
        'No Supabase session is available and anonymous research auth is disabled.',
    }
  }

  const rows = events.map((event) => ({
    auth_user_id: user.id,
    ...researchEventToRow(event),
  }))

  const { error } = await supabase
    .from('research_events')
    .upsert(rows, {
      onConflict: 'auth_user_id,event_id',
      ignoreDuplicates: true,
    })

  if (error) throw error

  return {
    status: 'synced',
    eventIds: events.map((event) => event.eventId),
  }
}
