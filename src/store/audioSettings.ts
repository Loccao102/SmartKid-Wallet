import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const AUDIO_SETTINGS_STORAGE_VERSION = 1

interface AudioSettingsState {
  muted: boolean
  musicEnabled: boolean
  ambientEnabled: boolean
  sfxEnabled: boolean
  masterVolume: number
  musicVolume: number
  ambientVolume: number
  sfxVolume: number
  setMuted: (muted: boolean) => void
  setMusicEnabled: (enabled: boolean) => void
  setAmbientEnabled: (enabled: boolean) => void
  setSfxEnabled: (enabled: boolean) => void
  setMasterVolume: (volume: number) => void
  setMusicVolume: (volume: number) => void
  setAmbientVolume: (volume: number) => void
  setSfxVolume: (volume: number) => void
  applyRemoteSettings: (settings: Partial<AudioSettingsState>) => void
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))

export const useAudioSettingsStore = create<AudioSettingsState>()(
  persist(
    (set) => ({
      muted: false,
      musicEnabled: true,
      ambientEnabled: true,
      sfxEnabled: true,
      masterVolume: 0.7,
      musicVolume: 0.4,
      ambientVolume: 0.3,
      sfxVolume: 0.75,
      setMuted: (muted) => set({ muted }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setAmbientEnabled: (ambientEnabled) => set({ ambientEnabled }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
      setMasterVolume: (masterVolume) => set({ masterVolume: clamp(masterVolume) }),
      setMusicVolume: (musicVolume) => set({ musicVolume: clamp(musicVolume) }),
      setAmbientVolume: (ambientVolume) => set({ ambientVolume: clamp(ambientVolume) }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume: clamp(sfxVolume) }),
      applyRemoteSettings: (settings) =>
        set((state) => ({
          muted: typeof settings.muted === 'boolean' ? settings.muted : state.muted,
          musicEnabled:
            typeof settings.musicEnabled === 'boolean'
              ? settings.musicEnabled
              : state.musicEnabled,
          ambientEnabled:
            typeof settings.ambientEnabled === 'boolean'
              ? settings.ambientEnabled
              : state.ambientEnabled,
          sfxEnabled:
            typeof settings.sfxEnabled === 'boolean'
              ? settings.sfxEnabled
              : state.sfxEnabled,
          masterVolume:
            typeof settings.masterVolume === 'number'
              ? clamp(settings.masterVolume)
              : state.masterVolume,
          musicVolume:
            typeof settings.musicVolume === 'number'
              ? clamp(settings.musicVolume)
              : state.musicVolume,
          ambientVolume:
            typeof settings.ambientVolume === 'number'
              ? clamp(settings.ambientVolume)
              : state.ambientVolume,
          sfxVolume:
            typeof settings.sfxVolume === 'number'
              ? clamp(settings.sfxVolume)
              : state.sfxVolume,
        })),
    }),
    {
      name: 'smartkid-wallet-audio-v1',
      version: AUDIO_SETTINGS_STORAGE_VERSION,
    },
  ),
)
