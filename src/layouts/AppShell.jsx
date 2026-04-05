import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
            <Outlet />
          </main>

          <nav className="fixed bottom-0 left-0 right-0 border-t bg-white md:hidden">
            <div className="grid grid-cols-5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-1 py-2 text-center text-xs ${isActive ? 'font-semibold text-slate-900' : 'text-slate-500'}`
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
