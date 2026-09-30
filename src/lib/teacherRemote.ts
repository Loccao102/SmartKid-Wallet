import type { User } from '@supabase/supabase-js'
import type { WeeklyChallengeDefinition } from '../domain/weeklyChallenge'
import { createWeeklyChallenge } from '../domain/weeklyChallenge'
import type { Json, Tables } from '../types/supabase'
import { isSupabaseConfigured, supabase } from './supabase'

export type TeacherProfileRow = Tables<'teacher_profiles'>
export type ClassroomRow = Tables<'classrooms'>
export type StudentProfileRow = Tables<'student_profiles'>
export type WeeklyAssignmentRow = Tables<'weekly_assignments'>
export type AssignmentAttemptRow = Tables<'assignment_attempts'>
export type StudentLearningSnapshotRow = Tables<'student_learning_snapshots'>
export type ResearchEventRow = Tables<'research_events'>

export interface TeacherWorkspace {
  teacher: TeacherProfileRow
  classrooms: ClassroomRow[]
  students: StudentProfileRow[]
  assignments: WeeklyAssignmentRow[]
  attempts: AssignmentAttemptRow[]
  snapshots: StudentLearningSnapshotRow[]
}

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình.')
  }
  return supabase
}

function generateJoinCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint32Array(7)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('')
}

export async function getTeacherUser(): Promise<User | null> {
  const client = requireSupabase()
  const {
    data: { session },
    error,
  } = await client.auth.getSession()
  if (error) throw error

  const user = session?.user ?? null
  if (!user || user.is_anonymous) return null
  if (user.app_metadata?.app_role === 'student') return null
  return user
}

async function signOutAnonymousSession() {
  const client = requireSupabase()
  const {
    data: { session },
  } = await client.auth.getSession()
  if (session?.user?.is_anonymous) {
    await client.auth.signOut()
  }
}

export async function signInTeacher(email: string, password: string) {
  const client = requireSupabase()
  await signOutAnonymousSession()

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  if (data.user.app_metadata?.app_role === 'student') {
    await client.auth.signOut()
    throw new Error('Đây là tài khoản học sinh, không phải tài khoản giáo viên.')
  }

  await ensureTeacherProfile(
    data.user,
    String(data.user.user_metadata?.display_name ?? email.split('@')[0]),
    String(data.user.user_metadata?.school_name ?? ''),
  )
  return data.user
}

export async function signUpTeacher(input: {
  email: string
  password: string
  displayName: string
  schoolName?: string
}) {
  const client = requireSupabase()
  await signOutAnonymousSession()

  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        display_name: input.displayName.trim(),
        school_name: input.schoolName?.trim() || null,
      },
    },
  })
  if (error) throw error

  if (data.user && data.session) {
    await ensureTeacherProfile(
      data.user,
      input.displayName,
      input.schoolName ?? '',
    )
  }

  return {
    user: data.user,
    session: data.session,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  }
}

