import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { eventsService } from '@/features/events/eventsService'
import { sessionsService } from '@/features/sessions/sessionsService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'
import { useToast } from '@/hooks/useToast'

export function EventDetailPage() {
  const { eventId } = useParams()
  const toast = useToast()
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

  const registerMe = async () => {
    try {
      await eventsService.registerMe(eventId)
      toast.show('Registered to event.')
    } catch {
      toast.show('Could not register to event.', 'error')
    }
  }

  if (loading) return <LoadingState message="Loading event details..." />
  if (error) return <ErrorState message={error} />
  if (!event) return <EmptyState message="Event not found." />

  return (
    <section className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-xl font-semibold">{event.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{event.description}</p>
        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
          <p>Start: {formatDateTime(event.startTime)}</p>
          <p>End: {formatDateTime(event.endTime)}</p>
          <p>Location: {event.location || '-'}</p>
          <p>Sessions: {event.sessionCount}</p>
        </div>
        <button onClick={registerMe} className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
          Register me
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Sessions</h3>
        {!sessions.length ? (
          <EmptyState message="No sessions for this event." />
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="rounded-xl border bg-white p-4">
              <p className="font-medium">{session.title}</p>
              <p className="mt-1 text-sm text-slate-500">{session.speaker}</p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(session.startTime)}</p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
