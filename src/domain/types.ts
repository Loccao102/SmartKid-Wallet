export type StallId = 'produce' | 'food' | 'drinks' | 'supplies' | 'promotion'

export type MapId = 'smartmart' | 'tiny-bank' | 'happy-restaurant' | 'weekend-market'

export type MathSkill =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'unit-price'
  | 'budget'
  | 'percentage'
  | 'measurement'
  | 'fraction'
  | 'comparison'

export interface WorldMapDefinition {
  id: MapId
  order: number
  name: string
  shortName: string
  description: string
  icon: string
  status: 'available' | 'locked'
  unlockHint?: string
  theme: 'supermarket' | 'bank' | 'restaurant' | 'market'
  artworkKey: string
}

export type ExerciseParameter =
  | {
      kind: 'range'
      key: string
      min: number
      max: number
      step: number
    }
  | {
      kind: 'list'
      key: string
      values: Array<number | string>
    }

export interface ExerciseFamilyDefinition {
  id: string
  stallId: StallId
  name: string
  description: string
  skills: MathSkill[]
  difficulty: 1 | 2 | 3
  parameters: ExerciseParameter[]
  generatorType: string
}

export interface UnlockChallenge {
  id: string
  prompt: string
  answer: number
  unit?: string
}

export interface StallDefinition {
  id: StallId
  order: number
  icon: string
  name: string
  description: string
  skills: MathSkill[]
  challenge: UnlockChallenge
}

/**
 * @deprecated Prototype model from the teacher-assignment architecture.
 * Kept temporarily so the existing unlock prototype can compile while the
 * product migrates to world progression + built-in exercise families.
 */
export type AssignmentTarget =
  | { type: 'class'; classId: string; className: string }
  | { type: 'student'; studentId: string; studentName: string }

/** @deprecated See AssignmentTarget. */
export interface AssignedStall {
  stallId: StallId
  challengeIds: string[]
  requiredCorrect: number
}

/** @deprecated See AssignmentTarget. */
export interface TeacherAssignment {
  id: string
  title: string
  teacherId: string
  teacherName: string
  grade: 4 | 5
  target: AssignmentTarget
  status: 'draft' | 'published' | 'closed'
  assignedAt: string
  dueAt?: string
  stalls: AssignedStall[]
  fullShiftEnabled: boolean
}
