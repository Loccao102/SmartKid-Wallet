import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    }),
    { name: 'smartkid-wallet-audio-v1' },
  ),
)
