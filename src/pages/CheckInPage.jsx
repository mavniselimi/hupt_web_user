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
  const [scannerAvailable, setScannerAvailable] = useState(true)
  const [cameraDenied, setCameraDenied] = useState(false)
  // 'denied'  → browser site settings hard-block the camera
  // 'prompt'  → user dismissed the permission prompt without choosing
  // 'unknown' → Permissions API unavailable; cause uncertain
  const [cameraPermState, setCameraPermState] = useState(null)
  const [cameraError, setCameraError] = useState(false)
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
  const handleCameraError = useCallback(() => setCameraError(true), [])

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
  const showScanner = scannerAvailable && !cameraDenied && !cameraError

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

      {/* ── QR scanner ──────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <p className="self-start text-sm font-medium text-slate-700">{t('checkin.scanQR')}</p>
        <p className="self-start text-xs text-slate-400">{t('checkin.scanHint')}</p>

        {/* QRScanner is conditionally rendered — unmounting stops the camera.
            We hide it while submitting to prevent a second scan mid-flight. */}
        {showScanner && !submitting && (
          <QRScanner
            onScan={handleScan}
            onNotSupported={handleNotSupported}
            onDenied={handleDenied}
            onError={handleCameraError}
          />
        )}

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
              // 'denied'  → browser has persistently blocked the camera for
              //             this origin; the user must change site settings.
              // 'prompt' / 'unknown' → the prompt was dismissed or the
              //             Permissions API isn't available; a refresh is
              //             often enough.
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
