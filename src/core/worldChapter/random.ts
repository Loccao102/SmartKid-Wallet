export function createSeededRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function pickSeededInt(
  rng: () => number,
  min: number,
  max: number,
  step = 1,
) {
  const count = Math.floor((max - min) / step) + 1
  return min + Math.floor(rng() * count) * step
}

export function seededShuffle<T>(items: readonly T[], rng: () => number) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}
