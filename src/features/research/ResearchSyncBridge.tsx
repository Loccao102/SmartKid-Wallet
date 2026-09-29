import { useEffect, useMemo, useRef } from 'react'
import { syncResearchEvents } from '../../lib/researchRemote'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useResearchLogStore } from '../../store/researchLog'

const SYNC_BATCH_SIZE = 100
const SYNC_DEBOUNCE_MS = 900

export function ResearchSyncBridge() {
  const events = useResearchLogStore((state) => state.events)
  const syncedEventIds = useResearchLogStore((state) => state.syncedEventIds)
  const markEventsSynced = useResearchLogStore((state) => state.markEventsSynced)
  const setSyncError = useResearchLogStore((state) => state.setSyncError)
  const syncingRef = useRef(false)

  const pendingEvents = useMemo(
    () => events.filter((event) => !syncedEventIds[event.eventId]),
    [events, syncedEventIds],
  )

  useEffect(() => {
    if (!isSupabaseConfigured || pendingEvents.length === 0) return

    const sync = async () => {
      if (syncingRef.current) return
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return

      syncingRef.current = true

      try {
        const batch = pendingEvents.slice(0, SYNC_BATCH_SIZE)
        const result = await syncResearchEvents(batch)

        if (result.status === 'synced') {
          markEventsSynced(result.eventIds)
          return
        }

        setSyncError(undefined)
      } catch (error) {
        setSyncError(
          error instanceof Error
            ? error.message
            : 'Không thể đồng bộ research events lên Supabase.',
        )
      } finally {
        syncingRef.current = false
      }
    }

    const timeoutId = window.setTimeout(sync, SYNC_DEBOUNCE_MS)
    const handleOnline = () => void sync()

    window.addEventListener('online', handleOnline)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('online', handleOnline)
    }
  }, [
    markEventsSynced,
    pendingEvents,
    setSyncError,
  ])

  return null
}
