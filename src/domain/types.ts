export type StallId = 'produce' | 'food' | 'drinks' | 'supplies' | 'promotion'

export type MathSkill =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'unit-price'
  | 'budget'
  | 'percentage'

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

export type AssignmentTarget =
  | { type: 'class'; classId: string; className: string }
  | { type: 'student'; studentId: string; studentName: string }

export interface AssignedStall {
  stallId: StallId
  challengeIds: string[]
  requiredCorrect: number
}

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
