export type AvatarAge = 'child' | 'adult'
export type AvatarExpression =
  | 'neutral'
  | 'happy'
  | 'thinking'
  | 'confused'
  | 'concerned'

export type AvatarBodyType = 'balanced' | 'slim' | 'broad'
export type AvatarHairStyle =
  | 'short'
  | 'side'
  | 'bob'
  | 'ponytail'
  | 'curly'
  | 'waves'
  | 'crop'
  | 'bun'
export type AvatarEyeStyle = 'round' | 'soft' | 'bright' | 'calm'
export type AvatarAccessory = 'none' | 'glasses' | 'cap' | 'headband' | 'bag'

export interface AvatarConfig {
  bodyType: AvatarBodyType
  skinTone: string
  hairStyle: AvatarHairStyle
  hairColor: string
  eyeStyle: AvatarEyeStyle
  topColor: string
  bottomColor: string
  shoeColor: string
  accessory: AvatarAccessory
}

/** The persisted shape is intentionally small so it can move to a server profile later. */
export const AVATAR_CONFIG_KEYS = [
  'bodyType',
  'skinTone',
  'hairStyle',
  'hairColor',
  'eyeStyle',
  'topColor',
  'bottomColor',
  'shoeColor',
  'accessory',
] as const

export interface AvatarOption<T extends string> {
  id: T
  label: string
  color?: string
}

export const skinToneOptions = [
  { id: '#f6d1b5', label: 'Sáng' },
  { id: '#eab890', label: 'Ấm' },
  { id: '#d99b70', label: 'Mật ong' },
  { id: '#ba7956', label: 'Nâu ấm' },
  { id: '#89563f', label: 'Nâu đậm' },
] as const

export const hairColorOptions = [
  { id: '#352923', label: 'Đen nâu' },
  { id: '#5b3a2b', label: 'Nâu hạt dẻ' },
  { id: '#8a5b35', label: 'Nâu sáng' },
  { id: '#1f2a38', label: 'Đen xanh' },
  { id: '#7a4038', label: 'Nâu đỏ' },
  { id: '#c59a58', label: 'Vàng nâu' },
] as const

export const topColorOptions = [
  { id: '#3d8668', label: 'Xanh lá' },
  { id: '#4f83bd', label: 'Xanh biển' },
  { id: '#dc7969', label: 'Cam san hô' },
  { id: '#a874b7', label: 'Tím' },
  { id: '#e3ad3e', label: 'Vàng' },
  { id: '#6f7d95', label: 'Xanh xám' },
  { id: '#d6617e', label: 'Hồng' },
  { id: '#52766b', label: 'Xanh rêu' },
] as const

export const bottomColorOptions = [
  { id: '#304b63', label: 'Xanh đậm' },
  { id: '#4c635d', label: 'Xanh rêu' },
  { id: '#7a6858', label: 'Nâu' },
  { id: '#5f5b73', label: 'Tím xám' },
  { id: '#44505e', label: 'Than' },
  { id: '#82705f', label: 'Be nâu' },
] as const

export const shoeColorOptions = [
  { id: '#263843', label: 'Than' },
  { id: '#f3eee2', label: 'Kem' },
  { id: '#5a4a43', label: 'Nâu' },
  { id: '#4e6b65', label: 'Xanh rêu' },
  { id: '#9f554e', label: 'Đỏ gạch' },
] as const

export const bodyTypeOptions: AvatarOption<AvatarBodyType>[] = [
  { id: 'balanced', label: 'Cân đối' },
  { id: 'slim', label: 'Mảnh' },
  { id: 'broad', label: 'Khỏe khoắn' },
]

export const hairStyleOptions: AvatarOption<AvatarHairStyle>[] = [
  { id: 'short', label: 'Tóc ngắn' },
  { id: 'side', label: 'Rẽ bên' },
  { id: 'bob', label: 'Tóc bob' },
  { id: 'ponytail', label: 'Đuôi ngựa' },
  { id: 'curly', label: 'Tóc xoăn' },
  { id: 'waves', label: 'Tóc gợn' },
  { id: 'crop', label: 'Tóc tém' },
  { id: 'bun', label: 'Tóc búi' },
]

