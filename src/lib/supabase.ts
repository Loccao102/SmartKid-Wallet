import type { Database } from '../types/supabase'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const defaultSupabaseUrl = 'https://mmppqzxkjbifizuiyrnx.supabase.co'
const defaultSupabasePublishableKey =
  'sb_publishable_3oa7Dw5xMnzW49CP_ndLug_sma1ltni'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || defaultSupabaseUrl
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  defaultSupabasePublishableKey

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
)

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const anonymousResearchAuthEnabled =
  import.meta.env.VITE_SUPABASE_ANONYMOUS_AUTH !== 'false'
