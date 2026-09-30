export const STARTING_COINS = 200
export const LEVEL_UP_COIN_REWARD = 100

export function retryCost(wrongAttempts: number) {
  if (wrongAttempts <= 0) return 0
  return Math.min(wrongAttempts * 5, 30)
}

export function xpNeededForNextLevel(level: number) {
  return 100 + Math.max(0, level - 1) * 50
}

export interface ProgressionXpState {
  level: number
  levelXp: number
  totalXp: number
  coins: number
}

export interface XpGainResult extends ProgressionXpState {
  levelsGained: number
  coinsGained: number
}

export function applyXpGain(
  state: ProgressionXpState,
  amount: number,
): XpGainResult {
  let level = Math.max(1, state.level)
  let levelXp = Math.max(0, state.levelXp)
  let remaining = Math.max(0, Math.round(amount))
  let levelsGained = 0

  while (remaining > 0) {
    const needed = xpNeededForNextLevel(level) - levelXp

    if (remaining < needed) {
      levelXp += remaining
      remaining = 0
      break
    }

    remaining -= needed
    level += 1
    levelXp = 0
    levelsGained += 1
  }

  const coinsGained = levelsGained * LEVEL_UP_COIN_REWARD

  return {
    level,
    levelXp,
    totalXp: state.totalXp + Math.max(0, Math.round(amount)),
    coins: state.coins + coinsGained,
    levelsGained,
    coinsGained,
  }
}

export function exerciseXp(wrongAttempts: number, mode: 'unlock' | 'practice') {
  if (mode === 'practice') return 0
  return wrongAttempts === 0 ? 10 : 5
}
