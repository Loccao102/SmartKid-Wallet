import type { WeeklyChallengeDefinition, WeeklyChallengeRunScore } from '../domain/weeklyChallenge'
import {
  anonymousResearchAuthEnabled,
  isSupabaseConfigured,
  supabase,
} from './supabase'

export interface WeeklyLeaderboardEntry {
  rank: number
  playerCode: string
  bestScore: number
  bestStars: number
  bestElapsedMs: number
  bestFirstTryCorrect: number
  attempts: number
  updatedAt: string
}

async function ensureWeeklyIdentity() {
  if (!supabase || !isSupabaseConfigured) return null

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) throw sessionError
  if (session?.user) return session.user

  if (!anonymousResearchAuthEnabled) return null

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}

export async function submitWeeklyChallengeAttempt({
  challenge,
  score,
  elapsedMs,
  firstTryCorrect,
  totalMathAttempts,
}: {
  challenge: WeeklyChallengeDefinition
  score: WeeklyChallengeRunScore
  elapsedMs: number
  firstTryCorrect: number
  totalMathAttempts: number
}) {
  if (!supabase || !isSupabaseConfigured) {
    return { status: 'disabled' as const }
  }

  const user = await ensureWeeklyIdentity()
  if (!user) return { status: 'disabled' as const }

  const { error } = await supabase.from('weekly_challenge_attempts').insert({
    auth_user_id: user.id,
    challenge_id: challenge.id,
    challenge_version: challenge.version,
    week_key: challenge.weekKey,
    score: score.total,
    stars: score.stars,
    elapsed_ms: Math.max(0, Math.round(elapsedMs)),
    first_try_correct: firstTryCorrect,
    total_questions: challenge.mathFamilyIds.length,
    math_attempts: totalMathAttempts,
    decision_quality: score.decisionQuality,
  })

  if (error) throw error
  return { status: 'submitted' as const }
}

export async function fetchWeeklyLeaderboard(
  challengeId: string,
  limit = 30,
): Promise<WeeklyLeaderboardEntry[]> {
  if (!supabase || !isSupabaseConfigured) return []

  const user = await ensureWeeklyIdentity()
  if (!user) return []

  const { data, error } = await supabase
    .from('weekly_challenge_leaderboard')
    .select(
      'player_code,best_score,best_stars,best_elapsed_ms,best_first_try_correct,attempts,updated_at',
    )
    .eq('challenge_id', challengeId)
    .order('best_score', { ascending: false })
    .order('best_elapsed_ms', { ascending: true })
    .order('updated_at', { ascending: true })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row, index) => ({
    rank: index + 1,
    playerCode: row.player_code,
    bestScore: Number(row.best_score),
    bestStars: row.best_stars,
    bestElapsedMs: row.best_elapsed_ms,
    bestFirstTryCorrect: row.best_first_try_correct,
    attempts: row.attempts,
    updatedAt: row.updated_at,
  }))
}
