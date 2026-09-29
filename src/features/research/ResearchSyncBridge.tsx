import { useEffect } from 'react'
import { syncResearchEvents } from '../../lib/researchRemote'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useResearchLogStore } from '../../store/researchLog'

const SYNC_BATCH_SIZE = 100
const SYNC_DEBOUNCE_MS = 900

export function ResearchSyncBridge() {
  useEffect(() => {
    if (!isSupabaseConfigured) return

    let timeoutId: number | null = null
    let syncing = false
    let disposed = false

    const clearTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const scheduleSync = (delay = SYNC_DEBOUNCE_MS) => {
      if (disposed) return

      clearTimer()
      timeoutId = window.setTimeout(() => {
        timeoutId = null
        void runSync()
      }, delay)
    }

    const runSync = async () => {
      if (disposed || syncing) return
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return

      const state = useResearchLogStore.getState()
      const pendingEvents = state.events
        .filter((event) => !state.syncedEventIds[event.eventId])
        .slice(0, SYNC_BATCH_SIZE)

      if (pendingEvents.length === 0) return

      syncing = true

      try {
        const result = await syncResearchEvents(pendingEvents)

        if (disposed) return

        if (result.status === 'synced') {
          useResearchLogStore.getState().markEventsSynced(result.eventIds)

          const nextState = useResearchLogStore.getState()
          const hasMore = nextState.events.some(
            (event) => !nextState.syncedEventIds[event.eventId],
          )

          if (hasMore) {
            scheduleSync(50)
          }

          return
        }

        useResearchLogStore.getState().setSyncError(undefined)
      } catch (error) {
        if (disposed) return

        useResearchLogStore.getState().setSyncError(
          error instanceof Error
            ? error.message
            : 'Không thể đồng bộ research events lên Supabase.',
        )
      } finally {
        syncing = false
      }
    }

    const unsubscribe = useResearchLogStore.subscribe((state, previousState) => {
      if (
        state.events !== previousState.events ||
        state.syncedEventIds !== previousState.syncedEventIds
      ) {
        scheduleSync()
      }
    })

    const handleOnline = () => scheduleSync(0)
    window.addEventListener('online', handleOnline)

    scheduleSync(0)

    return () => {
      disposed = true
      clearTimer()
      unsubscribe()
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
