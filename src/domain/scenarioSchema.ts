import { z } from 'zod'

export const rubricSchema = z.record(z.string(), z.number().nonnegative())

export const scenarioSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  type: z.string().min(1),
  grade: z.union([z.literal(4), z.literal(5)]),
  difficulty: z.number().int().min(1).max(5),
  stallId: z.string().min(1),
  mathSkills: z.array(z.string()).min(1),
  values: z.array(z.string()),
  rubric: rubricSchema,
})

export type Scenario = z.infer<typeof scenarioSchema>
