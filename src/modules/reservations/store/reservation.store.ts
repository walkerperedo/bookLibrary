'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book } from '@/modules/books/domain/types'
import { getUserKey } from '@/lib/userKey'

export type Reservation = {
  id: string
  title: string
  coverUrl?: string
  queuedAt: string
  readyAt?: string
  fulfilledAt?: string
  cancelledAt?: string
}

type ReservationsState = {
  byUser: Record<string, Record<string, Reservation>>
  reservations: Record<string, Reservation>
  reserve: (b: Pick<Book, 'id' | 'title' | 'coverUrl'>, etaDays?: number) => void
  cancel: (bookId: string) => void
  markReady: (bookId: string) => void
  fulfill: (bookId: string) => void // usado para “Tomar ahora”
  isReservedActive: (bookId: string) => boolean
  clearAll: () => void
}

export const useReservations = create<ReservationsState>()(
  persist(
    (set, get) => ({
      byUser: {},
      reservations: {},
      reserve: (b, etaDays = 3) =>
        set((s) => {
          const k = getUserKey()
          const m = { ...(s.byUser[k] ?? {}) }
          if (m[b.id] && !m[b.id].cancelledAt && !m[b.id].fulfilledAt) return s
          const now = new Date()
          const ready = new Date(now)
          ready.setDate(ready.getDate() + etaDays)
          m[b.id] = { id: b.id, title: b.title, coverUrl: b.coverUrl, queuedAt: now.toISOString(), readyAt: ready.toISOString() }
          return { byUser: { ...s.byUser, [k]: m } }
        }),
      cancel: (id) =>
        set((s) => {
          const k = getUserKey()
          const m = { ...(s.byUser[k] ?? {}) }
          const r = m[id]
          if (!r || r.cancelledAt) return s
          m[id] = { ...r, cancelledAt: new Date().toISOString() }
          return { byUser: { ...s.byUser, [k]: m } }
        }),
      markReady: (bookId) =>
        set((s) => {
          const r = s.reservations[bookId]
          if (!r || r.cancelledAt) return s
          return { reservations: { ...s.reservations, [bookId]: { ...r, readyAt: new Date().toISOString() } } }
        }),
      fulfill: (id) =>
        set((s) => {
          const k = getUserKey()
          const m = { ...(s.byUser[k] ?? {}) }
          const r = m[id]
          if (!r || r.cancelledAt || r.fulfilledAt) return s
          m[id] = { ...r, fulfilledAt: new Date().toISOString() }
          return { byUser: { ...s.byUser, [k]: m } }
        }),
      isReservedActive: (bookId) => {
        const r = get().reservations[bookId]
        return !!r && !r.cancelledAt && !r.fulfilledAt
      },
      clearAll: () => set({ reservations: {} }),
    }),
    { name: 'reservations:v2' }
  )
)
