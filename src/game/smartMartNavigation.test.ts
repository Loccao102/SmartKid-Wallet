import { describe, expect, it } from 'vitest'
import {
  canWalk,
  clearSegment,
  findWalkingPath,
  movePlayer,
  spawnPosition,
  stallEntrance,
  stallLayout,
} from './smartMartNavigation'

describe('SmartMart spatial navigation', () => {
  it('reaches every stall from the entrance and every other stall without crossing a counter', () => {
    const entrances = stallLayout.map((stall) => stallEntrance(stall.id))
    for (const from of [spawnPosition, ...entrances]) {
      for (const to of entrances) {
        const path = findWalkingPath(from, to)
        expect(path.length).toBeGreaterThan(0)
        expect(path.at(-1)).toEqual(to)
        let previous = from
        for (const waypoint of path) {
          expect(clearSegment(previous, waypoint)).toBe(true)
          previous = waypoint
        }
      }
    }
  })

  it('refuses targets inside counters or outside the map', () => {
    for (const point of [
      ...stallLayout,
      { x: -1, y: 200 },
      { x: 400, y: 800 },
      { x: NaN, y: 200 },
    ]) {
      expect(canWalk(point)).toBe(false)
      expect(findWalkingPath(spawnPosition, point)).toEqual([])
    }
  })

  it('can follow every planned route frame by frame without getting stuck at corners', () => {
    const entrances = stallLayout.map((stall) => stallEntrance(stall.id))
    for (const start of [spawnPosition, ...entrances])
      for (const goal of entrances) {
        const route = findWalkingPath(start, goal)
        let point = start
        for (let frame = 0; route.length && frame < 2000; frame++) {
          const next = route[0]
          const direction = { x: next.x - point.x, y: next.y - point.y }
          if (Math.hypot(direction.x, direction.y) <= 220 * 0.016) {
            point = next
            route.shift()
          } else point = movePlayer(point, direction, 16)
          expect(canWalk(point)).toBe(true)
        }
        expect(point).toEqual(goal)
      }
  })

  it('keeps keyboard movement out of counters and bounds, even after a long background frame', () => {
    let point = stallEntrance('produce')
    for (let i = 0; i < 100; i++)
      point = movePlayer(point, { x: 0, y: -1 }, 5000)
    expect(point.y).toBeGreaterThanOrEqual(225)
    expect(canWalk(point)).toBe(true)
    point = { x: 45, y: 270 }
    for (let i = 0; i < 100; i++) point = movePlayer(point, { x: -1, y: 0 }, 16)
    expect(point.x).toBeGreaterThanOrEqual(40)
  })

  it('normalizes diagonal movement and slides along a blocked counter edge', () => {
    const straight = movePlayer(spawnPosition, { x: 1, y: 0 }, 16)
    const diagonal = movePlayer(spawnPosition, { x: 1, y: 1 }, 16)
    expect(
      Math.hypot(diagonal.x - spawnPosition.x, diagonal.y - spawnPosition.y),
    ).toBeCloseTo(straight.x - spawnPosition.x)
    const slide = movePlayer({ x: 190, y: 225 }, { x: 1, y: -1 }, 16)
    expect(slide.x).toBeGreaterThan(190)
    expect(slide.y).toBe(225)
  })
})
