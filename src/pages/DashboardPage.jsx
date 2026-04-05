import { useEffect, useState } from 'react'
import { eventsService } from '@/features/events/eventsService'
import { attendanceService } from '@/features/attendance/attendanceService'
import { LoadingState, ErrorState } from '@/components/PageState'

export function DashboardPage() {
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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Events" value={stats.events} />
        <StatCard label="My Registered Events" value={stats.registered} />
        <StatCard label="My Attendance Count" value={stats.attendanceCount} />
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}