export async function ensureTeacherProfile(
  user: User,
  displayName?: string,
  schoolName?: string,
) {
  const client = requireSupabase()
  const { data: existing, error: selectError } = await client
    .from('teacher_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing) return existing

  const { data, error } = await client
    .from('teacher_profiles')
    .insert({
      auth_user_id: user.id,
      display_name:
        displayName?.trim() ||
        String(user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Giáo viên'),
      school_name:
        schoolName?.trim() ||
        String(user.user_metadata?.school_name ?? '') ||
        null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function signOutTeacher() {
  const client = requireSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function fetchTeacherWorkspace(): Promise<TeacherWorkspace> {
  const client = requireSupabase()
  const user = await getTeacherUser()
  if (!user) throw new Error('Cần đăng nhập bằng tài khoản giáo viên.')

  const teacher = await ensureTeacherProfile(user)

  const { data: classrooms, error: classroomsError } = await client
    .from('classrooms')
    .select('*')
    .is('archived_at', null)
    .order('created_at', { ascending: true })
  if (classroomsError) throw classroomsError

  const classIds = (classrooms ?? []).map((item) => item.classroom_id)
  if (classIds.length === 0) {
    return {
      teacher,
      classrooms: [],
      students: [],
      assignments: [],
      attempts: [],
      snapshots: [],
    }
  }

  const [studentsResult, assignmentsResult] = await Promise.all([
    client
      .from('student_profiles')
      .select('*')
      .in('classroom_id', classIds)
      .order('display_name', { ascending: true }),
    client
      .from('weekly_assignments')
      .select('*')
      .in('classroom_id', classIds)
      .order('week_key', { ascending: false }),
  ])

  if (studentsResult.error) throw studentsResult.error
  if (assignmentsResult.error) throw assignmentsResult.error

  const students = studentsResult.data ?? []
  const assignments = assignmentsResult.data ?? []
  const assignmentIds = assignments.map((item) => item.assignment_id)
  const studentIds = students.map((item) => item.auth_user_id)

  const [attemptsResult, snapshotsResult] = await Promise.all([
    assignmentIds.length
      ? client
          .from('assignment_attempts')
          .select('*')
          .in('assignment_id', assignmentIds)
          .order('completed_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    studentIds.length
      ? client
          .from('student_learning_snapshots')
          .select('*')
          .in('auth_user_id', studentIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (attemptsResult.error) throw attemptsResult.error
  if (snapshotsResult.error) throw snapshotsResult.error

  return {
    teacher,
    classrooms: classrooms ?? [],
    students,
    assignments,
    attempts: attemptsResult.data ?? [],
    snapshots: snapshotsResult.data ?? [],
  }
}

export async function createClassroom(input: {
  name: string
  gradeLevel?: number
  academicYear: string
}) {
  const client = requireSupabase()
  const user = await getTeacherUser()
  if (!user) throw new Error('Cần đăng nhập bằng tài khoản giáo viên.')

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const joinCode = generateJoinCode()
    const { data, error } = await client
      .from('classrooms')
      .insert({
        teacher_id: user.id,
        name: input.name.trim(),
        grade_level: input.gradeLevel ?? null,
        academic_year: input.academicYear.trim() || '2026-2027',
        join_code: joinCode,
      })
      .select()
      .single()

    if (!error) return data
    if (error.code !== '23505') throw error
  }

  throw new Error('Không tạo được mã lớp duy nhất. Hãy thử lại.')
}

export async function updateClassroom(
  classroomId: string,
  patch: Partial<Pick<ClassroomRow, 'name' | 'grade_level' | 'academic_year'>>,
) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('classrooms')
    .update(patch)
    .eq('classroom_id', classroomId)
    .select()
    .single()
  if (error) throw error
  return data
}

async function invokeStudentAdmin(body: Record<string, unknown>) {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('teacher-student-admin', {
    body,
  })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
  return data
}

export async function createStudentAccount(input: {
  classroomId: string
  displayName: string
  username: string
  password: string
}) {
  return invokeStudentAdmin({
    action: 'create_student',
    classroomId: input.classroomId,
    displayName: input.displayName,
    username: input.username,
    password: input.password,
  })
}

export async function resetStudentPassword(input: {
  classroomId: string
  studentId: string
  password: string
}) {
  return invokeStudentAdmin({
    action: 'reset_password',
    classroomId: input.classroomId,
    studentId: input.studentId,
    password: input.password,
  })
}

export async function setStudentActive(input: {
  classroomId: string
  studentId: string
  active: boolean
}) {
  return invokeStudentAdmin({
    action: 'set_active',
    classroomId: input.classroomId,
    studentId: input.studentId,
    active: input.active,
  })
}

export async function createTeacherAssignment(input: {
  classroomId: string
  title: string
  description?: string
  weekKey: string
  opensAt: string
  dueAt: string
  maxAttempts: number
  status: 'draft' | 'published'
  xpReward?: number
  coinReward?: number
}) {
  const client = requireSupabase()
  const user = await getTeacherUser()
  if (!user) throw new Error('Cần đăng nhập bằng tài khoản giáo viên.')

  const assignmentId = crypto.randomUUID()
  const selectedDate = new Date(input.weekKey + 'T00:00:00+07:00')
  const base = createWeeklyChallenge(selectedDate)
  const challenge: WeeklyChallengeDefinition = {
    ...base,
    id: 'class-assignment-' + assignmentId,
    title: input.title.trim(),
    subtitle: '6 bài Toán · 2 tình huống · cùng một đề cho cả lớp',
    xpReward: input.xpReward ?? base.xpReward,
    coinReward: input.coinReward ?? base.coinReward,
  }

  const { data, error } = await client
    .from('weekly_assignments')
    .insert({
      assignment_id: assignmentId,
      classroom_id: input.classroomId,
      created_by: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      week_key: input.weekKey,
      opens_at: input.opensAt,
      due_at: input.dueAt,
      status: input.status,
      challenge_version: challenge.version,
      challenge_seed: challenge.seed,
      challenge_json: challenge as unknown as Json,
      max_attempts: input.maxAttempts,
      xp_reward: challenge.xpReward,
      coin_reward: challenge.coinReward,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function setAssignmentStatus(
  assignmentId: string,
  status: 'draft' | 'published' | 'closed',
) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('weekly_assignments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('assignment_id', assignmentId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchStudentResearchEvents(
  studentId: string,
  limit = 500,
): Promise<ResearchEventRow[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('research_events')
    .select('*')
    .eq('auth_user_id', studentId)
    .order('occurred_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export function parseAssignmentChallenge(
  assignment: WeeklyAssignmentRow,
): WeeklyChallengeDefinition {
  return assignment.challenge_json as unknown as WeeklyChallengeDefinition
}
