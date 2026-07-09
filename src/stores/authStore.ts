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

function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    const role = payload.role || payload.roles?.[0] || 'ATHLETE'

    return {
      sub: payload.sub || payload.userId || payload.id || '',
      email: payload.email || '',
      role: role as JwtPayload['role'],
    }
  } catch {
    console.error('Invalid token format')
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token: string) => {
        const payload = decodeToken(token)
        if (payload) {
          set({ token, user: payload })
        }
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
      isAuthenticated: () => get().token !== null,
      hasRole: (role: string) => get().user?.role === role,
    }),
    { name: 'auth-storage' }
  )
)
