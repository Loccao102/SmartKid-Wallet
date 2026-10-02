import { describe, expect, it } from 'vitest'
import { worldMaps } from '../data/worldMaps'
import { mapAssetPacks } from './mapPacks'

const shippedAssets = import.meta.glob('/public/assets/maps/**/*', { eager: true, query: '?url', import: 'default' })

describe('map asset packs', () => {
  it('ships distinct, versioned art for every destination without cross-map paths', () => {
    const scenes = new Set<string>()
    for (const map of worldMaps) {
      const pack = mapAssetPacks[map.id]
      expect(pack.version).toBe(1)
      for (const key of ['scene', 'thumbnail', 'landmark'] as const) {
        expect(pack[key]).toContain(`/assets/maps/${map.id}/`)
        expect(shippedAssets).toHaveProperty('/public' + pack[key])
      }
      scenes.add(pack.scene)
    }
    expect(scenes.size).toBe(worldMaps.length)
  })
})
