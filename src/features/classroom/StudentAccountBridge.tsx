import { useEffect } from 'react'
import type { Json } from '../../types/supabase'
import {
  fetchCurrentStudentAccount,
  syncStudentLearningSnapshot,
} from '../../lib/classroomRemote'
import { supabase } from '../../lib/supabase'
import { useLearningProfileStore } from '../../store/learningProfile'
import { useProgressionStore } from '../../store/progression'
import { useStudentAccountStore } from '../../store/studentAccount'

const SYNC_DELAY_MS = 1200

function asJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json
}

export function StudentAccountBridge() {
  useEffect(() => {
    let disposed = false
    let syncTimer: number | null = null

    const loadAccount = async () => {
      try {
        const account = await fetchCurrentStudentAccount()
        if (!disposed) {
          useStudentAccountStore.getState().setAccount(account)
        }
      } catch {
        if (!disposed) {
          useStudentAccountStore.getState().clear()
        }
      }
    }

    const syncSnapshot = async () => {
      if (disposed) return
      const account = useStudentAccountStore.getState().student
      if (!account) return

      const progression = useProgressionStore.getState()
      const learning = useLearningProfileStore.getState()

      try {
        await syncStudentLearningSnapshot({
          level: progression.level,
          totalXp: progression.totalXp,
          coins: progression.coins,
          mastery: asJson(learning.masteryBySkill),
          completedWorldChapters: progression.completedWorldChapterIds,
          completedMissions: progression.completedMissionIds,
          activityResults: asJson(progression.activityResults),
        })
      } catch {
        // Local gameplay must continue even when classroom sync is unavailable.
      }
    }

    const scheduleSync = () => {
      if (syncTimer !== null) window.clearTimeout(syncTimer)
      syncTimer = window.setTimeout(() => {
        syncTimer = null
        void syncSnapshot()
      }, SYNC_DELAY_MS)
    }

    void loadAccount().then(scheduleSync)

    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      void loadAccount().then(scheduleSync)
    })

    const unsubscribeProgression = useProgressionStore.subscribe(
      (state, previous) => {
        if (
          state.level !== previous.level ||
          state.totalXp !== previous.totalXp ||
          state.coins !== previous.coins ||
          state.completedWorldChapterIds !== previous.completedWorldChapterIds ||
          state.completedMissionIds !== previous.completedMissionIds ||
          state.activityResults !== previous.activityResults
        ) {
          scheduleSync()
        }
      },
    )

    const unsubscribeLearning = useLearningProfileStore.subscribe(
      (state, previous) => {
        if (state.masteryBySkill !== previous.masteryBySkill) scheduleSync()
      },
    )

    return () => {
      disposed = true
      if (syncTimer !== null) window.clearTimeout(syncTimer)
      authSubscription?.data.subscription.unsubscribe()
      unsubscribeProgression()
      unsubscribeLearning()
    }
  }, [])

  return null
}
