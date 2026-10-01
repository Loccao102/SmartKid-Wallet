import type { User } from '@supabase/supabase-js'
import type { Tables } from '../types/supabase'
import { isSupabaseConfigured, supabase } from './supabase'

export type ParentProfileRow = Tables<'parent_profiles'>
export type ParentStudentLinkRow = Tables<'parent_student_links'>
export type StudentProfileRow = Tables<'student_profiles'>
export type StudentLearningSnapshotRow = Tables<'student_learning_snapshots'>
export type AssignmentAttemptRow = Tables<'assignment_attempts'>
export type WeeklyAssignmentRow = Tables<'weekly_assignments'>
export type TeacherReviewRow = Tables<'teacher_reviews'>
export type StudentActivitySubmissionRow =
  Tables<'student_activity_submissions'>
export type ClassroomRow = Tables<'classrooms'>

export interface ParentWorkspace {
  parent: ParentProfileRow
  link: ParentStudentLinkRow | null
  student: StudentProfileRow | null
  classroom: ClassroomRow | null
  snapshot: StudentLearningSnapshotRow | null
  assignments: WeeklyAssignmentRow[]
  attempts: AssignmentAttemptRow[]
  submissions: StudentActivitySubmissionRow[]
  reviews: TeacherReviewRow[]
}

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình.')
  }
  return supabase
}

async function signOutCurrentSession() {
  const client = requireSupabase()
  const {
    data: { session },
  } = await client.auth.getSession()
  if (session?.user) await client.auth.signOut()
}

export async function getParentUser(): Promise<User | null> {
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

export async function ensureParentProfile(
  user: User,
  displayName?: string,
) {
  const client = requireSupabase()
  const { data: existing, error: selectError } = await client
    .from('parent_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing) return existing

  const { data, error } = await client
    .from('parent_profiles')
    .insert({
      auth_user_id: user.id,
      display_name:
        displayName?.trim() ||
        String(
          user.user_metadata?.display_name ??
            user.email?.split('@')[0] ??
            'Phụ huynh',
        ),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function assertNotTeacher(user: User) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('teacher_profiles')
    .select('auth_user_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (error) throw error
  if (data) {
    await client.auth.signOut()
    throw new Error('Đây là tài khoản giáo viên, không phải tài khoản phụ huynh.')
  }
}

export async function signInParent(email: string, password: string) {
  const client = requireSupabase()
  await signOutCurrentSession()

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error

  if (data.user.app_metadata?.app_role === 'student') {
    await client.auth.signOut()
    throw new Error('Đây là tài khoản học sinh.')
  }

  await assertNotTeacher(data.user)
  await ensureParentProfile(data.user)
  return data.user
}

export async function signUpParent(input: {
  email: string
  password: string
  displayName: string
}) {
  const client = requireSupabase()
  await signOutCurrentSession()

  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        display_name: input.displayName.trim(),
        registration_role: 'parent',
      },
    },
  })
  if (error) throw error

  if (data.user && data.session) {
    await ensureParentProfile(data.user, input.displayName)
  }

  return {
    user: data.user,
    session: data.session,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  }
}

export async function redeemParentLink(input: {
  displayName: string
  linkCode: string
}) {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('parent-link', {
    body: {
      action: 'redeem',
      displayName: input.displayName,
      linkCode: input.linkCode.trim().toUpperCase(),
    },
  })

  if (error) throw error
  if (data?.error) throw new Error(String(data.error))

  await client.auth.refreshSession()
  return data
}

export async function signOutParent() {
  const client = requireSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function fetchParentWorkspace(): Promise<ParentWorkspace> {
  const client = requireSupabase()
  const user = await getParentUser()
  if (!user) throw new Error('Cần đăng nhập tài khoản phụ huynh.')

  const parent = await ensureParentProfile(user)

  const { data: link, error: linkError } = await client
    .from('parent_student_links')
    .select('*')
    .eq('parent_id', user.id)
    .maybeSingle()
  if (linkError) throw linkError

  if (!link) {
    return {
      parent,
      link: null,
      student: null,
      classroom: null,
      snapshot: null,
      assignments: [],
      attempts: [],
      submissions: [],
      reviews: [],
    }
  }

  const { data: student, error: studentError } = await client
    .from('student_profiles')
    .select('*')
    .eq('auth_user_id', link.student_id)
    .maybeSingle()
  if (studentError) throw studentError
  if (!student) {
    return {
      parent,
      link,
      student: null,
      classroom: null,
      snapshot: null,
      assignments: [],
      attempts: [],
      submissions: [],
      reviews: [],
    }
  }

  const [
    classroomResult,
    snapshotResult,
    assignmentsResult,
    attemptsResult,
    submissionsResult,
    reviewsResult,
  ] = await Promise.all([
    client
      .from('classrooms')
      .select('*')
      .eq('classroom_id', student.classroom_id)
      .maybeSingle(),
    client
      .from('student_learning_snapshots')
      .select('*')
      .eq('auth_user_id', student.auth_user_id)
      .maybeSingle(),
    client
      .from('weekly_assignments')
      .select('*')
      .eq('classroom_id', student.classroom_id)
      .in('status', ['published', 'closed'])
      .order('week_key', { ascending: false }),
    client
      .from('assignment_attempts')
      .select('*')
      .eq('student_id', student.auth_user_id)
      .order('completed_at', { ascending: false }),
    client
      .from('student_activity_submissions')
      .select('*')
      .eq('student_id', student.auth_user_id)
      .order('created_at', { ascending: false }),
    client
      .from('teacher_reviews')
      .select('*')
      .eq('student_id', student.auth_user_id)
      .order('created_at', { ascending: false }),
  ])

  if (classroomResult.error) throw classroomResult.error
  if (snapshotResult.error) throw snapshotResult.error
  if (assignmentsResult.error) throw assignmentsResult.error
  if (attemptsResult.error) throw attemptsResult.error
  if (submissionsResult.error) throw submissionsResult.error
  if (reviewsResult.error) throw reviewsResult.error

  return {
    parent,
    link,
    student,
    classroom: classroomResult.data ?? null,
    snapshot: snapshotResult.data ?? null,
    assignments: assignmentsResult.data ?? [],
    attempts: attemptsResult.data ?? [],
    submissions: submissionsResult.data ?? [],
    reviews: reviewsResult.data ?? [],
  }
}
