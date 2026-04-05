import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { eventsService } from '@/features/events/eventsService'
import { sessionsService } from '@/features/sessions/sessionsService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'

export function EventDetailPage() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [eventData, sessionData] = await Promise.all([
          eventsService.detail(eventId),
          sessionsService.byEvent(eventId),
        ])
        setEvent(eventData)
        setSessions(sessionData)
      } catch {
        setError('Failed to load event details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId])

  if (loading) return <LoadingState message="Loading event details..." />
  if (error) return <ErrorState message={error} />
  if (!event) return <EmptyState message="Event not found." />

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 p-1">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{event.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{event.description}</p>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Start</dt>
            <dd className="mt-0.5">{formatDateTime(event.startTime)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">End</dt>
            <dd className="mt-0.5">{formatDateTime(event.endTime)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Location</dt>
            <dd className="mt-0.5">{event.location || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Sessions</dt>
            <dd className="mt-0.5">{event.sessionCount}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-base font-semibold text-slate-900">Sessions</h3>
        {!sessions.length ? (
          <EmptyState message="No sessions for this event." />
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{session.title}</p>
                    {session.speaker ? (
                      <p className="mt-1 text-sm text-slate-500">{session.speaker}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-500">{formatDateTime(session.startTime)}</p>
                  </div>
                  <Link
                    to={`/attendance/${session.id}`}
                    state={{ sessionTitle: session.title }}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white active:bg-slate-800"
                  >
                    Check in
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
