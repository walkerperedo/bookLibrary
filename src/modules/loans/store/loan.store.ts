'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book } from '@/modules/books/domain/types'

export type Loan = {
  id: string
  title: string
  coverUrl?: string
  loanedAt: string
  dueAt: string
  returnedAt?: string
}

type LoansState = {
  loans: Record<string, Loan>
  issue: (b: Pick<Book, 'id' | 'title' | 'coverUrl'>, days?: number) => void
  renew: (bookId: string, extraDays?: number) => void
  return: (bookId: string) => void
  isOnLoan: (bookId: string) => boolean
  clearAll: () => void // solo para testing
}

export const useLoans = create<LoansState>()(
  persist(
    (set, get) => ({
      loans: {},
      issue: (b, days = 14) =>
        set((s) => {
          if (s.loans[b.id] && !s.loans[b.id].returnedAt) return s // ya prestado
          const now = new Date()
          const due = new Date(now)
          due.setDate(now.getDate() + days)
          const loan: Loan = {
            id: b.id,
            title: b.title,
            coverUrl: b.coverUrl,
            loanedAt: now.toISOString(),
            dueAt: due.toISOString(),
          }
          return { loans: { ...s.loans, [b.id]: loan } }
        }),
      renew: (bookId, extraDays = 7) =>
        set((s) => {
          const cur = s.loans[bookId]
          if (!cur || cur.returnedAt) return s
          const due = new Date(cur.dueAt)
          due.setDate(due.getDate() + extraDays)
          return { loans: { ...s.loans, [bookId]: { ...cur, dueAt: due.toISOString() } } }
        }),
      return: (bookId) =>
        set((s) => {
          const cur = s.loans[bookId]
          if (!cur || cur.returnedAt) return s
          return { loans: { ...s.loans, [bookId]: { ...cur, returnedAt: new Date().toISOString() } } }
        }),
      isOnLoan: (bookId) => {
        const l = get().loans[bookId]
        return !!l && !l.returnedAt
      },
      clearAll: () => set({ loans: {} }),
    }),
    { name: 'loans:v1' }
  )
)
