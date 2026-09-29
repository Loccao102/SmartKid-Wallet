import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResearchEvent } from '../domain/types'

let fallbackSessionSequence = 0

function createSessionId(shiftId: string) {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    'randomUUID' in globalThis.crypto
  ) {
    return 'session-' + globalThis.crypto.randomUUID()
  }

  fallbackSessionSequence += 1
  return (
    'session-' +
    shiftId +
    '-' +
    Date.now() +
    '-' +
    fallbackSessionSequence
  )
}

interface ResearchLogStore {
  events: ResearchEvent[]
  activeSessionByShiftId: Record<string, string>
  syncedEventIds: Record<string, true>
  lastSyncAt?: string
  lastSyncError?: string
  ensureShiftSession: (shiftId: string, studentKey: string) => string
  appendEvent: (event: ResearchEvent) => void
  markEventsSynced: (eventIds: string[]) => void
  setSyncError: (message?: string) => void
  endShiftSession: (shiftId: string) => void
  clearEvents: () => void
}

export const useResearchLogStore = create<ResearchLogStore>()(
  persist(
    (set, get) => ({
      events: [],
      activeSessionByShiftId: {},
      syncedEventIds: {},

      ensureShiftSession: (shiftId) => {
        const existing = get().activeSessionByShiftId[shiftId]
        if (existing) return existing

        const sessionId = createSessionId(shiftId)

        set((state) => ({
          activeSessionByShiftId: {
            ...state.activeSessionByShiftId,
            [shiftId]: sessionId,
          },
        }))

        return sessionId
      },

      appendEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      markEventsSynced: (eventIds) =>
        set((state) => ({
          syncedEventIds: {
            ...state.syncedEventIds,
            ...Object.fromEntries(eventIds.map((eventId) => [eventId, true] as const)),
          },
          lastSyncAt: new Date().toISOString(),
          lastSyncError: undefined,
        })),

      setSyncError: (message) =>
        set({
          lastSyncError: message,
        }),

      endShiftSession: (shiftId) =>
        set((state) => {
          const next = { ...state.activeSessionByShiftId }
          delete next[shiftId]

          return {
            activeSessionByShiftId: next,
          }
        }),

      clearEvents: () =>
        set({
          events: [],
          activeSessionByShiftId: {},
          syncedEventIds: {},
          lastSyncAt: undefined,
          lastSyncError: undefined,
        }),
    }),
    {
      name: 'smartkid-wallet-research-log-v2',
    },
  ),
)
