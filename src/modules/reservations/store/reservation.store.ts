'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book } from '@/modules/books/domain/types'

export type Reservation = {
  id: string // bookId
  title: string
  coverUrl?: string
  queuedAt: string // ISO
  readyAt?: string // ISO (opcional: fecha estimada disp.)
  fulfilledAt?: string // ISO (cuando se convierte en préstamo)
  cancelledAt?: string // ISO
}

type ReservationsState = {
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
      reservations: {},
      reserve: (b, etaDays = 3) =>
        set((s) => {
          const now = new Date()
          const ready = new Date(now)
          ready.setDate(ready.getDate() + etaDays)
          const r: Reservation = {
            id: b.id,
            title: b.title,
            coverUrl: b.coverUrl,
            queuedAt: now.toISOString(),
            readyAt: ready.toISOString(),
          }
          return { reservations: { ...s.reservations, [b.id]: r } }
        }),
      cancel: (bookId) =>
        set((s) => {
          const r = s.reservations[bookId]
          if (!r || r.cancelledAt) return s
          return { reservations: { ...s.reservations, [bookId]: { ...r, cancelledAt: new Date().toISOString() } } }
        }),
      markReady: (bookId) =>
        set((s) => {
          const r = s.reservations[bookId]
          if (!r || r.cancelledAt) return s
          return { reservations: { ...s.reservations, [bookId]: { ...r, readyAt: new Date().toISOString() } } }
        }),
      fulfill: (bookId) =>
        set((s) => {
          const r = s.reservations[bookId]
          if (!r || r.cancelledAt || r.fulfilledAt) return s
          return { reservations: { ...s.reservations, [bookId]: { ...r, fulfilledAt: new Date().toISOString() } } }
        }),
      isReservedActive: (bookId) => {
        const r = get().reservations[bookId]
        return !!r && !r.cancelledAt && !r.fulfilledAt
      },
      clearAll: () => set({ reservations: {} }),
    }),
    { name: 'reservations:v1' }
  )
)
