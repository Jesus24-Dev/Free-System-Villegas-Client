import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Unauthorized } from '@/pages/Unauthorized'
import { NotFound } from '@/pages/NotFound'
import { AthleteList } from '@/pages/athletes/AthleteList'
import { AthleteForm } from '@/pages/athletes/AthleteForm'
import { CoachList } from '@/pages/coaches/CoachList'
import { CoachForm } from '@/pages/coaches/CoachForm'
import { GymList } from '@/pages/gyms/GymList'
import { GymForm } from '@/pages/gyms/GymForm'
import { CompetitionList } from '@/pages/competitions/CompetitionList'
import { CompetitionForm } from '@/pages/competitions/CompetitionForm'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'athletes',
        element: <AthleteList />,
      },
      {
        path: 'athletes/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AthleteForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'athletes/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AthleteForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'coaches',
        element: <CoachList />,
      },
      {
        path: 'coaches/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CoachForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'coaches/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CoachForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gyms',
        element: <GymList />,
      },
      {
        path: 'gyms/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <GymForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gyms/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <GymForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competitions',
        element: <CompetitionList />,
      },
      {
        path: 'competitions/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CompetitionForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competitions/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CompetitionForm />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
