import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  defaultStudentAvatar,
  normalizeAvatarConfig,
  type AvatarConfig,
} from '../avatar/avatarCatalog'

export const AVATAR_PROFILE_STORAGE_VERSION = 2

export interface AvatarProfileState {
  avatar: AvatarConfig
  hasCreatedAvatar: boolean
  setAvatar: (avatar: AvatarConfig) => void
  patchAvatar: (patch: Partial<AvatarConfig>) => void
  markAvatarCreated: () => void
  resetAvatar: () => void
}

export interface PersistedAvatarProfileV1 {
  avatar?: unknown
}

export interface PersistedAvatarProfileV2 {
  avatar: AvatarConfig
  hasCreatedAvatar: boolean
}

function persistedProfileSource(value: unknown) {
  return value && typeof value === 'object'
    ? value as Partial<PersistedAvatarProfileV2>
    : {}
}

/**
 * Zustand calls this during a storage upgrade. V1 did not record whether the
 * student had completed first-time creation, so a changed V1 avatar counts as
 * created while the untouched demo avatar gets the new first-run prompt.
 */
export function migrateAvatarProfile(
  persisted: unknown,
  version: number,
): PersistedAvatarProfileV2 {
  const source = persistedProfileSource(persisted)
  const avatar = normalizeAvatarConfig(source.avatar)
  const hasCreatedAvatar = version >= AVATAR_PROFILE_STORAGE_VERSION
    ? Boolean(source.hasCreatedAvatar)
    : JSON.stringify(avatar) !== JSON.stringify(defaultStudentAvatar)

  return { avatar, hasCreatedAvatar }
}

/** Normalize even same-version payloads; persisted local storage can be edited or stale. */
export function mergeAvatarProfile(
  persisted: unknown,
  current: AvatarProfileState,
): AvatarProfileState {
  const source = persistedProfileSource(persisted)
  const avatar = normalizeAvatarConfig(source.avatar)
  return {
    ...current,
    avatar,
    hasCreatedAvatar: typeof source.hasCreatedAvatar === 'boolean'
      ? source.hasCreatedAvatar
      : JSON.stringify(avatar) !== JSON.stringify(defaultStudentAvatar),
  }
}

export const useAvatarProfileStore = create<AvatarProfileState>()(
  persist(
    (set) => ({
      avatar: defaultStudentAvatar,
      hasCreatedAvatar: false,
      setAvatar: (avatar) => set({ avatar: normalizeAvatarConfig(avatar), hasCreatedAvatar: true }),
      patchAvatar: (patch) =>
        set((state) => ({
          avatar: normalizeAvatarConfig({ ...state.avatar, ...patch }),
          hasCreatedAvatar: true,
        })),
      markAvatarCreated: () => set({ hasCreatedAvatar: true }),
      resetAvatar: () => set({ avatar: defaultStudentAvatar, hasCreatedAvatar: false }),
    }),
    {
      name: 'smartkid-wallet-avatar-v1',
      version: AVATAR_PROFILE_STORAGE_VERSION,
      migrate: migrateAvatarProfile,
      merge: mergeAvatarProfile,
    },
  ),
)
