import type { Json } from '../types/supabase'
import { isSupabaseConfigured, supabase } from './supabase'

export interface PersistedAudioSettings {
  muted: boolean
  musicEnabled: boolean
  ambientEnabled: boolean
  sfxEnabled: boolean
  masterVolume: number
  musicVolume: number
  ambientVolume: number
  sfxVolume: number
}

const AUDIO_BOOLEAN_KEYS = [
  'muted',
  'musicEnabled',
  'ambientEnabled',
  'sfxEnabled',
] as const
const AUDIO_VOLUME_KEYS = [
  'masterVolume',
  'musicVolume',
  'ambientVolume',
  'sfxVolume',
] as const

/**
 * Audio payloads come from another device/browser, so every field is
 * re-validated before touching the local store. Returns null when nothing in
 * the payload is trustworthy.
 */
export function parsePersistedAudioSettings(value: unknown): PersistedAudioSettings | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>

  let changed = false
  const settings: PersistedAudioSettings = {
    muted: false,
    musicEnabled: true,
    ambientEnabled: true,
    sfxEnabled: true,
    masterVolume: 0.7,
    musicVolume: 0.4,
    ambientVolume: 0.3,
    sfxVolume: 0.75,
  }

  for (const key of AUDIO_BOOLEAN_KEYS) {
    if (typeof source[key] === 'boolean') {
      settings[key] = source[key]
      changed = true
    }
  }
  for (const key of AUDIO_VOLUME_KEYS) {
    const volume = source[key]
    if (typeof volume === 'number' && Number.isFinite(volume)) {
      settings[key] = Math.min(1, Math.max(0, volume))
      changed = true
    }
  }

  return changed ? settings : null
}

export interface RemoteAccountPreferences {
  avatar: Json | null
  audio: Json | null
  updatedAt: string
}

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình.')
  }
  return supabase
}

function asJsonObject(value: unknown): Json | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'object' || Array.isArray(value)) return null
  return JSON.parse(JSON.stringify(value)) as Json
}

/**
 * Reads the signed-in student's stored preferences. Returns null when no row
 * exists yet or when there is no permanent (non-anonymous) session — the
 * client should then keep using local storage values.
 */
export async function fetchAccountPreferences(): Promise<RemoteAccountPreferences | null> {
  const client = requireSupabase()

  const {
    data: { session },
  } = await client.auth.getSession()
  if (!session?.user || session.user.is_anonymous) return null

  const { data, error } = await client
    .from('user_preferences')
    .select('*')
    .eq('auth_user_id', session.user.id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    avatar: data.avatar && Object.keys(data.avatar).length > 0 ? data.avatar : null,
    audio: data.audio && Object.keys(data.audio).length > 0 ? data.audio : null,
    updatedAt: data.updated_at,
  }
}

/**
 * Partial upsert: only the provided slices are written, so an avatar save can
 * never clobber audio settings synced from another device. The auth_user_id
 * always comes from the current session, never from caller input (RLS enforces
 * the same rule server-side).
 */
export async function saveAccountPreferences(input: {
  avatar?: Json | null
  audio?: Json | null
}): Promise<void> {
  const client = requireSupabase()

  const {
    data: { session },
  } = await client.auth.getSession()
  const user = session?.user
  if (!user || user.is_anonymous) {
    throw new Error('Cần đăng nhập tài khoản học sinh để lưu cài đặt.')
  }

  const payload: Record<string, Json> = { updated_at: new Date().toISOString() }
  const avatar = asJsonObject(input.avatar)
  const audio = asJsonObject(input.audio)
  if (avatar) payload.avatar = avatar
  if (audio) payload.audio = audio
  if (Object.keys(payload).length <= 1) return

  const { error } = await client
    .from('user_preferences')
    .upsert(
      { auth_user_id: user.id, ...payload },
      { onConflict: 'auth_user_id' },
    )

  if (error) throw error
}
