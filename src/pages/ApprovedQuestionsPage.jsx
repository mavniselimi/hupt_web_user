import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { questionsService } from '@/features/questions/questionsService'
import { sessionsService } from '@/features/sessions/sessionsService'
import { formatDateTime } from '@/utils/formatters'
import { EmptyState, ErrorState, LoadingState } from '@/components/PageState'

export function ApprovedQuestionsPage() {
  const { sessionId } = useParams()
  const location = useLocation()

  const [sessionTitle, setSessionTitle] = useState(location.state?.sessionTitle ?? '')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [sessionData, approved] = await Promise.all([
          sessionsService.detail(sessionId).catch(() => null),
          questionsService.approvedBySession(sessionId),
        ])
        if (!cancelled) {
          if (sessionData?.title) setSessionTitle(sessionData.title)
          setQuestions(Array.isArray(approved) ? approved : [])
        }
      } catch {
        if (!cancelled) setError('Could not load approved questions.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (sessionId) load()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-4 p-1">
      <Link
        to={`/sessions/${sessionId}`}
        className="min-h-[44px] text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        ← Session
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Approved questions</h1>
        {sessionTitle ? (
          <p className="mt-1 text-sm text-slate-600">{sessionTitle}</p>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Session #{sessionId}</p>
        )}
        <p className="mt-2 text-sm text-slate-500">Only questions approved by staff are shown here.</p>
      </div>

      {loading && <LoadingState message="Loading questions…" />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !questions.length && (
        <EmptyState message="No approved questions yet." />
      )}
      {!loading && !error && questions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{q.content}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  {q.anonymous ? 'Anonymous' : q.askedByName || 'Participant'}
                </span>
                <span aria-hidden="true">·</span>
                <time dateTime={q.createdAt}>{formatDateTime(q.createdAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