export const eyeStyleOptions: AvatarOption<AvatarEyeStyle>[] = [
  { id: 'round', label: 'Tròn' },
  { id: 'soft', label: 'Dịu' },
  { id: 'bright', label: 'Lanh lợi' },
  { id: 'calm', label: 'Điềm tĩnh' },
]

export const accessoryOptions: AvatarOption<AvatarAccessory>[] = [
  { id: 'none', label: 'Không' },
  { id: 'glasses', label: 'Kính' },
  { id: 'cap', label: 'Mũ lưỡi trai' },
  { id: 'headband', label: 'Băng đô' },
  { id: 'bag', label: 'Túi đeo' },
]

export const defaultStudentAvatar: AvatarConfig = {
  bodyType: 'balanced',
  skinTone: '#eab890',
  hairStyle: 'side',
  hairColor: '#352923',
  eyeStyle: 'bright',
  topColor: '#3d8668',
  bottomColor: '#304b63',
  shoeColor: '#f3eee2',
  accessory: 'none',
}

const bodyTypeIds = new Set<AvatarBodyType>(bodyTypeOptions.map((option) => option.id))
const hairStyleIds = new Set<AvatarHairStyle>(hairStyleOptions.map((option) => option.id))
const eyeStyleIds = new Set<AvatarEyeStyle>(eyeStyleOptions.map((option) => option.id))
const accessoryIds = new Set<AvatarAccessory>(accessoryOptions.map((option) => option.id))
const skinToneIds = new Set<string>(skinToneOptions.map((option) => option.id))
const hairColorIds = new Set<string>(hairColorOptions.map((option) => option.id))
const topColorIds = new Set<string>(topColorOptions.map((option) => option.id))
const bottomColorIds = new Set<string>(bottomColorOptions.map((option) => option.id))
const shoeColorIds = new Set<string>(shoeColorOptions.map((option) => option.id))

export function isAvatarConfig(value: unknown): value is AvatarConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Partial<AvatarConfig>
  return (
    bodyTypeIds.has(config.bodyType as AvatarBodyType) &&
    skinToneIds.has(config.skinTone ?? '') &&
    hairStyleIds.has(config.hairStyle as AvatarHairStyle) &&
    hairColorIds.has(config.hairColor ?? '') &&
    eyeStyleIds.has(config.eyeStyle as AvatarEyeStyle) &&
    topColorIds.has(config.topColor ?? '') &&
    bottomColorIds.has(config.bottomColor ?? '') &&
    shoeColorIds.has(config.shoeColor ?? '') &&
    accessoryIds.has(config.accessory as AvatarAccessory)
  )
}

/** Drops unknown persisted options while keeping a safe, renderable avatar. */
export function normalizeAvatarConfig(value: unknown): AvatarConfig {
  if (isAvatarConfig(value)) return { ...value }
  if (!value || typeof value !== 'object') return { ...defaultStudentAvatar }

  const candidate = value as Partial<AvatarConfig>
  return {
    bodyType: bodyTypeIds.has(candidate.bodyType as AvatarBodyType) ? candidate.bodyType as AvatarBodyType : defaultStudentAvatar.bodyType,
    skinTone: skinToneIds.has(candidate.skinTone ?? '') ? candidate.skinTone as string : defaultStudentAvatar.skinTone,
    hairStyle: hairStyleIds.has(candidate.hairStyle as AvatarHairStyle) ? candidate.hairStyle as AvatarHairStyle : defaultStudentAvatar.hairStyle,
    hairColor: hairColorIds.has(candidate.hairColor ?? '') ? candidate.hairColor as string : defaultStudentAvatar.hairColor,
    eyeStyle: eyeStyleIds.has(candidate.eyeStyle as AvatarEyeStyle) ? candidate.eyeStyle as AvatarEyeStyle : defaultStudentAvatar.eyeStyle,
    topColor: topColorIds.has(candidate.topColor ?? '') ? candidate.topColor as string : defaultStudentAvatar.topColor,
    bottomColor: bottomColorIds.has(candidate.bottomColor ?? '') ? candidate.bottomColor as string : defaultStudentAvatar.bottomColor,
    shoeColor: shoeColorIds.has(candidate.shoeColor ?? '') ? candidate.shoeColor as string : defaultStudentAvatar.shoeColor,
    accessory: accessoryIds.has(candidate.accessory as AvatarAccessory) ? candidate.accessory as AvatarAccessory : defaultStudentAvatar.accessory,
  }
}

