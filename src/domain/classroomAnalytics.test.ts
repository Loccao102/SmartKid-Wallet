import { describe, expect, it } from 'vitest'
import {
  bestAttemptsForAssignment,
  rankClassAssignment,
} from './classroomAnalytics'
import {
  createWeeklyChallenge,
  createWeeklyMathExercises,
  createWeeklyScenarioRounds,
} from './weeklyChallenge'

describe('classroom assignment analytics', () => {
  it('keeps the best score, then fastest time, per student', () => {
    const best = bestAttemptsForAssignment('a1', [
      {
        assignment_id: 'a1',
        student_id: 's1',
        score: 80,
        elapsed_ms: 50_000,
      },
      {
        assignment_id: 'a1',
        student_id: 's1',
        score: 90,
        elapsed_ms: 80_000,
      },
      {
        assignment_id: 'a1',
        student_id: 's1',
        score: 90,
        elapsed_ms: 60_000,
      },
    ])

    expect(best.get('s1')).toMatchObject({
      score: 90,
      elapsed_ms: 60_000,
    })
  })

  it('ranks submitted students by score then time and leaves pending students last', () => {
    const rows = rankClassAssignment(
      'a1',
      [
        { auth_user_id: 's1', display_name: 'An' },
        { auth_user_id: 's2', display_name: 'Bình' },
        { auth_user_id: 's3', display_name: 'Chi' },
      ],
      [
        {
          assignment_id: 'a1',
          student_id: 's1',
          score: 90,
          elapsed_ms: 70_000,
        },
        {
          assignment_id: 'a1',
          student_id: 's2',
          score: 90,
          elapsed_ms: 55_000,
        },
      ],
    )

    expect(rows.map((row) => row.student.auth_user_id)).toEqual([
      's2',
      's1',
      's3',
    ])
  })
})

describe('teacher weekly assignment fairness', () => {
  it('gives every student the exact same questions and scenario order for one assignment', () => {
    const challenge = {
      ...createWeeklyChallenge(new Date('2026-09-28T00:00:00+07:00')),
      id: 'class-assignment-test',
    }
    const sharedKey = 'class-shared:assignment-123'

    expect(
      createWeeklyMathExercises(challenge, sharedKey),
    ).toEqual(createWeeklyMathExercises(challenge, sharedKey))

    expect(
      createWeeklyScenarioRounds(challenge, sharedKey),
    ).toEqual(createWeeklyScenarioRounds(challenge, sharedKey))
  })
})
