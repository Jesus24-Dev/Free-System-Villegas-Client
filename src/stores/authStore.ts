import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileDto } from '@/types'

interface AuthState {
  token: string | null
  user: ProfileDto | null
  gymId: string | null
  isGymOwner: boolean
  setAuth: (token: string) => void
  setUserFromProfile: (profile: ProfileDto) => void
  setGymContext: (gymId: string, isOwner: boolean) => void
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
      gymId: null,
      isGymOwner: false,
      setAuth: (token: string) => {
        set({ token })
      },
      setUserFromProfile: (profile: ProfileDto) => {
        set({ user: profile })
      },
      setGymContext: (gymId: string, isOwner: boolean) => {
        set({ gymId, isGymOwner: isOwner })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, gymId: null, isGymOwner: false })
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
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        gymId: state.gymId,
        isGymOwner: state.isGymOwner,
      }),
    }
  )
)

export { extractRole }
