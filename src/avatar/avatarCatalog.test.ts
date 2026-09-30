import { describe, expect, it } from 'vitest'
import {
  getNpcAvatarConfig,
  npcAvatarPresets,
} from './avatarCatalog'

describe('avatar catalog', () => {
  it('keeps NPC appearance deterministic for the same customer key', () => {
    expect(getNpcAvatarConfig('customer-lan')).toEqual(
      getNpcAvatarConfig('customer-lan'),
    )
  })

  it('provides visually diverse NPC presets', () => {
    const signatures = new Set(
      npcAvatarPresets.map((preset) =>
        [
          preset.bodyType,
          preset.skinTone,
          preset.hairStyle,
          preset.hairColor,
          preset.topColor,
          preset.accessory,
        ].join(':'),
      ),
    )

    expect(npcAvatarPresets.length).toBeGreaterThanOrEqual(8)
    expect(signatures.size).toBe(npcAvatarPresets.length)
  })

  it('spreads a normal work queue across more than one appearance', () => {
    const keys = [
      'customer-lan',
      'customer-minh',
      'customer-thao',
      'customer-an',
      'customer-huong',
      'customer-nam',
    ]
    const configs = keys.map((key, index) =>
      getNpcAvatarConfig(key, index),
    )
    const signatures = new Set(
      configs.map((preset) =>
        [preset.skinTone, preset.hairStyle, preset.topColor].join(':'),
      ),
    )

    expect(signatures.size).toBeGreaterThanOrEqual(4)
  })
})
