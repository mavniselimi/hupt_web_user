import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <section className="mx-auto flex max-w-2xl flex-col gap-4 p-1">
      <h2 className="px-1 text-xl font-semibold tracking-tight text-slate-900">Active sessions</h2>
      <ul className="flex flex-col gap-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">{session.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{session.description}</p>
                <p className="mt-3 text-xs text-slate-500">Starts: {formatDateTime(session.startTime)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Speaker: <span className="font-medium text-slate-700">{session.speaker || 'TBA'}</span>
                </p>
              </div>
              <Link
                to={`/sessions/${session.id}`}
                state={{ sessionTitle: session.title }}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white active:bg-slate-800"
              >
                Open session
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
