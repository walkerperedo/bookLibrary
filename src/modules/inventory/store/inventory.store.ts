'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InventoryItem = {
  id: string
  status: 'AVAILABLE' | 'ON_LOAN'
  loanedBy?: string
  loanedAt?: string
  dueAt?: string
}

type InvState = {
  items: Record<string, InventoryItem>
  borrow: (b: { id: string }, userKey: string, days?: number) => boolean
  returnBook: (bookId: string, userKey: string) => boolean
  renew: (bookId: string, userKey: string, extraDays?: number) => boolean
  whoHas: (bookId: string) => string | undefined
}

export const useInventory = create<InvState>()(
  persist(
    (set, get) => ({
      items: {},
      borrow: (b, userKey, days = 14) => {
        const cur = get().items[b.id]
        if (cur?.status === 'ON_LOAN' && cur.loanedBy && cur.loanedBy !== userKey) return false
        const now = new Date()
        const due = new Date(now)
        due.setDate(due.getDate() + days)
        set((s) => ({
          items: {
            ...s.items,
            [b.id]: { id: b.id, status: 'ON_LOAN', loanedBy: userKey, loanedAt: now.toISOString(), dueAt: due.toISOString() },
          },
        }))
        return true
      },
      returnBook: (bookId, userKey) => {
        const cur = get().items[bookId]
        if (!cur || cur.status !== 'ON_LOAN' || cur.loanedBy !== userKey) return false
        set((s) => ({
          items: { ...s.items, [bookId]: { id: bookId, status: 'AVAILABLE' } },
        }))
        return true
      },
      renew: (bookId, userKey, extraDays = 7) => {
        const cur = get().items[bookId]
        if (!cur || cur.status !== 'ON_LOAN' || cur.loanedBy !== userKey || !cur.dueAt) return false
        const due = new Date(cur.dueAt)
        due.setDate(due.getDate() + extraDays)
        set((s) => ({
          items: { ...s.items, [bookId]: { ...cur, dueAt: due.toISOString() } },
        }))
        return true
      },
      whoHas: (bookId) => get().items[bookId]?.loanedBy,
    }),
    { name: 'inventory:v1' } // <- shared per browser
  )
)
