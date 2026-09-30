import { traineeShift } from './workShift'
import {
  advancedShiftTemplate,
  expertShiftTemplate,
  managerShiftTemplate,
  traineeShiftTemplate,
} from './workShiftTemplates'
import { generateWorkShiftInstance } from '../domain/workShiftGenerator'
import type { WorkShiftDefinition } from '../domain/types'

export const demoWorkStudentKey = 'student-demo-minh-anh'

export const advancedShift = generateWorkShiftInstance(
  advancedShiftTemplate,
  demoWorkStudentKey,
  0,
)

export const expertShift = generateWorkShiftInstance(
  expertShiftTemplate,
  demoWorkStudentKey,
  0,
)

export const managerShift = generateWorkShiftInstance(
  managerShiftTemplate,
  demoWorkStudentKey,
  0,
)

export const workShiftInstances: WorkShiftDefinition[] = [
  traineeShift,
  advancedShift,
  expertShift,
  managerShift,
]

export function getWorkShiftById(
  id: string,
  variantIndex = 0,
  recentFingerprints: string[] = [],
) {
  if (variantIndex === 0) {
    const shift = workShiftInstances.find((item) => item.id === id)
    if (shift) return shift
  }

  const template =
    id === traineeShift.id || id === traineeShiftTemplate.id
      ? traineeShiftTemplate
      : id === advancedShift.id || id === advancedShiftTemplate.id
        ? advancedShiftTemplate
        : id === expertShift.id || id === expertShiftTemplate.id
          ? expertShiftTemplate
          : id === managerShift.id || id === managerShiftTemplate.id
            ? managerShiftTemplate
            : undefined

  if (!template) {
    throw new Error('Unknown work shift: ' + id)
  }

  return generateWorkShiftInstance(
    template,
    demoWorkStudentKey,
    variantIndex,
    { recentFingerprints },
  )
}
