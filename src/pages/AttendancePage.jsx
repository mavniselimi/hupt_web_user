import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { attendanceService } from '@/features/attendance/attendanceService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'
import { useToast } from '@/hooks/useToast'

function parseSessionId(routeId, stateId) {
  if (routeId != null && routeId !== '') {
    const n = Number(routeId)
    if (Number.isFinite(n) && n > 0) return n
  }
  if (stateId != null) {
    const n = Number(stateId)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

export function AttendancePage() {
  const { sessionId: sessionIdParam } = useParams()
  const location = useLocation()
  const toast = useToast()

  const sessionId = useMemo(
    () => parseSessionId(sessionIdParam, location.state?.sessionId),
    [sessionIdParam, location.state?.sessionId],
  )

  const sessionTitle = location.state?.sessionTitle

  const [code, setCode] = useState('')
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const data = await attendanceService.myAttendanceList()
      setAttendance(data)
    } catch {
      setError('Unable to load attendance.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (sessionId == null) {
      toast.show('Open an event and choose a session to check in.', 'error')
      return
    }
    const qrKey = code.trim()
    if (!qrKey) {
      toast.show('Enter the attendance code.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await attendanceService.submit({ sessionId, qrKey })
      toast.show('Attendance recorded.')
      setCode('')
      loadAttendance()
    } catch {
      toast.show('Check-in failed. Check the code and try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-4 p-1">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Attendance</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the code shown at the session. Your session is selected from the event you opened.
        </p>

        {sessionId != null ? (
          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Checking in</p>
            {sessionTitle ? (
              <p className="mt-1">{sessionTitle}</p>
            ) : (
              <p className="mt-1 text-slate-600">Active session selected</p>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <p className="font-medium">No session selected</p>
            <p className="mt-1 text-amber-800/90">
              Open an event, pick a session, and use <strong>Check in</strong> to come back here with the
              right session.
            </p>
            <Link
              to="/events"
              className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-900 px-4 text-sm font-medium text-white"
            >
              Browse events
            </Link>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="attendance-code" className="block text-sm font-medium text-slate-700">
              Enter code
            </label>
            <input
              id="attendance-code"
              type="text"
              autoComplete="one-time-code"
              inputMode="text"
              placeholder="Attendance code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={sessionId == null || submitting}
              className="mt-2 min-h-[48px] w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50"
            />
          </div>
          <button
            type="submit"
            disabled={sessionId == null || submitting}
            className="min-h-[48px] w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-medium text-white active:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Your attendance</h3>
        {loading && <LoadingState message="Loading attendance history..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && !attendance.length && (
          <EmptyState message="No attendance records yet." />
        )}
        {!loading && !error && attendance.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {attendance.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <p className="font-medium text-slate-900">{item.sessionTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.attendedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
