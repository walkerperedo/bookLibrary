'use client'
import { getUserKey } from '@/lib/userKey'
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
  byUser: Record<string, Record<string, WishlistItem>>
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: {},
      byUser: {},
      add: (b) =>
        set((s) => {
          const k = getUserKey()
          const m = s.byUser[k] ?? {}
          if (m[b.id]) return s
          const w: WishlistItem = { ...b, addedAt: new Date().toISOString() }
          return { byUser: { ...s.byUser, [k]: { ...m, [b.id]: w } } };
        }),
      remove: (id) =>
        set((s) => {
          const k = getUserKey();
          const m = { ...(s.byUser[k] ?? {}) };
          delete m[id];
          return { byUser: { ...s.byUser, [k]: m } };
        }),
      toggle: (b) =>
        set((s) => {
          const k = getUserKey();
          const m = { ...(s.byUser[k] ?? {}) };
          if (m[b.id]) { delete m[b.id]; return { byUser: { ...s.byUser, [k]: m } }; }
          m[b.id] = { ...b, addedAt: new Date().toISOString() };
          return { byUser: { ...s.byUser, [k]: m } };
        }),
      list: () => Object.values(get().items).sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
      has: (id) => !!get().items[id],
      clearAll: () => set({ items: {} }),
    }),
    { name: 'wishlist:v2' }
  )
)
