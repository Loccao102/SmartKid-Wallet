import type { StallId } from '../domain/types'

export interface Position {
  x: number
  y: number
}
export const spawnPosition: Position = { x: 400, y: 270 }
export const stallLayout: Array<
  Position & { id: StallId; name: string; width: number; height: number }
> = [
  {
    id: 'produce',
    name: 'RAU CỦ & HOA QUẢ',
    x: 190,
    y: 150,
    width: 240,
    height: 110,
  },
  { id: 'food', name: 'THỰC PHẨM', x: 610, y: 150, width: 240, height: 110 },
  { id: 'drinks', name: 'ĐỒ UỐNG', x: 190, y: 395, width: 240, height: 110 },
  { id: 'supplies', name: 'ĐỒ DÙNG', x: 610, y: 395, width: 240, height: 110 },
  {
    id: 'promotion',
    name: 'KHUYẾN MÃI',
    x: 400,
    y: 555,
    width: 270,
    height: 96,
  },
]

// Spatial geometry only. Unlocks, exercises and purchases remain in React/domain.
export function canWalk({ x, y }: Position): boolean {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 40 &&
    x <= 760 &&
    y >= 85 &&
    y <= 675 &&
    !stallLayout.some(
      (stall) =>
        Math.abs(x - stall.x) < stall.width / 2 + 20 &&
        Math.abs(y - stall.y) < stall.height / 2 + 20,
    )
  )
}

export function clearSegment(from: Position, to: Position): boolean {
  const steps = Math.max(
    1,
    Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 5),
  )
  for (let i = 0; i <= steps; i++) {
    if (
      !canWalk({
        x: from.x + ((to.x - from.x) * i) / steps,
        y: from.y + ((to.y - from.y) * i) / steps,
      })
    )
      return false
  }
  return true
}

export function stallEntrance(id: StallId): Position {
  const stall = stallLayout.find((item) => item.id === id)!
  return { x: stall.x, y: stall.y + stall.height / 2 + 36 }
}

// A small deterministic navigation grid; no physics or new gameplay dependency.
const nodes: Position[] = []
for (let y = 100; y <= 660; y += 20) {
  for (let x = 40; x <= 760; x += 20)
    if (canWalk({ x, y })) nodes.push({ x, y })
}
const key = (point: Position) => `${point.x},${point.y}`
const nodeMap = new Map(nodes.map((point) => [key(point), point]))
const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y)

export function findWalkingPath(from: Position, to: Position): Position[] {
  if (!canWalk(from) || !canWalk(to)) return []
  if (clearSegment(from, to)) return [to]
  const closestVisible = (point: Position) =>
    [...nodes]
      .sort((a, b) => distance(a, point) - distance(b, point))
      .find((node) => clearSegment(point, node))
  const start = closestVisible(from)
  const end = closestVisible(to)
  if (!start || !end) return []
  const queue = [start]
  const previous = new Map<string, Position | null>([[key(start), null]])
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]
    if (key(current) === key(end)) {
      const route = [to]
      let cursor: Position | null = current
      while (cursor) {
        route.unshift(cursor)
        cursor = previous.get(key(cursor)) ?? null
      }
      // Remove unnecessary grid turns without cutting through a counter.
      const result: Position[] = []
      let anchor = from
      while (route.length) {
        let furthest = route.length - 1
        while (furthest > 0 && !clearSegment(anchor, route[furthest]))
          furthest--
        anchor = route[furthest]
        result.push(anchor)
        route.splice(0, furthest + 1)
      }
      return result
    }
    for (const [dx, dy] of [
      [20, 0],
      [-20, 0],
      [0, 20],
      [0, -20],
    ]) {
      const next = nodeMap.get(key({ x: current.x + dx, y: current.y + dy }))
      if (next && !previous.has(key(next)) && clearSegment(current, next)) {
        previous.set(key(next), current)
        queue.push(next)
      }
    }
  }
  return []
}

export function movePlayer(
  position: Position,
  direction: Position,
  delta: number,
): Position {
  const length = Math.hypot(direction.x, direction.y)
  if (!length) return position
  // Cap long background frames so they cannot tunnel through counters.
  const step = (220 * Math.min(Math.max(delta, 0), 40)) / 1000
  const result = { ...position }
  const horizontal = {
    x: result.x + (direction.x / length) * step,
    y: result.y,
  }
  if (canWalk(horizontal)) result.x = horizontal.x
  const vertical = { x: result.x, y: result.y + (direction.y / length) * step }
  if (canWalk(vertical)) result.y = vertical.y
  return result
}
