import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Unauthorized } from '@/pages/Unauthorized'
import { NotFound } from '@/pages/NotFound'
import { AthletesPage } from '@/pages/athletes'
import { EditAthletePage } from '@/pages/athletes/edit'
import { CoachesPage } from '@/pages/coaches'
import { GymsPage } from '@/pages/gyms'
import { CreateGymPage } from '@/pages/gyms/create'
import { CompetitionsPage } from '@/pages/competitions'
import { CompetitionRegistrationsPage } from '@/pages/competitions/registrations'
import { GymRegistrationsPage } from '@/pages/competitions/registrations/gym-registrations'
import { PaymentsPage } from '@/pages/payments'
import { PagoMovilPage } from '@/pages/pago-movil'
import { SettingsPage } from '@/pages/settings'
import { ProfilePage } from '@/pages/profile'

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
        element: <AthletesPage />,
      },
      {
        path: 'athletes/new',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <AthletesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'athletes/:id/edit',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <EditAthletePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'coaches',
        element: <CoachesPage />,
      },
      {
        path: 'coaches/new',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <CoachesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'coaches/:id/edit',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <CoachesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gyms',
        element: <GymsPage />,
      },
      {
        path: 'gyms/new',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <CreateGymPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gyms/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <GymsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competitions',
        element: <CompetitionsPage />,
      },
      {
        path: 'competitions/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CompetitionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competitions/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CompetitionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competition-registrations',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH', 'ATHLETE']}>
            <CompetitionRegistrationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gym-registrations',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <GymRegistrationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payments',
        element: (
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <PaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pago-movil',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <PagoMovilPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'profile/:type/:id',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
