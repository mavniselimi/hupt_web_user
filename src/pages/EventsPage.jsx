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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Events</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="rounded-xl border bg-white p-4 hover:border-slate-400"
          >
            <h3 className="font-semibold">{event.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{event.description}</p>
            <p className="mt-3 text-xs text-slate-500">{formatDateTime(event.startTime)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
