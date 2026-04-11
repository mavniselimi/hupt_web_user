import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '@/features/auth/authService'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { useT } from '@/i18n/useT'

export function LoginPage() {
  const { token, setAuth } = useAuthStore()
  const toast = useToast()
  const { t } = useT()

  const [form, setForm] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  if (token) return <Navigate to="/" replace />

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await authService.login(form)
      setAuth({ token: data.token, user: data.user })
    } catch {
      toast.show(t('login.error'), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 p-5">
      {/* Logo mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 overflow-hidden">
          <img
            src="/logo.png"
            alt="HUPT logo"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">HUPT</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {t('login.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t('login.subtitle')}</p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={form.email}
                onChange={onChange}
                placeholder="Mailiniz"
                className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={onChange}
                placeholder="Telefon numaranızın son 4 hanesi"
                className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
