import type { User } from '@supabase/supabase-js'
import type { WeeklyChallengeDefinition, WeeklyChallengeRunScore } from '../domain/weeklyChallenge'
import type { Json, Tables } from '../types/supabase'
import { isSupabaseConfigured, supabase } from './supabase'

export type StudentProfileRow = Tables<'student_profiles'>
export type ClassroomRow = Tables<'classrooms'>
export type WeeklyAssignmentRow = Tables<'weekly_assignments'>
export type AssignmentAttemptRow = Tables<'assignment_attempts'>

export interface StudentClassroomAccount {
  user: User
  student: StudentProfileRow
  classroom: ClassroomRow | null
}

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình.')
  }
  return supabase
}

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

function studentEmail(classCode: string, username: string) {
  return (
    normalizeUsername(username) +
    '.' +
    classCode.trim().toLowerCase() +
    '@student.smartkid.local'
  )
}

async function signOutIncompatibleSession() {
  const client = requireSupabase()
  const {
    data: { session },
  } = await client.auth.getSession()

  if (!session?.user) return

  const role = session.user.app_metadata?.app_role
  if (session.user.is_anonymous || role !== 'student') {
    await client.auth.signOut()
  }
}

export async function signInStudent(input: {
  classCode: string
  username: string
  password: string
}) {
  const client = requireSupabase()
  await signOutIncompatibleSession()

  const { data, error } = await client.auth.signInWithPassword({
    email: studentEmail(input.classCode, input.username),
    password: input.password,
  })
  if (error) throw error

  if (data.user.app_metadata?.app_role !== 'student') {
    await client.auth.signOut()
    throw new Error('Tài khoản này không phải tài khoản học sinh.')
  }

  return fetchCurrentStudentAccount()
}

export async function signOutStudent() {
  const client = requireSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function fetchCurrentStudentAccount(): Promise<StudentClassroomAccount | null> {
  const client = requireSupabase()
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession()
  if (sessionError) throw sessionError

  const user = session?.user
  if (!user || user.is_anonymous || user.app_metadata?.app_role !== 'student') {
    return null
  }

  const { data: student, error: studentError } = await client
    .from('student_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (studentError) throw studentError
  if (!student || !student.active) return null

  const { data: classroom, error: classError } = await client
    .from('classrooms')
    .select('*')
    .eq('classroom_id', student.classroom_id)
    .maybeSingle()

  if (classError) throw classError

  return {
    user,
    student,
    classroom: classroom ?? null,
  }
}

export async function fetchStudentAssignments() {
  const client = requireSupabase()
  const account = await fetchCurrentStudentAccount()
  if (!account) return { account: null, assignments: [], attempts: [] }

  const [{ data: assignments, error: assignmentError }, { data: attempts, error: attemptsError }] =
    await Promise.all([
      client
        .from('weekly_assignments')
        .select('*')
        .eq('classroom_id', account.student.classroom_id)
        .in('status', ['published', 'closed'])
        .order('week_key', { ascending: false }),
      client
        .from('assignment_attempts')
        .select('*')
        .eq('student_id', account.student.auth_user_id)
        .order('completed_at', { ascending: false }),
    ])

  if (assignmentError) throw assignmentError
  if (attemptsError) throw attemptsError

  return {
    account,
    assignments: assignments ?? [],
    attempts: attempts ?? [],
  }
}

export async function submitClassAssignmentAttempt(input: {
  assignment: WeeklyAssignmentRow
  score: WeeklyChallengeRunScore
  elapsedMs: number
  firstTryCorrect: number
  totalMathAttempts: number
  payload?: Json
}) {
  const client = requireSupabase()
  const account = await fetchCurrentStudentAccount()
  if (!account) throw new Error('Cần đăng nhập tài khoản học sinh.')

  const { data, error } = await client
    .from('assignment_attempts')
    .insert({
      assignment_id: input.assignment.assignment_id,
      student_id: account.student.auth_user_id,
      score: input.score.total,
      stars: input.score.stars,
      elapsed_ms: Math.max(0, Math.round(input.elapsedMs)),
      first_try_correct: input.firstTryCorrect,
      total_questions: parseAssignmentChallenge(input.assignment).mathFamilyIds.length,
      math_attempts: input.totalMathAttempts,
      decision_quality: input.score.decisionQuality,
      payload: input.payload ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export function parseAssignmentChallenge(
  assignment: WeeklyAssignmentRow,
): WeeklyChallengeDefinition {
  return assignment.challenge_json as unknown as WeeklyChallengeDefinition
}

export async function syncStudentLearningSnapshot(input: {
  level: number
  totalXp: number
  coins: number
  mastery: Json
  completedWorldChapters: string[]
  completedMissions: string[]
  activityResults: Json
}) {
  const client = requireSupabase()
  const account = await fetchCurrentStudentAccount()
  if (!account) return { status: 'skipped' as const }

  const { error } = await client
    .from('student_learning_snapshots')
    .upsert({
      auth_user_id: account.student.auth_user_id,
      level: input.level,
      total_xp: input.totalXp,
      coins: input.coins,
      mastery: input.mastery,
      completed_world_chapters: input.completedWorldChapters,
      completed_missions: input.completedMissions,
      activity_results: input.activityResults,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
  return { status: 'synced' as const }
}
