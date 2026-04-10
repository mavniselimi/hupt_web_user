import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsService } from '@/features/events/eventsService'
import { useAuthStore } from '@/store/authStore'
import { useT } from '@/i18n/useT'
import { formatDateTime } from '@/utils/formatters'

/* ─── Sub-components ─────────────────────────────────────── */

function LoadingScreen({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-sm text-slate-400">
      <svg
        className="mb-3 h-6 w-6 animate-spin text-indigo-400"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {label}
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  )
}

function EmptyEvents({ t }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
      </div>
      <p className="text-base font-semibold text-slate-800">{t('home.noEvents')}</p>
      <p className="mt-2 max-w-xs text-sm text-slate-500">{t('home.noEventsSubtext')}</p>
    </div>
  )
}

function EventCard({ event, prominent = false, t }) {
  return (
    <Link
      to={`/event/${event.id}`}
      className={`block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99] ${
        prominent ? 'sm:p-6' : ''
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h2
          className={`font-semibold leading-snug text-slate-900 ${
            prominent ? 'text-xl' : 'text-base'
          }`}
        >
          {event.title}
        </h2>
        {/* Arrow */}
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Description (prominent only) */}
      {prominent && event.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {event.description}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        {event.startTime && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDateTime(event.startTime)}
          </span>
        )}
        {event.location && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {event.location}
          </span>
        )}
        {event.sessionCount != null && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            {event.sessionCount} {t('home.sessions')}
          </span>
        )}
      </div>

      {/* CTA */}
      <div
        className={`mt-4 inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-200 ${
          prominent ? 'w-full justify-center' : ''
        }`}
      >
        {t('home.enterEvent')}
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
        </svg>
      </div>
    </Link>
  )
}

/* ─── Page ────────────────────────────────────────────────── */

export function HomePage() {
  const { user } = useAuthStore()
  const { t } = useT()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await eventsService.myRegistered()
        setEvents(data)
      } catch {
        setError(t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const firstName = user?.name?.split(' ')[0] || user?.name

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {firstName ? t('home.greeting', { name: firstName }) : 'Welcome'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {events.length === 1 ? t('home.yourEvent') : t('home.yourEvents')}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingScreen label={t('common.loading')} />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : events.length === 0 ? (
        <EmptyEvents t={t} />
      ) : events.length === 1 ? (
        /* Single event — prominent hero card */
        <EventCard event={events[0]} prominent t={t} />
      ) : (
        /* Multiple events — card list */
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}
