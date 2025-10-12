'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book } from '@/modules/books/domain/types'
import { getUserKey } from '@/lib/userKey'
import { useInventory } from '@/modules/inventory/store/inventory.store'

export type Loan = {
  id: string
  title: string
  coverUrl?: string
  loanedAt: string
  dueAt: string
  returnedAt?: string
}

type LoansState = {
  byUser: Record<string, Record<string, Loan>>
  loans: Record<string, Loan>
  issue: (b: Pick<Book, 'id' | 'title' | 'coverUrl'>, days?: number) => boolean
  renew: (bookId: string, extraDays?: number) => boolean
  return: (bookId: string) => boolean
  isOnLoan: (bookId: string) => boolean
  clearAll: () => void // solo para testing
}

export const useLoans = create<LoansState>()(
  persist(
    (set, get) => ({
      byUser: {},
      loans: {},
      issue: (b, days = 14) => {
        const k = getUserKey()
        // try to borrow globally
        const ok = useInventory.getState().borrow({ id: b.id }, k, days)
        if (!ok) return false
        // record into personal history
        const inv = useInventory.getState().items[b.id]!
        set((s) => {
          const m = { ...(s.byUser[k] ?? {}) }
          m[b.id] = { id: b.id, title: b.title, coverUrl: b.coverUrl, loanedAt: inv.loanedAt!, dueAt: inv.dueAt! }
          return { byUser: { ...s.byUser, [k]: m } }
        })
        return true
      },
      renew: (id, extraDays = 7) => {
        const k = getUserKey()
        const ok = useInventory.getState().renew(id, k, extraDays)
        if (!ok) return false
        const inv = useInventory.getState().items[id]!
        set((s) => {
          const m = { ...(s.byUser[k] ?? {}) }
          if (m[id]) m[id] = { ...m[id], dueAt: inv.dueAt! }
          return { byUser: { ...s.byUser, [k]: m } }
        })
        return true
      },
      return: (id) => {
        const k = getUserKey()
        const ok = useInventory.getState().returnBook(id, k)
        if (!ok) return false
        set((s) => {
          const m = { ...(s.byUser[k] ?? {}) }
          if (m[id] && !m[id].returnedAt) m[id] = { ...m[id], returnedAt: new Date().toISOString() }
          return { byUser: { ...s.byUser, [k]: m } }
        })
        return true
      },
      isOnLoan: (bookId) => {
        const l = get().loans[bookId]
        return !!l && !l.returnedAt
      },
      clearAll: () => set({ loans: {} }),
    }),
    { name: 'loans:v1' }
  )
)
