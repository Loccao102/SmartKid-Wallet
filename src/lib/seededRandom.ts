export function hashSeed(input: string) {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function createSeed(parts: Array<string | number>) {
  return hashSeed(parts.join('|'))
}

export function createSeededRandom(seed: number) {
  let state = seed >>> 0

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function pickOne<T>(items: readonly T[], random: () => number): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty list')
  }

  return items[Math.floor(random() * items.length)]
}

export function pickSteppedNumber(
  min: number,
  max: number,
  step: number,
  random: () => number,
) {
  if (step <= 0 || max < min) {
    throw new Error('Invalid numeric range')
  }

  const steps = Math.floor((max - min) / step)
  return min + Math.floor(random() * (steps + 1)) * step
}
