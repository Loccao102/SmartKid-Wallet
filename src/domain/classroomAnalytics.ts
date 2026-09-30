export interface AssignmentAttemptLike {
  assignment_id: string
  student_id: string
  score: number
  elapsed_ms: number
}

export interface ClassroomStudentLike {
  auth_user_id: string
  display_name: string
}

export function bestAttemptsForAssignment<
  TAttempt extends AssignmentAttemptLike,
>(
  assignmentId: string,
  attempts: readonly TAttempt[],
) {
  const best = new Map<string, TAttempt>()

  for (const attempt of attempts) {
    if (attempt.assignment_id !== assignmentId) continue

    const current = best.get(attempt.student_id)
    if (
      !current ||
      Number(attempt.score) > Number(current.score) ||
      (Number(attempt.score) === Number(current.score) &&
        attempt.elapsed_ms < current.elapsed_ms)
    ) {
      best.set(attempt.student_id, attempt)
    }
  }

  return best
}

export function rankClassAssignment<
  TStudent extends ClassroomStudentLike,
  TAttempt extends AssignmentAttemptLike,
>(
  assignmentId: string,
  students: readonly TStudent[],
  attempts: readonly TAttempt[],
) {
  const best = bestAttemptsForAssignment(assignmentId, attempts)

  return students
    .map((student) => ({
      student,
      attempt: best.get(student.auth_user_id),
    }))
    .sort((a, b) => {
      if (!a.attempt && !b.attempt) {
        return a.student.display_name.localeCompare(b.student.display_name)
      }
      if (!a.attempt) return 1
      if (!b.attempt) return -1

      const scoreDiff = Number(b.attempt.score) - Number(a.attempt.score)
      if (scoreDiff) return scoreDiff

      const timeDiff = a.attempt.elapsed_ms - b.attempt.elapsed_ms
      if (timeDiff) return timeDiff

      return a.student.display_name.localeCompare(b.student.display_name)
    })
}
