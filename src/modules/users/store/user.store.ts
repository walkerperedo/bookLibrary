'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginWithPassword, getProfile, logout as apiLogout } from '@/modules/auth/client'

export type User = { id: number; email: string; name: string; avatar: string }

type UserState = {
  user: User | null
  loginCreds: (email: string, password: string) => Promise<void>
  hydrateFromSession: () => Promise<void>
  logout: () => void
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      async loginCreds(email, password) {
        const { profile } = await loginWithPassword(email, password)
        set({ user: { id: profile.id, email: profile.email, name: profile.name, avatar: profile.avatar } })
      },
      async hydrateFromSession() {
        try {
          const { profile } = await getProfile()
          set({ user: { id: profile.id, email: profile.email, name: profile.name, avatar: profile.avatar } })
        } catch {
          set({ user: null })
        }
      },
      async logout() {
        await apiLogout()
        set({ user: null })
      },
    }),

    { name: 'user:v2' }
  )
)
