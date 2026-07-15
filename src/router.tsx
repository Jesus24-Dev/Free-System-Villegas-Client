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
import { EditGymPage } from '@/pages/gyms/edit'
import { CompetitionsPage } from '@/pages/competitions'
import { CreateCompetitionPage } from '@/pages/competitions/create'
import { EditCompetitionPage } from '@/pages/competitions/edit'
import { CompetitionDivisionsPage } from '@/pages/competitions/divisions'
import { CreateCompetitionDivisionPage } from '@/pages/competitions/divisions/create'
import { EditCompetitionDivisionPage } from '@/pages/competitions/divisions/edit'
import { CompetitionRegistrationsPage } from '@/pages/competitions/registrations'
import { GymRegistrationsPage } from '@/pages/competitions/registrations/gym-registrations'
import { PaymentsPage } from '@/pages/payments'
import { PagoMovilPage } from '@/pages/pago-movil'
import { SettingsPage } from '@/pages/settings'
import { ProfilePage } from '@/pages/profile'
import { UsersPage } from '@/pages/users'
import { PersonsPage } from '@/pages/persons'
import { AdminCoachesPage } from '@/pages/admin-coaches'
import { CreateCoachPage } from '@/pages/admin-coaches/create'
import { EditCoachPage } from '@/pages/admin-coaches/edit'
import { AdminAthletesPage } from '@/pages/admin-athletes'
import { CreateAthletePage } from '@/pages/admin-athletes/create'
import { EditAthletePage as EditAdminAthletePage } from '@/pages/admin-athletes/edit'

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
          <ProtectedRoute requiredRole={['ADMIN', 'COACH']}>
            <EditGymPage />
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
            <CreateCompetitionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competitions/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <EditCompetitionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competition-divisions',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CompetitionDivisionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competition-divisions/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CreateCompetitionDivisionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'competition-divisions/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <EditCompetitionDivisionPage />
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
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'persons',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <PersonsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-coaches',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminCoachesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-coaches/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CreateCoachPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-coaches/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <EditCoachPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-athletes',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminAthletesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-athletes/new',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CreateAthletePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-athletes/:id/edit',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <EditAdminAthletePage />
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
