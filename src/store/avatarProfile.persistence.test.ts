import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultStudentAvatar } from '../avatar/avatarCatalog'

const storageKey = 'smartkid-wallet-avatar-v1'

function installStorage() {
  const entries = new Map<string, string>()
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value) },
    removeItem: (key: string) => { entries.delete(key) },
  }
  vi.stubGlobal('window', { localStorage: storage })
  return storage
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('avatar storage across reloads', () => {
  it('restores every chosen color and expression in a fresh store', async () => {
    const storage = installStorage()
    const { useAvatarProfileStore } = await import('./avatarProfile')
    const avatar = {
      ...defaultStudentAvatar,
      skinTone: '#ba7956',
      hairColor: '#c59a58',
      topColor: '#a874b7',
      bottomColor: '#5f5b73',
      shoeColor: '#9f554e',
      expression: 'thinking' as const,
    }
    useAvatarProfileStore.getState().setAvatar(avatar)
    expect(JSON.parse(storage.getItem(storageKey)!).state.avatar).toEqual(avatar)

    vi.resetModules()
    const reloaded = await import('./avatarProfile')
    expect(reloaded.useAvatarProfileStore.getState().avatar).toEqual(avatar)
    expect(reloaded.useAvatarProfileStore.getState().hasCreatedAvatar).toBe(true)
  })

  it.each([true, false])('upgrades v2 without losing colors or creation flag %s', async (hasCreatedAvatar) => {
    const storage = installStorage()
    const { expression: _expression, ...legacyAvatar } = defaultStudentAvatar
    legacyAvatar.topColor = '#d6617e'
    legacyAvatar.hairColor = '#7a4038'
    storage.setItem(storageKey, JSON.stringify({
      version: 2,
      state: { avatar: legacyAvatar, hasCreatedAvatar },
    }))
    const { useAvatarProfileStore, AVATAR_PROFILE_STORAGE_VERSION } = await import('./avatarProfile')
    expect(useAvatarProfileStore.getState().avatar).toEqual({ ...legacyAvatar, expression: 'happy' })
    expect(useAvatarProfileStore.getState().hasCreatedAvatar).toBe(hasCreatedAvatar)
    expect(JSON.parse(storage.getItem(storageKey)!).version).toBe(AVATAR_PROFILE_STORAGE_VERSION)
  })
})
