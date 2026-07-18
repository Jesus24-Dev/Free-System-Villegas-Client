import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileDto } from '@/types'

interface AuthState {
  token: string | null
  user: ProfileDto | null
  gymId: string | null
  isGymOwner: boolean
  viewAs: 'COACH' | 'ATHLETE' | null
  setAuth: (token: string) => void
  setUserFromProfile: (profile: ProfileDto) => void
  setGymContext: (gymId: string, isOwner: boolean) => void
  setViewAs: (view: 'COACH' | 'ATHLETE') => void
  logout: () => void
  isAuthenticated: () => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  getUserRoles: () => string[]
  getEffectiveRole: () => string
}

function extractAllRoles(profile: ProfileDto): string[] {
  const role: unknown = profile.role
  if (Array.isArray(role)) {
    return role.map(r => String(r).toUpperCase())
  }
  if (typeof role === 'string') {
    return [role.toUpperCase()]
  }
  return []
}

function extractRole(profile: ProfileDto): string {
  const roles = extractAllRoles(profile)
  return roles[0] || ''
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      gymId: null,
      isGymOwner: false,
      viewAs: null,
      setAuth: (token: string) => {
        set({ token })
      },
      setUserFromProfile: (profile: ProfileDto) => {
        set({ user: profile })
      },
      setGymContext: (gymId: string, isOwner: boolean) => {
        set({ gymId, isGymOwner: isOwner })
      },
      setViewAs: (view: 'COACH' | 'ATHLETE') => {
        set({ viewAs: view })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, gymId: null, isGymOwner: false, viewAs: null })
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
      hasAnyRole: (roles: string[]) => {
        const user = get().user
        if (!user) return false
        const userRoles = extractAllRoles(user)
        return roles.some(r => userRoles.includes(r.toUpperCase()))
      },
      getUserRoles: () => {
        const user = get().user
        if (!user) return []
        return extractAllRoles(user)
      },
      getEffectiveRole: () => {
        const { user, viewAs } = get()
        if (!user) return ''
        const userRoles = extractAllRoles(user)
        if (viewAs && userRoles.includes(viewAs)) {
          return viewAs
        }
        return extractRole(user)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        gymId: state.gymId,
        isGymOwner: state.isGymOwner,
        viewAs: state.viewAs,
      }),
    }
  )
)

export { extractRole, extractAllRoles }
