'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WishlistItem = {
  id: string
  title: string
  coverUrl?: string
  addedAt: string
}

type WishlistState = {
  items: Record<string, WishlistItem>
  add: (b: { id: string; title: string; coverUrl?: string }) => void
  remove: (id: string) => void
  toggle: (b: { id: string; title: string; coverUrl?: string }) => void
  list: () => WishlistItem[]
  has: (id: string) => boolean
  clearAll: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (b) =>
        set((s) => {
          if (s.items[b.id]) return s
          const w: WishlistItem = { ...b, addedAt: new Date().toISOString() }
          return { items: { ...s.items, [b.id]: w } }
        }),
      remove: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.items
          return { items: rest }
        }),
      toggle: (b) =>
        set((s) => {
          const exists = !!s.items[b.id]
          if (exists) {
            const { [b.id]: _, ...rest } = s.items
            return { items: rest }
          }
          const w: WishlistItem = { ...b, addedAt: new Date().toISOString() }
          return { items: { ...s.items, [b.id]: w } }
        }),
      list: () => Object.values(get().items).sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
      has: (id) => !!get().items[id],
      clearAll: () => set({ items: {} }),
    }),
    { name: 'wishlist:v1' }
  )
)
