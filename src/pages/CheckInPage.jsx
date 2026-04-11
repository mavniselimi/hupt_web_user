import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { sessionsService } from '@/features/sessions/sessionsService'
import { attendanceService } from '@/features/attendance/attendanceService'
import { QRScanner } from '@/components/QRScanner'
import { useT } from '@/i18n/useT'

export function CheckInPage() {
  const { eventId, sessionId } = useParams()
  const location = useLocation()
  const { t } = useT()

  // ── Session title (from router state or lazy-fetched) ────────
  const [sessionTitle, setSessionTitle] = useState(location.state?.sessionTitle ?? '')
  useEffect(() => {
    if (sessionTitle) return
    sessionsService.detail(sessionId).then((s) => setSessionTitle(s.title)).catch(() => {})
  }, [sessionId, sessionTitle])

  // ── Submission state ─────────────────────────────────────────
  const [code, setCode] = useState('')
  // Keep a ref to the latest code value so the memoised submit()
  // can read the current input without listing `code` in its deps
  // (which would cause QRScanner to restart on every keystroke).
  const codeRef = useRef(code)
  useEffect(() => {
    codeRef.current = code
  }, [code])

  const [submitting, setSubmitting] = useState(false)
  const [pageState, setPageState] = useState('form') // 'form' | 'success'
  const [submitError, setSubmitError] = useState('')

  // ── Scanner state ────────────────────────────────────────────
  // cameraActivated starts false so QRScanner is NOT mounted on page load.
  // getUserMedia() is only called after the user taps "Open Camera", which
  // satisfies the user-gesture requirement on mobile Chrome / Safari.
  const [cameraActivated, setCameraActivated] = useState(false)
  const [scannerAvailable, setScannerAvailable] = useState(true)
  const [cameraDenied, setCameraDenied] = useState(false)
  // 'denied'  → browser site settings hard-block the camera
  // 'prompt'  → user dismissed the permission prompt without choosing
  // 'unknown' → Permissions API unavailable; cause uncertain
  const [cameraPermState, setCameraPermState] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  // Temporary debug state — captures the raw getUserMedia error name+message
  // so it is visible directly on screen (mobile has no easy DevTools access).
  // Remove this state and its references once the camera issue is resolved.
  const [cameraDebug, setCameraDebug] = useState(null)
  const scannedRef = useRef(false) // prevent double-submit from rapid bursts

  // ── Core submit ──────────────────────────────────────────────
  // Stable — only depends on sessionId and t (both stable).
  // Reads `code` via codeRef so it does not need `code` in deps.
  const submit = useCallback(
    async (explicitCode) => {
      const qrKey = (explicitCode !== undefined ? explicitCode : codeRef.current).trim()
      if (!qrKey) {
        setSubmitError(t('checkin.emptyCode'))
        return
      }
      setSubmitting(true)
      setSubmitError('')
      try {
        await attendanceService.submit({ sessionId: Number(sessionId), qrKey })
        setPageState('success')
      } catch {
        scannedRef.current = false // allow retry
        setSubmitError(t('checkin.error'))
      } finally {
        setSubmitting(false)
      }
    },
    [sessionId, t],
  )

  // ── QR scan handler (stable) ─────────────────────────────────
  // Memoised so QRScanner never re-initialises the camera when the
  // parent re-renders (e.g. while the user types in the manual field).
  const handleScan = useCallback(
    async (value) => {
      if (scannedRef.current) return
      scannedRef.current = true
      setCode(value)
      await submit(value)
    },
    [submit],
  )

  // Stable scanner error callbacks — same reasoning as above.
  // handleDenied receives the permState string from QRScanner so the UI
  // can show a specific recovery instruction ('denied' = open site settings;
  // 'prompt' = just refresh and tap Allow; 'unknown' = generic guidance).
  const handleNotSupported = useCallback(() => setScannerAvailable(false), [])
  const handleDenied = useCallback((permState) => {
    setCameraDenied(true)
    setCameraPermState(permState ?? 'unknown')
  }, [])
  const handleCameraError = useCallback((err) => {
    setCameraError(true)
    // Capture the raw error string for the on-screen debug panel.
    if (err) setCameraDebug(`${err.name}: ${err.message}`)
  }, [])

  // ── Manual form submit ───────────────────────────────────────
  const handleManualSubmit = useCallback(
    (e) => {
      e.preventDefault()
      submit()
    },
    [submit],
  )

  /* ── Success screen ───────────────────────────────────────── */
  if (pageState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-10 w-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t('checkin.successTitle')}
        </h1>
        {sessionTitle && <p className="mt-1 text-sm text-slate-500">{sessionTitle}</p>}
        <p className="mt-3 text-sm text-slate-500">{t('checkin.successSubtext')}</p>
        <Link
          to={`/event/${eventId}`}
          className="mt-8 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          {t('checkin.backAfterSuccess')}
        </Link>
      </div>
    )
  }

  /* ── Form screen ──────────────────────────────────────────── */
  // QRScanner is only mounted when the user has explicitly tapped "Open Camera"
  // AND no error state has been set. The user-gesture gate is what makes
  // getUserMedia() succeed reliably on mobile Chrome.
  const scannerReady = scannerAvailable && !cameraDenied && !cameraError
  const showScanner  = scannerReady && cameraActivated && !submitting

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <Link
          to={`/event/${eventId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          {t('checkin.backToEvent')}
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
          {t('checkin.title')}
        </h1>
        {sessionTitle && <p className="mt-0.5 text-sm text-slate-500">{sessionTitle}</p>}
      </div>

      {/* ── QR scanner section ──────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <p className="self-start text-sm font-medium text-slate-700">{t('checkin.scanQR')}</p>

        {/* Pre-activation: show the "Open Camera" button.
            The button tap is the user gesture required by mobile Chrome
            before getUserMedia() is allowed to run. */}
        {scannerReady && !cameraActivated && (
          <button
            type="button"
            onClick={() => setCameraActivated(true)}
            className="flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-10 text-indigo-700 transition-colors hover:border-indigo-400 hover:bg-indigo-100 active:bg-indigo-200"
          >
            {/* Camera icon */}
            <svg
              className="h-7 w-7 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
            <span className="flex flex-col items-start gap-0.5 text-left">
              <span className="text-base font-semibold">{t('checkin.openCamera')}</span>
              <span className="text-xs font-normal text-indigo-500">{t('checkin.openCameraHint')}</span>
            </span>
          </button>
        )}

        {/* Active scanner — only mounted after user taps the button above.
            Unmounting on submit prevents a second scan mid-flight. */}
        {showScanner && (
          <QRScanner
            onScan={handleScan}
            onNotSupported={handleNotSupported}
            onDenied={handleDenied}
            onError={handleCameraError}
          />
        )}

        {/* ── Error / unsupported notices ──────────────────── */}
        {!scannerAvailable && (
          <CameraNotice
            icon="🔍"
            message={t('checkin.cameraUnsupported')}
            sub={t('checkin.useManual')}
          />
        )}
        {cameraDenied && (
          <CameraNotice
            icon="🚫"
            message={t('checkin.cameraDenied')}
            sub={
              cameraPermState === 'denied'
                ? t('checkin.cameraPermBlocked')
                : t('checkin.allowCamera')
            }
          />
        )}
        {cameraError && !cameraDenied && (
          <CameraNotice
            icon="⚠️"
            message={t('checkin.cameraError')}
            sub={t('checkin.useManual')}
          />
        )}

        {/* ── Temporary debug panel ──────────────────────────
            Shows the raw getUserMedia error on-screen for mobile debugging.
            Remove this block (and cameraDebug state) once resolved. */}
        {cameraDebug && (
          <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-500">
              Debug — camera error
            </p>
            <p className="break-all font-mono text-xs text-red-700">{cameraDebug}</p>
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-slate-200" />
        <span className="shrink-0 text-xs text-slate-400">{t('checkin.divider')}</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* ── Manual code entry ───────────────────────────────── */}
      <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="attendance-code" className="text-sm font-medium text-slate-700">
            {t('checkin.codeLabel')}
          </label>
          <input
            id="attendance-code"
            type="text"
            autoComplete="one-time-code"
            inputMode="text"
            placeholder={t('checkin.codePlaceholder')}
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setSubmitError('')
            }}
            disabled={submitting}
            className="min-h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base tracking-widest text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {submitError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {t('checkin.submitting')}
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {t('checkin.submit')}
            </>
          )}
        </button>
      </form>
    </div>
  )
}

/* ─── Camera notice helper ────────────────────────────────── */

function CameraNotice({ icon, message, sub }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{message}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}
