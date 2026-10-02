import { describe, expect, it } from 'vitest'
import { defaultStudentAvatar } from '../avatar/avatarCatalog'
import {
  AVATAR_PROFILE_STORAGE_VERSION,
  mergeAvatarProfile,
  migrateAvatarProfile,
} from './avatarProfile'

describe('avatar profile persistence', () => {
  it('migrates an untouched v1 profile into first-time creation state', () => {
    const migrated = migrateAvatarProfile({ avatar: defaultStudentAvatar }, 1)

    expect(migrated.avatar).toEqual(defaultStudentAvatar)
    expect(migrated.hasCreatedAvatar).toBe(false)
  })

  it('keeps a customized v1 avatar and marks it as created', () => {
    const migrated = migrateAvatarProfile({
      avatar: { ...defaultStudentAvatar, hairStyle: 'curly' },
    }, 1)

    expect(migrated.avatar.hairStyle).toBe('curly')
    expect(migrated.hasCreatedAvatar).toBe(true)
  })

  it('recovers invalid v2 options without breaking the renderer', () => {
    const migrated = migrateAvatarProfile({
      avatar: { ...defaultStudentAvatar, hairStyle: 'unknown' },
      hasCreatedAvatar: true,
    }, AVATAR_PROFILE_STORAGE_VERSION)

    expect(migrated.avatar).toEqual(defaultStudentAvatar)
    expect(migrated.hasCreatedAvatar).toBe(true)
  })

  it('normalizes malformed payloads even when storage is already on v2', () => {
    const current = {
      avatar: defaultStudentAvatar,
      hasCreatedAvatar: false,
      setAvatar: () => undefined,
      patchAvatar: () => undefined,
      markAvatarCreated: () => undefined,
      resetAvatar: () => undefined,
    }
    const merged = mergeAvatarProfile({
      avatar: { ...defaultStudentAvatar, topColor: 'not-a-color' },
      hasCreatedAvatar: true,
    }, current)

    expect(merged.avatar).toEqual(defaultStudentAvatar)
    expect(merged.hasCreatedAvatar).toBe(true)
  })

  it('infers creation for a legacy-shaped v2 payload without the marker', () => {
    const current = {
      avatar: defaultStudentAvatar,
      hasCreatedAvatar: false,
      setAvatar: () => undefined,
      patchAvatar: () => undefined,
      markAvatarCreated: () => undefined,
      resetAvatar: () => undefined,
    }
    const merged = mergeAvatarProfile({
      avatar: { ...defaultStudentAvatar, hairStyle: 'curly' },
    }, current)

    expect(merged.hasCreatedAvatar).toBe(true)
  })
})
