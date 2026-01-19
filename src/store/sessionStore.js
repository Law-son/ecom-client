import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSessionStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      login: (user, role) => set({ user, role }),
      logout: () => set({ user: null, role: null }),
    }),
    {
      name: 'ecom-session',
    },
  ),
)

export default useSessionStore

