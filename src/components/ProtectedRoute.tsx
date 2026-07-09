import { Navigate } from 'react-router-dom'
import { useAuthStore, extractRole } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'COACH' | 'ATHLETE'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const userRole = extractRole(user)
    const required = requiredRole.toUpperCase()

    if (userRole !== required) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()

  if (token && user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
