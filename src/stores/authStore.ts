import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { JwtPayload } from '@/types'

interface AuthState {
  token: string | null
  user: JwtPayload | null
  setAuth: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token: string) => {
        try {
          const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]))
          set({ token, user: payload })
        } catch {
          console.error('Invalid token')
        }
      },
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => get().token !== null,
      hasRole: (role: string) => get().user?.role === role,
    }),
    { name: 'auth-storage' }
  )
)
