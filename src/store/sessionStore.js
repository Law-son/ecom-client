import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSessionStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      accessToken: null,
      tokenType: null,
      expiresAt: null,
      login: (user, role, auth = {}) =>
        set({
          user,
          role,
          accessToken: auth.accessToken ?? user?.accessToken ?? null,
          tokenType: auth.tokenType ?? user?.tokenType ?? 'Bearer',
          expiresAt: auth.expiresAt ?? user?.expiresAt ?? null,
        }),
      logout: () =>
        set({
          user: null,
          role: null,
          accessToken: null,
          tokenType: null,
          expiresAt: null,
        }),
    }),
    {
      name: 'ecom-session',
    },
  ),
)

export default useSessionStore

