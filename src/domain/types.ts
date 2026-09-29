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
  unlockFamilyIds: string[]
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


export interface WorkBasketItem {
  name: string
  quantity: number
  unitPrice: number
}

export interface WorkScenarioChoice {
  id: string
  label: string
  billDelta: number
  employeeRatingDelta: number
  storeReputationDelta: number
  customerSatisfactionDelta: number
  feedback: string
}

export type WorkScenarioCategory =
  | 'product-quality'
  | 'promotion'
  | 'billing'
  | 'customer-needs'
  | 'inventory'
  | 'transparency'

export interface WorkScenarioDefinition {
  id: string
  version: number
  category: WorkScenarioCategory
  difficulty: 1 | 2 | 3
  title: string
  description: string
  choices: WorkScenarioChoice[]
}

export interface WorkCustomerDefinition {
  id: string
  name: string
  basket: WorkBasketItem[]
  cashGiven: number
  scenarioId?: string
  scenarioVersion?: number
}

export interface WorkShiftDefinition {
  id: string
  title: string
  subtitle: string
  roleTitle: string
  customers: WorkCustomerDefinition[]
  startingEmployeeRating: number
  startingStoreReputation: number
  startingCustomerSatisfaction: number
}

export interface WorkShiftTemplateDefinition {
  id: string
  version: number
  title: string
  subtitle: string
  roleTitle: string
  customerCount: number
  scenarioCount: number
  minScenarioDifficulty: 1 | 2 | 3
  maxScenarioDifficulty: 1 | 2 | 3
  startingEmployeeRating: number
  startingStoreReputation: number
  startingCustomerSatisfaction: number
}

export interface WorkShiftInstance extends WorkShiftDefinition {
  templateId: string
  templateVersion: number
  seed: number
  studentKey: string
  variantIndex: number
}

export interface WorkShiftMetrics {
  employeeRating: number
  storeReputation: number
  customerSatisfaction: number
  revenue: number
  servedCustomers: number
  mathMistakes: number
}

export interface WorkShiftCustomerProgress {
  totalSolved: boolean
  changeSolved: boolean
  scenarioChoiceId?: string
  totalAttempts: number
  changeAttempts: number
}

export interface WorkShiftProgress {
  shiftId: string
  customerIndex: number
  customerProgress: Record<string, WorkShiftCustomerProgress>
  metrics: WorkShiftMetrics
  completed: boolean
}
