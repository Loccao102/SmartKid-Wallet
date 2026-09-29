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
