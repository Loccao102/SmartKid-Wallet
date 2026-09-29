import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLine } from '../domain/types'

interface MissionCartState {
  carts: Record<string, CartLine[]>
  addItem: (missionId: string, productId: string) => void
  removeItem: (missionId: string, productId: string) => void
  clearCart: (missionId: string) => void
}

export const useMissionCartStore = create<MissionCartState>()(
  persist(
    (set) => ({
      carts: {},
      addItem: (missionId, productId) =>
        set((state) => {
          const cart = state.carts[missionId] ?? []
          const existing = cart.find((line) => line.productId === productId)

          const nextCart = existing
            ? cart.map((line) =>
                line.productId === productId
                  ? { ...line, quantity: line.quantity + 1 }
                  : line,
              )
            : [...cart, { productId, quantity: 1 }]

          return {
            carts: {
              ...state.carts,
              [missionId]: nextCart,
            },
          }
        }),
      removeItem: (missionId, productId) =>
        set((state) => {
          const cart = state.carts[missionId] ?? []
          const nextCart = cart
            .map((line) =>
              line.productId === productId
                ? { ...line, quantity: Math.max(0, line.quantity - 1) }
                : line,
            )
            .filter((line) => line.quantity > 0)

          return {
            carts: {
              ...state.carts,
              [missionId]: nextCart,
            },
          }
        }),
      clearCart: (missionId) =>
        set((state) => ({
          carts: {
            ...state.carts,
            [missionId]: [],
          },
        })),
    }),
    { name: 'smartkid-wallet-mission-cart-v1' },
  ),
)