export const npcAvatarPresets: AvatarConfig[] = [
  {
    bodyType: 'balanced',
    skinTone: '#eab890',
    hairStyle: 'bob',
    hairColor: '#5b3a2b',
    eyeStyle: 'soft',
    topColor: '#c96f68',
    bottomColor: '#4c635d',
    shoeColor: '#5a4a43',
    accessory: 'bag',
  },
  {
    bodyType: 'broad',
    skinTone: '#d99b70',
    hairStyle: 'short',
    hairColor: '#352923',
    eyeStyle: 'calm',
    topColor: '#5276a8',
    bottomColor: '#44505e',
    shoeColor: '#263843',
    accessory: 'glasses',
  },
  {
    bodyType: 'slim',
    skinTone: '#f6d1b5',
    hairStyle: 'ponytail',
    hairColor: '#1f2a38',
    eyeStyle: 'bright',
    topColor: '#b675ac',
    bottomColor: '#5f5b73',
    shoeColor: '#f3eee2',
    accessory: 'headband',
  },
  {
    bodyType: 'balanced',
    skinTone: '#ba7956',
    hairStyle: 'curly',
    hairColor: '#352923',
    eyeStyle: 'round',
    topColor: '#3d8668',
    bottomColor: '#304b63',
    shoeColor: '#5a4a43',
    accessory: 'none',
  },
  {
    bodyType: 'broad',
    skinTone: '#89563f',
    hairStyle: 'crop',
    hairColor: '#1f2a38',
    eyeStyle: 'soft',
    topColor: '#d99a3e',
    bottomColor: '#4c635d',
    shoeColor: '#263843',
    accessory: 'cap',
  },
  {
    bodyType: 'slim',
    skinTone: '#eab890',
    hairStyle: 'waves',
    hairColor: '#7a4038',
    eyeStyle: 'calm',
    topColor: '#4f83bd',
    bottomColor: '#82705f',
    shoeColor: '#9f554e',
    accessory: 'glasses',
  },
  {
    bodyType: 'balanced',
    skinTone: '#d99b70',
    hairStyle: 'bun',
    hairColor: '#5b3a2b',
    eyeStyle: 'bright',
    topColor: '#d6617e',
    bottomColor: '#5f5b73',
    shoeColor: '#f3eee2',
    accessory: 'none',
  },
  {
    bodyType: 'broad',
    skinTone: '#f6d1b5',
    hairStyle: 'side',
    hairColor: '#8a5b35',
    eyeStyle: 'round',
    topColor: '#52766b',
    bottomColor: '#44505e',
    shoeColor: '#5a4a43',
    accessory: 'bag',
  },
  {
    bodyType: 'slim',
    skinTone: '#ba7956',
    hairStyle: 'bob',
    hairColor: '#352923',
    eyeStyle: 'soft',
    topColor: '#dc7969',
    bottomColor: '#304b63',
    shoeColor: '#263843',
    accessory: 'headband',
  },
  {
    bodyType: 'balanced',
    skinTone: '#89563f',
    hairStyle: 'short',
    hairColor: '#1f2a38',
    eyeStyle: 'calm',
    topColor: '#6f7d95',
    bottomColor: '#82705f',
    shoeColor: '#f3eee2',
    accessory: 'none',
  },
]

function hashKey(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function getNpcAvatarConfig(key: string, offset = 0): AvatarConfig {
  const index = (hashKey(key) + Math.max(0, offset)) % npcAvatarPresets.length
  return npcAvatarPresets[index]
}
