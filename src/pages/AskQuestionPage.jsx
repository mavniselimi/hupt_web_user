import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { questionsService } from '@/features/questions/questionsService'
import { sessionsService } from '@/features/sessions/sessionsService'
import { LoadingState } from '@/components/PageState'
import { useToast } from '@/hooks/useToast'

export function AskQuestionPage() {
  const { sessionId } = useParams()
  const location = useLocation()
  const toast = useToast()

  const [sessionTitle, setSessionTitle] = useState(location.state?.sessionTitle ?? '')
  const [content, setContent] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [loadingSession, setLoadingSession] = useState(!location.state?.sessionTitle)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadTitle() {
      if (location.state?.sessionTitle) return
      setLoadingSession(true)
      try {
        const s = await sessionsService.detail(sessionId)
        if (!cancelled) setSessionTitle(s?.title ?? '')
      } catch {
        if (!cancelled) setSessionTitle('')
      } finally {
        if (!cancelled) setLoadingSession(false)
      }
    }
    if (sessionId) loadTitle()
    return () => {
      cancelled = true
    }
  }, [sessionId, location.state?.sessionTitle])

  const onSubmit = async (e) => {
    e.preventDefault()
    const text = content.trim()
    if (!text) {
      toast.show('Enter your question.', 'error')
      return
    }
    if (text.length > 4000) {
      toast.show('Question is too long.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await questionsService.ask(Number(sessionId), { content: text, anonymous })
      toast.show('Question sent.')
      setContent('')
      setAnonymous(false)
    } catch {
      toast.show('Could not send your question. Try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingSession) return <LoadingState message="Loading session…" />

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-4 p-1">
      <Link
        to={`/sessions/${sessionId}`}
        className="min-h-[44px] text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        ← Session
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Ask a question</h1>
        {sessionTitle ? (
          <p className="mt-1 text-sm text-slate-600">{sessionTitle}</p>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Session #{sessionId}</p>
        )}
        <p className="mt-3 text-sm text-slate-500">
          Your question is sent to organizers. Approved questions appear on the Approved questions page.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="question-content" className="block text-sm font-medium text-slate-700">
              Your question
            </label>
            <textarea
              id="question-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              placeholder="Type your question…"
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              disabled={submitting}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
            />
            <span className="text-sm text-slate-700">Ask anonymously</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[48px] w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Submit question'}
          </button>
        </form>
      </div>
    </section>
  )
}
