/**
 * QRScanner
 *
 * Mobile-first live QR-code scanner.
 *
 * Technology:
 *   – getUserMedia       camera stream  (all modern mobile browsers)
 *   – BarcodeDetector    QR decoding    (Chrome 88+, Safari 17+ / iOS 17+)
 *
 * Mount the component to start scanning; unmount to release the camera.
 * All four callback props should be memoised with useCallback by the parent
 * so the effect — which lists them as deps — never re-runs unnecessarily.
 *
 * Props
 *   onScan(value)      called once when the first QR code is decoded
 *   onNotSupported()   BarcodeDetector unavailable in this browser
 *   onDenied()         camera permission denied
 *   onError(err)       other getUserMedia / setup failure
 */
import { useEffect, useRef, useState } from 'react'
import { useT } from '@/i18n/useT'

const QR_FORMATS = ['qr_code']
const POLL_MS = 200

export function QRScanner({ onScan, onNotSupported, onDenied, onError }) {
  const { t } = useT()

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const aliveRef = useRef(false)
  const timerId = useRef(null)

  // Starts as 'requesting' because scanning begins immediately on mount.
  // All subsequent setScanStatus() calls happen inside the async `run()`
  // function, always after at least one `await`, so they are never
  // synchronous from the effect's top-level execution perspective.
  const [scanStatus, setScanStatus] = useState('requesting')

  useEffect(() => {
    aliveRef.current = true

    // Capture for cleanup to satisfy the exhaustive-deps rule about
    // ref.current values potentially changing before cleanup runs.
    const videoEl = videoRef.current

    // Entire scanning pipeline is defined as a local async function so that
    // the linter's set-state-in-effect rule does not flag it — all setState
    // calls occur after `await` statements, never synchronously.
    async function run() {
      // ── 1. BarcodeDetector support ──────────────────────
      if (!('BarcodeDetector' in window)) {
        onNotSupported?.()
        return
      }

      let detector
      try {
        detector = new window.BarcodeDetector({ formats: QR_FORMATS })
      } catch {
        onNotSupported?.()
        return
      }

      // ── 2. Camera access ────────────────────────────────
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
      } catch (err) {
        if (!aliveRef.current) return
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          onDenied?.()
        } else {
          onError?.(err)
        }
        return
      }

      if (!aliveRef.current) {
        stream.getTracks().forEach((tr) => tr.stop())
        return
      }

      streamRef.current = stream

      // ── 3. Attach stream to <video> ──────────────────────
      const video = videoRef.current
      if (!video) return

      video.srcObject = stream
      video.muted = true       // required for iOS Safari autoplay
      video.playsInline = true // required to play inline on iOS

      try {
        await video.play()
      } catch {
        // Non-fatal — BarcodeDetector still works on video frames
      }

      if (!aliveRef.current) return

      // Safe: this setState call is after an `await`, not synchronous
      setScanStatus('scanning')

      // ── 4. Polling detection loop ────────────────────────
      async function tick() {
        if (!aliveRef.current) return
        const v = videoRef.current
        if (v && v.readyState >= 2 /* HAVE_CURRENT_DATA */) {
          try {
            const codes = await detector.detect(v)
            if (codes.length > 0 && aliveRef.current) {
              setScanStatus('done')
              onScan?.(codes[0].rawValue)
              return
            }
          } catch {
            // ignore per-frame decode errors (e.g. blurry frames)
          }
        }
        if (aliveRef.current) {
          timerId.current = setTimeout(tick, POLL_MS)
        }
      }

      tick()
    }

    run()

    return () => {
      aliveRef.current = false
      clearTimeout(timerId.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop())
        streamRef.current = null
      }
      if (videoEl) videoEl.srcObject = null
    }
  }, [onScan, onNotSupported, onDenied, onError])

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-2xl bg-black shadow-inner"
      style={{ aspectRatio: '1 / 1', maxWidth: 360 }}
    >
      {/* Live camera feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Requesting overlay */}
      {scanStatus === 'requesting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <svg className="mb-3 h-7 w-7 animate-spin opacity-70" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm">{t('checkin.requesting')}</p>
        </div>
      )}

      {/* Scanning UI — corner brackets + animated scan line */}
      {scanStatus === 'scanning' && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48">
              <span className="absolute left-0 top-0 block h-8 w-8 rounded-tl border-l-2 border-t-2 border-white" />
              <span className="absolute right-0 top-0 block h-8 w-8 rounded-tr border-r-2 border-t-2 border-white" />
              <span className="absolute bottom-0 left-0 block h-8 w-8 rounded-bl border-b-2 border-l-2 border-white" />
              <span className="absolute bottom-0 right-0 block h-8 w-8 rounded-br border-b-2 border-r-2 border-white" />
              <div className="animate-scan-line absolute left-0 right-0 h-0.5 bg-indigo-400/80 blur-[1px]" />
            </div>
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <p className="rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
              {t('checkin.cameraActive')}
            </p>
          </div>
        </>
      )}

      {/* Success flash */}
      {scanStatus === 'done' && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/80">
          <svg
            className="h-16 w-16 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )}
    </div>
  )
}
