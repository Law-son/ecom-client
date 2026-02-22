import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSessionStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      tokenType: null,
      expiresAt: null,
      login: (user, role, auth = {}) =>
        set({
          user,
          role,
          accessToken: auth.accessToken ?? user?.accessToken ?? null,
          refreshToken: auth.refreshToken ?? user?.refreshToken ?? null,
          tokenType: auth.tokenType ?? user?.tokenType ?? 'Bearer',
          expiresAt: auth.expiresAt ?? user?.expiresAt ?? null,
        }),
      updateTokens: (auth) =>
        set((state) => ({
          accessToken: auth.accessToken ?? state.accessToken,
          refreshToken: auth.refreshToken ?? state.refreshToken,
          expiresAt: auth.expiresAt ?? state.expiresAt,
        })),
      logout: () =>
        set({
          user: null,
          role: null,
          accessToken: null,
          refreshToken: null,
          tokenType: null,
          expiresAt: null,
        }),
      isTokenExpired: () => {
        const state = useSessionStore.getState()
        if (!state.expiresAt) return false
        return Date.now() >= state.expiresAt
      },
    }),
    {
      name: 'ecom-session',
    },
  ),
)

export default useSessionStore

