import { useEffect } from 'react'
import { smartKidAudio } from '../../lib/audioEngine'
import { useAudioSettingsStore } from '../../store/audioSettings'

export function AudioExperience() {
  const muted = useAudioSettingsStore((state) => state.muted)
  const musicEnabled = useAudioSettingsStore((state) => state.musicEnabled)
  const ambientEnabled = useAudioSettingsStore((state) => state.ambientEnabled)
  const sfxEnabled = useAudioSettingsStore((state) => state.sfxEnabled)
  const masterVolume = useAudioSettingsStore((state) => state.masterVolume)
  const musicVolume = useAudioSettingsStore((state) => state.musicVolume)
  const ambientVolume = useAudioSettingsStore((state) => state.ambientVolume)
  const sfxVolume = useAudioSettingsStore((state) => state.sfxVolume)

  useEffect(() => {
    smartKidAudio.setMix({
      muted,
      musicEnabled,
      ambientEnabled,
      sfxEnabled,
      masterVolume,
      musicVolume,
      ambientVolume,
      sfxVolume,
    })
  }, [
    muted,
    musicEnabled,
    ambientEnabled,
    sfxEnabled,
    masterVolume,
    musicVolume,
    ambientVolume,
    sfxVolume,
  ])

  useEffect(() => {
    const start = () => {
      void smartKidAudio.start()
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }

    window.addEventListener('pointerdown', start, { once: true })
    window.addEventListener('keydown', start, { once: true })

    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
  }, [])

  return null
}
