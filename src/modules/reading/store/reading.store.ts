'use client'
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
  entries: Record<string, ReadingEntry>
  setStatus: (id: string, status: ReadingStatus, meta?: { title?: string; coverUrl?: string }) => void
  setProgress: (id: string, progress: number) => void
  get: (id: string) => ReadingEntry | undefined
  clearAll: () => void
}

export const useReading = create<ReadingState>()(
  persist(
    (set, get) => ({
      entries: {},
      setStatus: (id, status, meta) =>
        set((s) => {
          const prev = s.entries[id]
          const now = new Date().toISOString()
          const entry: ReadingEntry = {
            id,
            status,
            progress: status === 'COMPLETED' ? 100 : prev?.progress ?? 0,
            updatedAt: now,
            startedAt: prev?.startedAt ?? (status === 'READING' ? now : undefined),
            completedAt: status === 'COMPLETED' ? now : prev?.completedAt,
            title: meta?.title ?? prev?.title,
            coverUrl: meta?.coverUrl ?? prev?.coverUrl,
          }
          return { entries: { ...s.entries, [id]: entry } }
        }),
      setProgress: (id, progress) =>
        set((s) => {
          const prev = s.entries[id] ?? { id, status: 'READING', updatedAt: new Date().toISOString() }
          return { entries: { ...s.entries, [id]: { ...prev, progress, updatedAt: new Date().toISOString() } } }
        }),
      get: (id) => get().entries[id],
      clearAll: () => set({ entries: {} }),
    }),
    { name: 'reading:v1' }
  )
)
