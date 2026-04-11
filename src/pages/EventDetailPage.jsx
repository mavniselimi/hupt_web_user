import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { eventsService } from '@/features/events/eventsService'
import { sessionsService } from '@/features/sessions/sessionsService'
import { formatDateTime } from '@/utils/formatters'
import { useT } from '@/i18n/useT'

/* ─── Helpers ─────────────────────────────────────────────── */

function sessionStatus(session) {
  if (session.active === true) return 'active'
  const now = Date.now()
  const start = session.startTime ? new Date(session.startTime).getTime() : null
  const end = session.endTime ? new Date(session.endTime).getTime() : null
  if (end && now > end) return 'ended'
  if (start && now < start) return 'upcoming'
  return 'active' // default: ongoing
}

function StatusBadge({ status, t }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    upcoming: 'bg-indigo-50 text-indigo-600 ring-indigo-200',
    ended: 'bg-slate-100 text-slate-500 ring-slate-200',
  }
  const labels = {
    active: t('event.active'),
    upcoming: t('event.upcoming'),
    ended: t('event.ended'),
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? styles.upcoming
      }`}
    >
      {status === 'active' && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
      {labels[status] ?? labels.upcoming}
    </span>
  )
}

function MetaRow({ icon, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <span>{value}</span>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────── */

export function EventDetailPage() {
  const { eventId } = useParams()
  const { t } = useT()

  const [event, setEvent] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [eventData, sessionData] = await Promise.all([
          eventsService.detail(eventId),
          sessionsService.byEvent(eventId),
        ])
        setEvent(eventData)
        setSessions(sessionData)
      } catch {
        setError(t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId, t])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-400">
        <svg className="mr-2 h-5 w-5 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        {t('common.loading')}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        {t('event.back')}
      </Link>

      {/* Event card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold leading-snug tracking-tight text-slate-900">
          {event.title}
        </h1>

        {event.description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{event.description}</p>
        )}

        <div className="mt-4 flex flex-col gap-2.5">
          <MetaRow
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            value={
              event.startTime
                ? `${formatDateTime(event.startTime)}${event.endTime ? ` – ${formatDateTime(event.endTime)}` : ''}`
                : null
            }
          />
          <MetaRow
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            }
            value={event.location}
          />
        </div>
      </div>

      {/* Sessions section */}
      <div>
        <h2 className="mb-3 px-1 text-base font-semibold text-slate-900">{t('event.sessions')}</h2>

        {sessions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">
            {t('event.noSessions')}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => {
              const status = sessionStatus(session)
              return (
                <li
                  key={session.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{session.title}</p>
                        <StatusBadge status={status} t={t} />
                      </div>
                      {session.speaker && (
                        <p className="mt-1 text-xs text-slate-500">
                          {t('event.speaker')}: {session.speaker}
                        </p>
                      )}
                      {session.startTime && (
                        <p className="mt-1.5 text-xs text-slate-400">{formatDateTime(session.startTime)}</p>
                      )}
                    </div>
                      
                      
                    {console.log(session)}
                    { session.attendanceEnabled === true && (
                    <Link
                      to={`/event/${eventId}/session/${session.id}/check-in`}
                      state={{ sessionTitle: session.title }}
                      className="flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 active:bg-indigo-800"
                    >
                      {t('event.checkIn')}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
