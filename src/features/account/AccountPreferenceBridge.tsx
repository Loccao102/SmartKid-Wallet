import { useEffect, useRef } from 'react'
import { normalizeAvatarConfig } from '../../avatar/avatarCatalog'
import {
  fetchAccountPreferences,
  parsePersistedAudioSettings,
  saveAccountPreferences,
} from '../../lib/accountRemote'
import { useAudioSettingsStore } from '../../store/audioSettings'
import { useAvatarProfileStore } from '../../store/avatarProfile'
import { getSignedInStudent } from '../../store/studentAccount'

const PREFERENCE_SYNC_DELAY_MS = 1500

type PreferenceSlice = 'avatar' | 'audio'

function currentAudioValues() {
  const {
    setMuted,
    setMusicEnabled,
    setAmbientEnabled,
    setSfxEnabled,
    setMasterVolume,
    setMusicVolume,
    setAmbientVolume,
    setSfxVolume,
    applyRemoteSettings,
    ...values
  } = useAudioSettingsStore.getState()
  void setMuted
  void setMusicEnabled
  void setAmbientEnabled
  void setSfxEnabled
  void setMasterVolume
  void setMusicVolume
  void setAmbientVolume
  void setSfxVolume
  void applyRemoteSettings
  return values
}

/**
 * Two-way sync between the signed-in student's local Zustand stores and the
 * Supabase `user_preferences` row (avatar + audio).
 *
 * Rules:
 * - Runs only for a permanent (non-anonymous) student account; anonymous and
 *   guest sessions stay purely local.
 * - On sign-in, remote values are pulled once and applied locally.
 * - Local edits are pushed with a small debounce; each slice is upserted
 *   independently so devices never clobber each other's data.
 * - Network failures must never block gameplay UI.
 */
export function AccountPreferenceBridge() {
  const hydratedRef = useRef(false)
  const pendingSlicesRef = useRef<Set<PreferenceSlice>>(new Set())
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let disposed = false

    const flush = async () => {
      timerRef.current = null
      const slices = new Set(pendingSlicesRef.current)
      pendingSlicesRef.current.clear()
      if (slices.size === 0 || !getSignedInStudent()) return

      try {
        await saveAccountPreferences({
          avatar: slices.has('avatar')
            ? JSON.parse(JSON.stringify(useAvatarProfileStore.getState().avatar))
            : null,
          audio: slices.has('audio')
            ? JSON.parse(JSON.stringify(currentAudioValues()))
            : null,
        })
      } catch {
        // Preferences keep living locally; next edit retries the push.
      }
    }

    const schedulePush = (slice: PreferenceSlice) => {
      if (!hydratedRef.current || !getSignedInStudent()) return
      pendingSlicesRef.current.add(slice)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => void flush(), PREFERENCE_SYNC_DELAY_MS)
    }

    const hydrate = async () => {
      if (!getSignedInStudent()) return
      try {
        const remote = await fetchAccountPreferences()
        if (disposed) return
        if (remote) {
          if (remote.avatar) {
            useAvatarProfileStore
              .getState()
              .setAvatar(normalizeAvatarConfig(remote.avatar))
          }
          if (remote.audio) {
            const audio = parsePersistedAudioSettings(remote.audio)
            if (audio) useAudioSettingsStore.getState().applyRemoteSettings(audio)
          }
        }
      } catch {
        // Remote unavailable → local values remain authoritative this session.
      } finally {
        if (!disposed) hydratedRef.current = true
      }
    }

    void hydrate()

    const unsubscribeAvatar = useAvatarProfileStore.subscribe((state, previous) => {
      if (state.avatar !== previous.avatar) schedulePush('avatar')
    })

    const unsubscribeAudio = useAudioSettingsStore.subscribe((state, previous) => {
      if (
        state.muted !== previous.muted ||
        state.musicEnabled !== previous.musicEnabled ||
        state.ambientEnabled !== previous.ambientEnabled ||
        state.sfxEnabled !== previous.sfxEnabled ||
        state.masterVolume !== previous.masterVolume ||
        state.musicVolume !== previous.musicVolume ||
        state.ambientVolume !== previous.ambientVolume ||
        state.sfxVolume !== previous.sfxVolume
      ) {
        schedulePush('audio')
      }
    })

    return () => {
      disposed = true
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      unsubscribeAvatar()
      unsubscribeAudio()
    }
  }, [])

  return null
}
