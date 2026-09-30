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
  production: {
    party: '/assets/production/class-party.svg',
    employee: '/assets/production/employee.svg',
    employeeGreen: '/assets/production/employee-green.svg',
    customers: [1, 2, 3, 4, 5, 6].map((id) => `/assets/production/customer-${id}.svg`),
    products: {
      'products.fruits.bananaBunch': '/assets/production/banana-bunch.svg',
      'products.fruits.appleBag': '/assets/production/apple-bag.svg',
      'products.fruits.orangeBag': '/assets/production/orange-bag.svg',
      'products.fruits.grapeBox': '/assets/production/grape-box.svg',
      'products.food.breadBasket': '/assets/production/bread-basket.svg',
      'products.food.cupcakeBox': '/assets/production/cupcake-box.svg',
      'products.food.yogurtPack': '/assets/production/yogurt-pack.svg',
      'products.food.sandwichBox': '/assets/production/sandwich-box.svg',
      'products.drinks.waterPack': '/assets/production/water-pack.svg',
      'products.drinks.milkPack': '/assets/production/milk-pack.svg',
      'products.drinks.teaPack': '/assets/production/tea-pack.svg',
      'products.drinks.juicePack': '/assets/production/juice-pack.svg',
      'products.supplies.paperCups': '/assets/production/paper-cups.svg',
      'products.supplies.napkins': '/assets/production/napkins.svg',
    } as Record<string, string>,
    student: '/assets/production/student.svg',
    landscape: '/assets/production/world-landscape.svg',
    hubFloor: '/assets/production/hub-floor.svg',
    maps: {
      smartmart: '/assets/production/smartmart.svg',
      'tiny-bank': '/assets/production/tiny-bank.svg',
      'happy-restaurant': '/assets/production/happy-restaurant.svg',
      'weekend-market': '/assets/production/weekend-market.svg',
    },
    stalls: {
      produce: '/assets/production/stall-produce.svg',
      food: '/assets/production/stall-food.svg',
      drinks: '/assets/production/stall-drinks.svg',
      supplies: '/assets/production/stall-supplies.svg',
      promotion: '/assets/production/stall-promotion.svg',
    },
  },
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
