import { mapAssetPacks } from './mapPacks'
export { mapAssetPacks } from './mapPacks'
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
  characterKits: {
    chibiRpgV1: {
      version: '1.0.0',
      manifest: '/assets/characters/chibi-rpg/v1/manifest.json',
      referenceSheet: '/assets/characters/chibi-rpg/v1/reference-sheet.png',
    },
  },
  production: {
    party: '/assets/maps/smartmart/environment/class-party.svg',
    employee: '/assets/production/employee.svg',
    employeeGreen: '/assets/production/employee-green.svg',
    customers: [1, 2, 3, 4, 5, 6].map((id) => `/assets/production/customer-${id}.svg`),
    products: {
      'products.fruits.bananaBunch': '/assets/maps/smartmart/products/banana-bunch.svg',
      'products.fruits.appleBag': '/assets/maps/smartmart/products/apple-bag.svg',
      'products.fruits.orangeBag': '/assets/maps/smartmart/products/orange-bag.svg',
      'products.fruits.grapeBox': '/assets/maps/smartmart/products/grape-box.svg',
      'products.food.breadBasket': '/assets/maps/smartmart/products/bread-basket.svg',
      'products.food.cupcakeBox': '/assets/maps/smartmart/products/cupcake-box.svg',
      'products.food.yogurtPack': '/assets/maps/smartmart/products/yogurt-pack.svg',
      'products.food.sandwichBox': '/assets/maps/smartmart/products/sandwich-box.svg',
      'products.drinks.waterPack': '/assets/maps/smartmart/products/water-pack.svg',
      'products.drinks.milkPack': '/assets/maps/smartmart/products/milk-pack.svg',
      'products.drinks.teaPack': '/assets/maps/smartmart/products/tea-pack.svg',
      'products.drinks.juicePack': '/assets/maps/smartmart/products/juice-pack.svg',
      'products.supplies.paperCups': '/assets/maps/smartmart/products/paper-cups.svg',
      'products.supplies.napkins': '/assets/maps/smartmart/products/napkins.svg',
    } as Record<string, string>,
    student: '/assets/production/student.svg',
    landscape: '/assets/production/world-landscape.svg',
    hubFloor: '/assets/maps/smartmart/environment/floor.svg',
    maps: {
      smartmart: mapAssetPacks['smartmart'].landmark,
      'tiny-bank': mapAssetPacks['tiny-bank'].landmark,
      'happy-restaurant': mapAssetPacks['happy-restaurant'].landmark,
      'weekend-market': mapAssetPacks['weekend-market'].landmark,
    },
    stalls: {
      produce: '/assets/maps/smartmart/stalls/produce.svg',
      food: '/assets/maps/smartmart/stalls/food.svg',
      drinks: '/assets/maps/smartmart/stalls/drinks.svg',
      supplies: '/assets/maps/smartmart/stalls/supplies.svg',
      promotion: '/assets/maps/smartmart/stalls/promotion.svg',
    },
  },
  maps: {
    smartmart: {
      thumbnail: mapAssetPacks.smartmart.thumbnail,
      background: mapAssetPacks.smartmart.scene,
    },
    tinyBank: {
      thumbnail: mapAssetPacks['tiny-bank'].thumbnail,
      playground: '/assets/maps/tiny-bank/playground-v1.webp',
      playgroundSmall: '/assets/maps/tiny-bank/playground-v1-small.webp',
      playgroundDescription: 'Khu vườn ngân hàng với hũ tiết kiệm, quầy gửi rút, vườn đồng xu và bàn kế hoạch quanh quảng trường.',
    },
    happyRestaurant: {
      thumbnail: mapAssetPacks['happy-restaurant'].thumbnail,
    },
    weekendMarket: {
      thumbnail: mapAssetPacks['weekend-market'].thumbnail,
    },
  },
  stalls: {
    produce: {
      icon: '/assets/maps/smartmart/stalls/produce.svg',
      booth: '/assets/maps/smartmart/stalls/produce.svg',
    },
    food: {
      icon: '/assets/maps/smartmart/stalls/food.svg',
      booth: '/assets/maps/smartmart/stalls/food.svg',
    },
    drinks: {
      icon: '/assets/maps/smartmart/stalls/drinks.svg',
      booth: '/assets/maps/smartmart/stalls/drinks.svg',
    },
    supplies: {
      icon: '/assets/maps/smartmart/stalls/supplies.svg',
      booth: '/assets/maps/smartmart/stalls/supplies.svg',
    },
    promotion: {
      icon: '/assets/maps/smartmart/stalls/promotion.svg',
      booth: '/assets/maps/smartmart/stalls/promotion.svg',
    },
  },
} as const

export type GameAssetRegistry = typeof gameAssets
