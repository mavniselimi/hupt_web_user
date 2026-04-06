import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsService } from '@/features/events/eventsService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'

const TABS = [
  { id: 'all', label: 'All Events' },
  { id: 'registered', label: 'My Registered' },
]

function EventCard({ event }) {
  return (
    <Link
      key={event.id}
      to={`/events/${event.id}`}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:border-slate-300 sm:p-5"
    >
      <h3 className="font-semibold text-slate-900">{event.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>
      <p className="mt-4 text-xs text-slate-500">{formatDateTime(event.startTime)}</p>
    </Link>
  )
}

export function EventsPage() {
  const [activeTab, setActiveTab] = useState('all')

  const [allEvents, setAllEvents] = useState([])
  const [allLoading, setAllLoading] = useState(true)
  const [allError, setAllError] = useState('')

  const [registeredEvents, setRegisteredEvents] = useState([])
  const [registeredLoading, setRegisteredLoading] = useState(true)
  const [registeredError, setRegisteredError] = useState('')

  useEffect(() => {
    async function loadAll() {
      setAllLoading(true)
      setAllError('')
      try {
        const data = await eventsService.list()
        setAllEvents(data)
      } catch {
        setAllError('Failed to load events.')
      } finally {
        setAllLoading(false)
      }
    }
    loadAll()
  }, [])

  useEffect(() => {
    async function loadRegistered() {
      setRegisteredLoading(true)
      setRegisteredError('')
      try {
        const data = await eventsService.myRegistered()
        setRegisteredEvents(data)
      } catch {
        setRegisteredError('Failed to load your registered events.')
      } finally {
        setRegisteredLoading(false)
      }
    }
    loadRegistered()
  }, [])

  const isAllTab = activeTab === 'all'
  const loading = isAllTab ? allLoading : registeredLoading
  const error = isAllTab ? allError : registeredError
  const events = isAllTab ? allEvents : registeredEvents

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-4 p-1">
      <h2 className="px-1 text-xl font-semibold tracking-tight text-slate-900">Events</h2>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message={isAllTab ? 'Loading events...' : 'Loading your registered events...'} />
      ) : error ? (
        <ErrorState message={error} />
      ) : !events.length ? (
        <EmptyState message={isAllTab ? 'No events found.' : "You haven't registered for any events yet."} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  )
}
