import { useEffect, useState } from 'react'
import { sessionsService } from '@/features/sessions/sessionsService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'

export function SessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await sessionsService.active()
        setSessions(data)
      } catch {
        setError('Unable to load active sessions.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Loading sessions..." />
  if (error) return <ErrorState message={error} />
  if (!sessions.length) return <EmptyState message="No active sessions." />

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Active Sessions</h2>
      <div className="grid gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{session.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{session.description}</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs">{session.speaker || 'TBA'}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Starts: {formatDateTime(session.startTime)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
