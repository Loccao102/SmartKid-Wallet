import { create } from 'zustand'
import type { ClassroomRow, StudentClassroomAccount, StudentProfileRow } from '../lib/classroomRemote'

interface StudentAccountState {
  loaded: boolean
  student: StudentProfileRow | null
  classroom: ClassroomRow | null
  setAccount: (account: StudentClassroomAccount | null) => void
  setLoaded: (loaded: boolean) => void
  clear: () => void
}

export const useStudentAccountStore = create<StudentAccountState>((set) => ({
  loaded: false,
  student: null,
  classroom: null,
  setAccount: (account) =>
    set({
      loaded: true,
      student: account?.student ?? null,
      classroom: account?.classroom ?? null,
    }),
  setLoaded: (loaded) => set({ loaded }),
  clear: () => set({ loaded: true, student: null, classroom: null }),
}))
