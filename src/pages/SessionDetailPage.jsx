import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { sessionsService } from '@/features/sessions/sessionsService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'

export function SessionDetailPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await sessionsService.detail(sessionId)
        setSession(data)
      } catch {
        setError('Could not load this session.')
      } finally {
        setLoading(false)
      }
    }
    if (sessionId) load()
  }, [sessionId])

  if (loading) return <LoadingState message="Loading session…" />
  if (error) return <ErrorState message={error} />
  if (!session) return <EmptyState message="Session not found." />

  const sid = session.id
  const eventLink = session.eventId != null ? `/events/${session.eventId}` : '/events'

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-4 p-1">
      <div className="flex items-start gap-3">
        <Link
          to={eventLink}
          className="mt-0.5 min-h-[44px] shrink-0 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          ← Event
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{session.title}</h1>
        {session.description ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{session.description}</p>
        ) : null}
        <dl className="mt-4 space-y-2 text-sm text-slate-600">
          {session.speaker ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Speaker</dt>
              <dd className="mt-0.5">{session.speaker}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Starts</dt>
            <dd className="mt-0.5">{formatDateTime(session.startTime)}</dd>
          </div>
          {session.endTime ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Ends</dt>
              <dd className="mt-0.5">{formatDateTime(session.endTime)}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="px-1 text-sm font-medium uppercase tracking-wide text-slate-500">Actions</h2>
        <Link
          to={`/attendance/${sid}`}
          state={{ sessionTitle: session.title, sessionId: sid }}
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-center text-base font-medium text-white active:bg-slate-800"
        >
          Check In
        </Link>
        <Link
          to={`/sessions/${sid}/ask`}
          state={{ sessionTitle: session.title }}
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-base font-medium text-slate-900 shadow-sm active:bg-slate-50"
        >
          Ask a question
        </Link>
        <Link
          to={`/sessions/${sid}/questions`}
          state={{ sessionTitle: session.title }}
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-base font-medium text-slate-900 shadow-sm active:bg-slate-50"
        >
          Approved questions
        </Link>
      </div>
    </section>
  )
}
