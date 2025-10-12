'use client'
import { getUserKey } from '@/lib/userKey'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReadingStatus = 'WISHLIST' | 'READING' | 'COMPLETED'
export type ReadingEntry = {
  id: string
  status: ReadingStatus
  progress?: number
  updatedAt: string
  startedAt?: string
  completedAt?: string
  title?: string
  coverUrl?: string
}

type ReadingState = {
  byUser: Record<string, Record<string, ReadingEntry>>
  entries: Record<string, ReadingEntry>
  setStatus: (id: string, status: ReadingStatus, meta?: { title?: string; coverUrl?: string }) => void
  setProgress: (id: string, progress: number) => void
  get: (id: string) => ReadingEntry | undefined
  clearAll: () => void
}

export const useReading = create<ReadingState>()(
  persist(
    (set, get) => ({
      byUser: {},
      entries: {},
      setStatus: (id, status, meta) =>
        set((s) => {
          const k = getUserKey()
          const userMap = { ...(s.byUser[k] ?? {}) }
          const prev = userMap[id]
          const now = new Date().toISOString()
          userMap[id] = {
            id,
            status,
            progress: status === 'COMPLETED' ? 100 : prev?.progress ?? 0,
            updatedAt: now,
            startedAt: prev?.startedAt ?? (status === 'READING' ? now : undefined),
            completedAt: status === 'COMPLETED' ? now : prev?.completedAt,
            title: meta?.title ?? prev?.title,
            coverUrl: meta?.coverUrl ?? prev?.coverUrl,
          }
          return { byUser: { ...s.byUser, [k]: userMap } }
        }),
      setProgress: (id, progress) =>
        set((s) => {
          const k = getUserKey()
          const userMap = { ...(s.byUser[k] ?? {}) }
          const prev = userMap[id] ?? { id, status: 'READING', updatedAt: new Date().toISOString() }
          userMap[id] = { ...prev, progress, updatedAt: new Date().toISOString() }
          return { byUser: { ...s.byUser, [k]: userMap } }
        }),
      get: (id) => get().entries[id],
      clearAll: () => set({ entries: {} }),
    }),
    { name: 'reading:v2' }
  )
)
