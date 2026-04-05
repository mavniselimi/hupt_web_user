import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsService } from '@/features/events/eventsService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'

export function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await eventsService.list()
        setEvents(data)
      } catch {
        setError('Failed to load events.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Loading events..." />
  if (error) return <ErrorState message={error} />
  if (!events.length) return <EmptyState message="No events found." />

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-4 p-1">
      <h2 className="px-1 text-xl font-semibold tracking-tight text-slate-900">Events</h2>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:border-slate-300 sm:p-5"
          >
            <h3 className="font-semibold text-slate-900">{event.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>
            <p className="mt-4 text-xs text-slate-500">{formatDateTime(event.startTime)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
