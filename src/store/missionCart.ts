import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLine } from '../domain/types'

interface MissionCartState {
  carts: Record<string, CartLine[]>
  revealedEventIdsByMission: Record<string, string[]>
  addItem: (missionId: string, productId: string) => void
  removeItem: (missionId: string, productId: string) => void
  revealEvents: (missionId: string, eventIds: string[]) => void
  clearCart: (missionId: string) => void
}

const initialState = {
  carts: {} as Record<string, CartLine[]>,
  revealedEventIdsByMission: {} as Record<string, string[]>,
}

export const useMissionCartStore = create<MissionCartState>()(
  persist(
    (set) => ({
      ...initialState,
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
      revealEvents: (missionId, eventIds) =>
        set((state) => {
          const current = state.revealedEventIdsByMission?.[missionId] ?? []
          const merged = Array.from(new Set([...current, ...eventIds]))
          if (merged.length === current.length) return state

          return {
            revealedEventIdsByMission: {
              ...(state.revealedEventIdsByMission ?? {}),
              [missionId]: merged,
            },
          }
        }),
      clearCart: (missionId) =>
        set((state) => ({
          carts: {
            ...state.carts,
            [missionId]: [],
          },
          revealedEventIdsByMission: {
            ...(state.revealedEventIdsByMission ?? {}),
            [missionId]: [],
          },
        })),
    }),
    {
      name: 'smartkid-wallet-mission-cart-v1',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<MissionCartState> | undefined
        return {
          ...initialState,
          ...state,
          carts: state?.carts ?? {},
          revealedEventIdsByMission:
            state?.revealedEventIdsByMission ?? {},
        }
      },
    },
  ),
)
