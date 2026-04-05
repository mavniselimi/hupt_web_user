import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '@/features/auth/authService'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'

export function LoginPage() {
  const { token, setAuth } = useAuthStore()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  if (token) return <Navigate to="/" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await authService.login(form)
      setAuth({ token: data.token, user: data.user })
      toast.show('Logged in successfully')
    } catch {
      toast.show('Login failed. Check credentials.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Use your backend account credentials.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
          <button
            disabled={isLoading}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-70"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
