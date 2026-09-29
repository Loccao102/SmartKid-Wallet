import { traineeShift } from './workShift'
import { advancedShiftTemplate } from './workShiftTemplates'
import { generateWorkShiftInstance } from '../domain/workShiftGenerator'
import type { WorkShiftDefinition } from '../domain/types'

export const demoWorkStudentKey = 'student-demo-minh-anh'

export const advancedShift = generateWorkShiftInstance(
  advancedShiftTemplate,
  demoWorkStudentKey,
  0,
)

export const workShiftInstances: WorkShiftDefinition[] = [
  traineeShift,
  advancedShift,
]

export function getWorkShiftById(id: string) {
  const shift = workShiftInstances.find((item) => item.id === id)

  if (!shift) {
    throw new Error('Unknown work shift: ' + id)
  }

  return shift
}
