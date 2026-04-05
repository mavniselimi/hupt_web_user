import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { UserAvatar } from '@/components/UserAvatar'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/profile', label: 'Profile' },
]

export function AppShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-7xl md:flex-row">
        <aside className="hidden w-64 border-r bg-white p-4 md:block">
          <div className="mb-6 font-semibold">HUPT</div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-white/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar size="sm" className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
            <Outlet />
          </main>

          <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
            <div className="mx-auto grid max-w-lg grid-cols-5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex min-h-[52px] items-center justify-center px-1 py-2 text-center text-xs leading-tight ${
                      isActive ? 'font-semibold text-slate-900' : 'text-slate-500'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
