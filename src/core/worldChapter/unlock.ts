import type { WorldMapDefinition } from '../../domain/types'

export interface WorldUnlockContext {
  level: number
  completedMissionIds: readonly string[]
  completedWorldChapterIds: readonly string[]
}

export interface WorldUnlockState {
  levelReady: boolean
  missionReady: boolean
  chapterReady: boolean
  requirementsReady: boolean
  playable: boolean
  reason: string
}

export function resolveWorldUnlockState(
  map: WorldMapDefinition,
  context: WorldUnlockContext,
): WorldUnlockState {
  const levelReady = context.level >= map.unlockLevel
  const missionReady =
    !map.prerequisiteMissionId ||
    context.completedMissionIds.includes(map.prerequisiteMissionId)
  const chapterReady =
    !map.prerequisiteMapId ||
    context.completedWorldChapterIds.includes(map.prerequisiteMapId)
  const requirementsReady = levelReady && missionReady && chapterReady
  const playable = map.status === 'available' && requirementsReady

  let reason = map.unlockHint ?? 'Chưa đủ điều kiện để mở.'

  if (playable) {
    reason = 'Đã sẵn sàng'
  } else if (!levelReady) {
    reason = 'Cần đạt Cấp ' + map.unlockLevel
  } else if (!missionReady) {
    reason = map.unlockHint ?? 'Cần hoàn thành nhiệm vụ trước.'
  } else if (!chapterReady) {
    reason = map.unlockHint ?? 'Cần hoàn thành chương trước.'
  } else if (map.status !== 'available') {
    reason = 'Đã đủ điều kiện · chương đang được phát triển'
  }

  return {
    levelReady,
    missionReady,
    chapterReady,
    requirementsReady,
    playable,
    reason,
  }
}
