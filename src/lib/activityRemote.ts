import type { Json, Tables } from '../types/supabase'
import { fetchCurrentStudentAccount } from './classroomRemote'
import { isSupabaseConfigured, supabase } from './supabase'

export type StudentActivitySubmissionRow =
  Tables<'student_activity_submissions'>

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình.')
  }
  return supabase
}

export async function submitStudentActivity(input: {
  activityKind: 'class_assignment' | 'shopping_mission' | 'work_shift'
  contentId: string
  assignmentId?: string
  score: number
  stars: number
  elapsedMs?: number
  criteria: Json
  cart?: Json
  result?: Json
}) {
  const client = requireSupabase()
  const account = await fetchCurrentStudentAccount()
  if (!account) return { status: 'skipped' as const }

  const { count, error: countError } = await client
    .from('student_activity_submissions')
    .select('submission_id', { count: 'exact', head: true })
    .eq('student_id', account.student.auth_user_id)
    .eq('activity_kind', input.activityKind)
    .eq('content_id', input.contentId)

  if (countError) throw countError

  const { data, error } = await client
    .from('student_activity_submissions')
    .insert({
      student_id: account.student.auth_user_id,
      classroom_id: account.student.classroom_id,
      activity_kind: input.activityKind,
      content_id: input.contentId,
      assignment_id: input.assignmentId ?? null,
      attempt_number: (count ?? 0) + 1,
      score: Math.max(0, Math.min(100, input.score)),
      stars: Math.max(1, Math.min(5, Math.round(input.stars))),
      elapsed_ms:
        input.elapsedMs === undefined
          ? null
          : Math.max(0, Math.round(input.elapsedMs)),
      criteria: input.criteria,
      cart: input.cart ?? null,
      result: input.result ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return { status: 'submitted' as const, submission: data }
}
