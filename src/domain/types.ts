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
  unlockLevel: number
  prerequisiteMissionId?: string
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

export type MissionSoftGoalKind =
  | 'min-distinct-products'
  | 'avoid-products'

export interface MissionSoftGoalDefinition {
  id: string
  title: string
  description: string
  revealAfterItems: number
  kind: MissionSoftGoalKind
  target?: number
  productIds?: string[]
}

export type MissionDynamicEventKind =
  | 'people-adjustment'
  | 'budget-adjustment'
  | 'product-unavailable'

export interface MissionDynamicEventDefinition {
  id: string
  title: string
  description: string
  revealAfterItems: number
  kind: MissionDynamicEventKind
  peopleDelta?: number
  budgetDelta?: number
  productIds?: string[]
}

export interface MissionDefinition {
  id: string
  version: number
  title: string
  shortDescription: string
  story: string
  people: number
  budget: number
  reserveRequired: number
  requiredStalls: ProductStallId[]
  rewardTitle: string
  unlockLevel: number
  prerequisiteMissionId?: string
  targetTimeSeconds?: number
  xpReward: number
  coinReward?: number
  softGoals?: MissionSoftGoalDefinition[]
  dynamicEvents?: MissionDynamicEventDefinition[]
  teacherChallenge?: {
    id: string
    requiredStars: 5
    coinReward: number
    label: string
  }
}

export interface MissionEvaluation {
  success: boolean
  spent: number
  remaining: number
  coverageByStall: Record<ProductStallId, number>
  reasons: string[]
  softGoalResults: Array<{
    id: string
    achieved: boolean
  }>
  activeEventIds: string[]
  effectivePeople: number
  effectiveBudget: number
  unavailableProductIds: string[]
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
  requestLine?: string
  scenarioId?: string
  scenarioVersion?: number
  scenarioVariantKey?: string
  scenarioTitle?: string
  scenarioDescription?: string
  scenarioChoiceOrder?: string[]
}

export type WorkGuidanceLevel = 'guided' | 'light' | 'implicit'

export interface WorkShiftDefinition {
  id: string
  title: string
  subtitle: string
  roleTitle: string
  guidanceLevel?: WorkGuidanceLevel
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
  guidanceLevel: WorkGuidanceLevel
  customerCount: number
  scenarioCount: number
  minScenarioDifficulty: 1 | 2 | 3
  maxScenarioDifficulty: 1 | 2 | 3
  mathDifficulty: 1 | 2 | 3
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
  generationAttempt: number
  fingerprint: string
  difficultyScore: number
}

export type WorkWorldFlag =
  | 'complaint-risk'
  | 'pricing-mismatch'
  | 'inventory-pressure'
  | 'cash-discrepancy'
  | 'billing-dispute'
  | 'stale-promo-sign'

export interface WorkStoryFollowUpChoice {
  id: string
  label: string
  employeeRatingDelta: number
  storeReputationDelta: number
  customerSatisfactionDelta: number
  feedback: string
}

export interface WorkStoryFollowUpDefinition {
  id: string
  delayCustomers: number
  title: string
  description: string
  choices: WorkStoryFollowUpChoice[]
}

export interface WorkDeferredConsequenceDefinition {
  id: string
  trigger: 'after-customers' | 'shift-end'
  delayCustomers?: number
  title: string
  description: string
  employeeRatingDelta: number
  storeReputationDelta: number
  customerSatisfactionDelta: number
  clearFlags?: WorkWorldFlag[]
}

export interface WorkWorldEffect {
  setFlags?: WorkWorldFlag[]
  clearFlags?: WorkWorldFlag[]
  deferredConsequences?: WorkDeferredConsequenceDefinition[]
  followUps?: WorkStoryFollowUpDefinition[]
}

export interface WorkPendingConsequence
  extends WorkDeferredConsequenceDefinition {
  instanceId: string
  scheduledAtServedCustomers: number
  dueAtServedCustomers?: number
}

export interface WorkResolvedConsequence
  extends WorkPendingConsequence {
  resolvedAtServedCustomers: number
}

export interface WorkPendingFollowUp extends WorkStoryFollowUpDefinition {
  instanceId: string
  scheduledAtServedCustomers: number
  dueAtServedCustomers: number
  sourceScenarioId: string
  sourceChoiceId: string
}

export interface WorkResolvedFollowUp extends WorkPendingFollowUp {
  resolvedAtServedCustomers: number
  selectedChoiceId: string
  feedback: string
}

export interface WorkWorldState {
  flags: WorkWorldFlag[]
  pendingConsequences: WorkPendingConsequence[]
  resolvedConsequences: WorkResolvedConsequence[]
  pendingFollowUps: WorkPendingFollowUp[]
  resolvedFollowUps: WorkResolvedFollowUp[]
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
  activeFollowUpInstanceId?: string
  customerProgress: Record<string, WorkShiftCustomerProgress>
  metrics: WorkShiftMetrics
  worldState: WorkWorldState
  startedAtEpochMs?: number
  completedAtEpochMs?: number
  completed: boolean
}


export type ResearchEventType =
  | 'shift_started'
  | 'math_attempt'
  | 'scenario_choice'
  | 'customer_settled'
  | 'consequence_resolved'
  | 'shift_completed'

export type WorkMathStage = 'total' | 'change'

export interface ResearchEventSnapshot {
  metrics: WorkShiftMetrics
  worldState: WorkWorldState
}

export interface ResearchEvent {
  schemaVersion: 1
  eventId: string
  sessionId: string
  eventType: ResearchEventType
  occurredAt: string

  studentKey: string
  shiftId: string
  shiftTemplateId?: string
  shiftTemplateVersion?: number
  shiftSeed?: number
  shiftVariantIndex?: number

  customerId?: string
  customerIndex?: number
  scenarioId?: string
  scenarioVersion?: number
  choiceId?: string

  mathStage?: WorkMathStage
  submittedAnswer?: number
  expectedAnswer?: number
  correct?: boolean
  attemptNumber?: number
  responseTimeMs?: number

  consequenceId?: string
  consequenceInstanceId?: string

  before?: ResearchEventSnapshot
  after?: ResearchEventSnapshot

  metadata?: Record<string, string | number | boolean | null>
}
