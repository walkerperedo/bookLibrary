'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Reservation = {
  reservedBy: string
  startAt: string
  endAt: string
  title?: string
  coverUrl?: string
}

export type InventoryItem = {
  id: string
  status: 'AVAILABLE' | 'ON_LOAN'
  loanedBy?: string
  loanedAt?: string
  dueAt?: string
  reservation?: Reservation
}

function addDays(d: Date, n: number) {
  const dd = new Date(d)
  dd.setDate(dd.getDate() + n)
  return dd
}

function isFuture(d?: string) {
  return !!d && new Date(d).getTime() > Date.now()
}
function isPast(d?: string) {
  return !!d && new Date(d).getTime() < Date.now()
}

type InvState = {
  items: Record<string, InventoryItem>

  borrow: (b: { id: string }, userKey: string, days?: number) => boolean
  returnBook: (bookId: string, userKey: string) => boolean
  renew: (bookId: string, userKey: string, extraDays?: number) => boolean

  reserve: (book: { id: string; title?: string; coverUrl?: string }, userKey: string, holdDays?: number) => boolean
  cancelReservation: (bookId: string, userKey: string) => boolean

  whoHas: (bookId: string) => string | undefined
  getItem: (bookId: string) => InventoryItem | undefined
  canBorrow: (bookId: string, userKey: string) => boolean
}

export const useInventory = create<InvState>()(
  persist(
    (set, get) => ({
      items: {},
      borrow: (b, userKey, days = 14) => {
        const now = new Date()
        const item = get().items[b.id]

        if (item?.reservation) {
          const { reservedBy, startAt, endAt } = item.reservation
          const notExpired = isFuture(endAt)
          if (notExpired) {
            if (now < new Date(startAt)) return false
            if (reservedBy !== userKey) return false
            if (item.status === 'ON_LOAN') return false
          } else {
            set((s) => {
              const it = s.items[b.id]
              if (!it) return s as any
              const { reservation, ...rest } = it
              return { items: { ...s.items, [b.id]: rest } }
            })
          }
        }

        if (item?.status === 'ON_LOAN' && item?.loanedBy !== userKey) return false

        const due = addDays(now, days)
        set((s) => ({
          items: {
            ...s.items,
            [b.id]: {
              id: b.id,
              status: 'ON_LOAN',
              loanedBy: userKey,
              loanedAt: now.toISOString(),
              dueAt: due.toISOString(),
              reservation: item?.reservation && item.reservation.reservedBy === userKey ? undefined : item?.reservation,
            },
          },
        }))
        return true
      },
      returnBook: (bookId, userKey) => {
        const item = get().items[bookId]
        if (!item || item.status !== 'ON_LOAN' || item.loanedBy !== userKey) return false

        const now = new Date()
        set((s) => {
          const it = s.items[bookId]
          if (!it) return s as any

          let reservation = it.reservation
          if (reservation) {
            const newStart = now
            const newEnd = addDays(newStart, 14)
            reservation = { ...reservation, startAt: newStart.toISOString(), endAt: newEnd.toISOString() }
          }

          return {
            items: {
              ...s.items,
              [bookId]: {
                id: bookId,
                status: 'AVAILABLE',
                reservation,
              },
            },
          }
        })
        return true
      },
      renew: (bookId, userKey, extraDays = 7) => {
        const item = get().items[bookId]
        if (!item || item.status !== 'ON_LOAN' || item.loanedBy !== userKey || !item.dueAt) return false

        set((s) => {
          const it = s.items[bookId]
          if (!it) return s as any
          const newDue = addDays(new Date(it.dueAt!), extraDays)
          let reservation = it.reservation
          if (reservation && new Date(reservation.startAt).getTime() >= new Date(it.dueAt!).getTime()) {
            const start = newDue
            const end = addDays(start, 14)
            reservation = { ...reservation, startAt: start.toISOString(), endAt: end.toISOString() }
          }
          return {
            items: {
              ...s.items,
              [bookId]: { ...it, dueAt: newDue.toISOString(), reservation },
            },
          }
        })
        return true
      },
      reserve: (book, userKey, holdDays = 14) => {
        const now = new Date()
        const item = get().items[book.id]

        if (item?.reservation && isFuture(item.reservation.endAt)) return false

        const start = item?.status === 'ON_LOAN' && item?.dueAt ? new Date(item.dueAt) : now
        const end = addDays(start, holdDays)

        set((s) => ({
          items: {
            ...s.items,
            [book.id]: {
              id: book.id,
              status: item?.status ?? 'AVAILABLE',
              loanedBy: item?.loanedBy,
              loanedAt: item?.loanedAt,
              dueAt: item?.dueAt,
              reservation: {
                reservedBy: userKey,
                startAt: start.toISOString(),
                endAt: end.toISOString(),
                title: book.title,
                coverUrl: book.coverUrl,
              },
            },
          },
        }))
        return true
      },
      cancelReservation: (bookId, userKey) => {
        const item = get().items[bookId]
        if (!item?.reservation || item.reservation.reservedBy !== userKey) return false
        set((s) => {
          const { reservation, ...rest } = s.items[bookId]
          return {
            items: {
              ...s.items,
              [bookId]: { ...rest },
            },
          }
        })
        return true
      },

      getItem: (bookId) => get().items[bookId],
      canBorrow: (bookId, userKey) => {
        const item = get().items[bookId]
        if (!item) return true
        if (item.status === 'ON_LOAN' && item.loanedBy !== userKey) return false
        const reservation = item.reservation
        if (!reservation || isPast(reservation.endAt)) return item.status === 'AVAILABLE'

        const now = new Date()
        if (now < new Date(reservation.startAt)) return false
        if (now >= new Date(reservation.startAt) && now <= new Date(reservation.endAt)) {
          return reservation.reservedBy === userKey && item.status === 'AVAILABLE'
        }
        return item.status === 'AVAILABLE'
      },
      whoHas: (bookId) => get().items[bookId]?.loanedBy,
    }),
    { name: 'inventory:v1' } // <- shared per browser
  )
)
