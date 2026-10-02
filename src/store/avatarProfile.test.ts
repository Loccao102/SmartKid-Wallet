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

  it('recovers invalid options without breaking the renderer', () => {
    const migrated = migrateAvatarProfile({
      avatar: { ...defaultStudentAvatar, hairStyle: 'unknown' },
      hasCreatedAvatar: true,
    }, AVATAR_PROFILE_STORAGE_VERSION)

    expect(migrated.avatar).toEqual(defaultStudentAvatar)
    expect(migrated.hasCreatedAvatar).toBe(true)
  })

  it('normalizes malformed payloads even on the current storage version', () => {
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

  it('also infers creation when upgrading a v2 payload without the marker', () => {
    const migrated = migrateAvatarProfile({
      avatar: { ...defaultStudentAvatar, expression: undefined, hairStyle: 'curly' },
    }, 2)
    expect(migrated.hasCreatedAvatar).toBe(true)
    expect(migrated.avatar.expression).toBe('happy')
  })

  it('replaces an unknown expression while retaining valid saved colors', () => {
    const migrated = migrateAvatarProfile({
      avatar: { ...defaultStudentAvatar, expression: 'unknown', hairColor: '#c59a58' },
      hasCreatedAvatar: true,
    }, AVATAR_PROFILE_STORAGE_VERSION)
    expect(migrated.avatar.expression).toBe('happy')
    expect(migrated.avatar.hairColor).toBe('#c59a58')
  })
})
