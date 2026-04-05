import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/features/auth/authService'

export function ProtectedRoute({ children }) {
  const { token, user, setUser, logout, isHydrated, hydrateDone } = useAuthStore()

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        hydrateDone()
        return
      }
      if (!user) {
        try {
          const me = await authService.me()
          setUser(me)
        } catch {
          logout()
        } finally {
          hydrateDone()
        }
      } else {
        hydrateDone()
      }
    }
    bootstrap()
  }, [token, user, setUser, logout, hydrateDone])

  if (!token) return <Navigate to="/login" replace />
  if (!isHydrated) return <div className="p-6 text-sm text-slate-500">Loading session...</div>

  return children
}
