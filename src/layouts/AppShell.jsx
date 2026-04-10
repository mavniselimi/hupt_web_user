import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useT } from '@/i18n/useT'

export function AppShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { t } = useT()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* ── Top header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          {/* Brand */}
          <div className="flex items-center gap-2 select-none">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              H
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">HUPT</span>
          </div>

          {/* Right: name + logout */}
          <div className="flex items-center gap-3">
            {user?.name && (
              <span className="hidden text-sm text-slate-500 sm:block">{user.name}</span>
            )}
            <button
              onClick={onLogout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
