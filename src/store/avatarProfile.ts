import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  defaultStudentAvatar,
  type AvatarConfig,
} from '../avatar/avatarCatalog'

interface AvatarProfileState {
  avatar: AvatarConfig
  setAvatar: (avatar: AvatarConfig) => void
  patchAvatar: (patch: Partial<AvatarConfig>) => void
  resetAvatar: () => void
}

export const useAvatarProfileStore = create<AvatarProfileState>()(
  persist(
    (set) => ({
      avatar: defaultStudentAvatar,
      setAvatar: (avatar) => set({ avatar }),
      patchAvatar: (patch) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            ...patch,
          },
        })),
      resetAvatar: () => set({ avatar: defaultStudentAvatar }),
    }),
    {
      name: 'smartkid-wallet-avatar-v1',
      version: 1,
    },
  ),
)
