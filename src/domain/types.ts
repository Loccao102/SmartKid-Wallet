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

export interface ExerciseInstance {
  id: string
  familyId: string
  stallId: StallId
  seed: number
  prompt: string
  answer: number
  unit?: string
  parameters: Record<string, number | string>
}

export interface StallDefinition {
  id: StallId
  order: number
  name: string
  description: string
  skills: MathSkill[]
  exerciseFamilyIds: string[]
}


export type ProductStallId = Exclude<StallId, 'promotion'>

export interface ProductDefinition {
  id: string
  name: string
  stallId: ProductStallId
  price: number
  unitLabel: string
  servesPeople: number
  assetKey: string
}

export interface CartLine {
  productId: string
  quantity: number
}

export interface MissionDefinition {
  id: string
  title: string
  shortDescription: string
  story: string
  people: number
  budget: number
  reserveRequired: number
  requiredStalls: ProductStallId[]
  rewardTitle: string
}

export interface MissionEvaluation {
  success: boolean
  spent: number
  remaining: number
  coverageByStall: Record<ProductStallId, number>
  reasons: string[]
}
