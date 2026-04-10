import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { CheckInPage } from '@/pages/CheckInPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'event/:eventId', element: <EventDetailPage /> },
      { path: 'event/:eventId/session/:sessionId/check-in', element: <CheckInPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage />, errorElement: <RouteErrorBoundary /> },
])
