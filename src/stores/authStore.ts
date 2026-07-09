import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileDto } from '@/types'

interface AuthState {
  token: string | null
  user: ProfileDto | null
  setAuth: (token: string) => void
  setUserFromProfile: (profile: ProfileDto) => void
  logout: () => void
  isAuthenticated: () => boolean
  hasRole: (role: string) => boolean
}

function extractRole(profile: ProfileDto): string {
  const role: unknown = profile.role
  // role comes as array from API: ["ATHLETE"]
  if (Array.isArray(role) && role.length > 0) {
    return String(role[0]).toUpperCase()
  }
  if (typeof role === 'string') {
    return role.toUpperCase()
  }
  return ''
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token: string) => {
        set({ token })
      },
      setUserFromProfile: (profile: ProfileDto) => {
        set({ user: profile })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
      isAuthenticated: () => {
        const token = get().token
        const user = get().user
        return token !== null && user !== null
      },
      hasRole: (role: string) => {
        const user = get().user
        if (!user) return false
        const userRole = extractRole(user)
        return userRole === role.toUpperCase()
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)

export { extractRole }
