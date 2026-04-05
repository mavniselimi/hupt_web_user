import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { SessionsPage } from '@/pages/SessionsPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:eventId', element: <EventDetailPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'attendance/:sessionId', element: <AttendancePage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
    errorElement: <RouteErrorBoundary />,
  },
  { path: '*', element: <NotFoundPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/home', element: <Navigate to="/" replace /> },
])
