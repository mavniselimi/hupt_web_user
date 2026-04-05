import { useEffect, useState } from 'react'
import { eventsService } from '@/features/events/eventsService'
import { attendanceService } from '@/features/attendance/attendanceService'
import { UserAvatar } from '@/components/UserAvatar'
import { useAuthStore } from '@/store/authStore'
import { LoadingState, ErrorState } from '@/components/PageState'

export function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ events: 0, registered: 0, attendanceCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [events, registered, attendanceCount] = await Promise.all([
          eventsService.list(),
          eventsService.myRegistered(),
          attendanceService.myAttendanceCount(),
        ])
        setStats({
          events: events.length,
          registered: registered.length,
          attendanceCount: attendanceCount.count ?? 0,
        })
      } catch {
        setError('Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Loading dashboard..." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-4 p-1">
      <div className="flex items-center gap-3 px-1">
        <UserAvatar size="sm" className="shrink-0 ring-slate-200" />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
          <p className="truncate text-sm text-slate-500">{user?.name ? `Hi, ${user.name}` : 'Welcome'}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Total events" value={stats.events} />
        <StatCard label="My events (admin-assigned)" value={stats.registered} />
        <StatCard label="Attendance check-ins" value={stats.attendanceCount} />
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}
