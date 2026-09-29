/**
 * Canonical asset paths for SmartKid Wallet.
 *
 * MVP rule:
 * - Stable game assets live under /public/assets and are versioned with code.
 * - CMS/user-managed media can move to Supabase Storage later.
 * - UI/components should resolve assets through this registry instead of
 *   scattering string paths throughout the app.
 */
export const gameAssets = {
  brand: {
    logo: '/assets/brand/logo.webp',
    mascot: '/assets/brand/mascot/star-guide.webp',
  },
  maps: {
    smartmart: {
      thumbnail: '/assets/maps/smartmart/thumbnail.webp',
      background: '/assets/maps/smartmart/background.webp',
    },
    tinyBank: {
      thumbnail: '/assets/maps/tiny-bank/thumbnail-locked.webp',
    },
    happyRestaurant: {
      thumbnail: '/assets/maps/happy-restaurant/thumbnail-locked.webp',
    },
    weekendMarket: {
      thumbnail: '/assets/maps/weekend-market/thumbnail-locked.webp',
    },
  },
  stalls: {
    produce: {
      icon: '/assets/stalls/produce/icon.webp',
      booth: '/assets/stalls/produce/booth.webp',
    },
    food: {
      icon: '/assets/stalls/food/icon.webp',
      booth: '/assets/stalls/food/booth.webp',
    },
    drinks: {
      icon: '/assets/stalls/drinks/icon.webp',
      booth: '/assets/stalls/drinks/booth.webp',
    },
    supplies: {
      icon: '/assets/stalls/supplies/icon.webp',
      booth: '/assets/stalls/supplies/booth.webp',
    },
    promotion: {
      icon: '/assets/stalls/promotion/icon.webp',
      booth: '/assets/stalls/promotion/booth.webp',
    },
  },
} as const

export type GameAssetRegistry = typeof gameAssets
