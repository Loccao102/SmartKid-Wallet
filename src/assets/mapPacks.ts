import type { MapId } from '../domain/types'

export interface MapAssetPack {
  version: 1
  theme: 'mint' | 'lavender' | 'coral' | 'sunflower'
  scene: string
  thumbnail: string
  landmark: string
  description: string
}

/** Each chapter owns its art; only shared UI and avatar layers cross maps. */
export const mapAssetPacks = {
  smartmart: {
    version: 1, theme: 'mint',
    scene: '/assets/maps/smartmart/scene.webp',
    thumbnail: '/assets/maps/smartmart/thumbnail.webp',
    landmark: '/assets/maps/smartmart/landmark.svg',
    description: 'Siêu thị xanh giữa khu vườn đầy nắng',
  },
  'tiny-bank': {
    version: 1, theme: 'lavender',
    scene: '/assets/maps/tiny-bank/scene.webp',
    thumbnail: '/assets/maps/tiny-bank/thumbnail.webp',
    landmark: '/assets/maps/tiny-bank/landmark.svg',
    description: 'Ngân hàng mái tím bên dòng sông nhỏ',
  },
  'happy-restaurant': {
    version: 1, theme: 'coral',
    scene: '/assets/maps/happy-restaurant/scene.webp',
    thumbnail: '/assets/maps/happy-restaurant/thumbnail.webp',
    landmark: '/assets/maps/happy-restaurant/landmark.svg',
    description: 'Nhà hàng màu đào với vườn rau thơm',
  },
  'weekend-market': {
    version: 1, theme: 'sunflower',
    scene: '/assets/maps/weekend-market/scene.webp',
    thumbnail: '/assets/maps/weekend-market/thumbnail.webp',
    landmark: '/assets/maps/weekend-market/landmark.svg',
    description: 'Khu chợ mái vàng giữa vườn hoa hướng dương',
  },
} as const satisfies Record<MapId, MapAssetPack>
