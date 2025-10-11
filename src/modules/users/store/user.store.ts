'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = { id: number; email: string; name: string; avatar: string };

type UserState = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      login: (u) => set({ user: u }),
      logout: () => set({ user: null })
    }),
    { name: 'user:v1' }
  )
);
