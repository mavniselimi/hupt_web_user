/**
 * QRScanner — cross-browser mobile QR code scanner
 *
 * Decoding strategy (tiered, auto-selected):
 *
 *   Tier 1 — BarcodeDetector API
 *     Chrome 88+ desktop/Android, Safari 17+ / iOS 17+.
 *     Works directly on the <video> element; zero CPU copy overhead.
 *
 *   Tier 2 — jsqr (pure JS, imported as npm dep)
 *     All browsers that support getUserMedia: iOS Safari < 17, older Chrome,
 *     Firefox, Samsung Internet, WebView, etc.
 *     Draws each frame onto a hidden <canvas> and passes the pixel data to
 *     jsQR which decodes entirely in JS, no native binding required.
 *
 * Both tiers share the same lifecycle:
 *   mount → request camera → stream to <video> → poll frames → onScan() → done
 *
 * Props (all should be useCallback-memoised by the parent):
 *   onScan(value)      called once with the decoded QR string
 *   onNotSupported()   no getUserMedia *and* jsqr failed (very rare)
 *   onDenied()         camera permission denied
 *   onError(err)       other getUserMedia / setup failure
 */
import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { useT } from '@/i18n/useT'

const POLL_MS = 250   // ms between decode attempts — balance speed vs CPU

export function QRScanner({ onScan, onNotSupported, onDenied, onError }) {
  const { t } = useT()

  const videoRef  = useRef(null)
  const canvasRef = useRef(null)   // hidden canvas for jsQR pixel capture
  const streamRef = useRef(null)
  const aliveRef  = useRef(false)
  const timerId   = useRef(null)

  // 'requesting' | 'scanning' | 'done'
  // Starts as 'requesting' because camera acquisition begins immediately.
  // All subsequent setScanStatus() calls happen inside the async `run()`
  // function, always after at least one `await`, satisfying the strict
  // eslint-plugin-react-hooks v7 `set-state-in-effect` rule.
  const [scanStatus, setScanStatus] = useState('requesting')

  useEffect(() => {
    aliveRef.current = true
    const videoEl = videoRef.current   // captured for cleanup

    async function run() {
      // ── Tier selection ──────────────────────────────────────────
      // Try to create a native BarcodeDetector first. If unavailable
      // or throws, we rely entirely on jsQR (always available since it
      // is a bundled npm dependency, not a runtime CDN load).
      let detector = null
      if ('BarcodeDetector' in window) {
        try {
          detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        } catch {
          detector = null
        }
      }
      // jsQR is always importable; detector === null means we use it.

      // ── Camera access ───────────────────────────────────────────
      if (!navigator.mediaDevices?.getUserMedia) {
        // Extremely old browser or non-secure context (HTTP).
        // jsQR can decode but we have no way to get frames.
        onNotSupported?.()
        return
      }

      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },   // rear camera on mobile
            width:  { ideal: 1280 },
            height: { ideal: 720  },
          },
          audio: false,
        })
      } catch (err) {
        if (!aliveRef.current) return
        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError'
        ) {
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

      // ── Attach stream to <video> ────────────────────────────────
      const video = videoRef.current
      if (!video) return

      video.srcObject   = stream
      video.muted       = true          // required for iOS Safari autoplay policy
      video.playsInline = true          // required for inline playback on iOS

      try {
        await video.play()
      } catch {
        // Non-fatal — tick() guards on readyState
      }

      if (!aliveRef.current) return

      // Safe to setState: we are past at least one `await`.
      setScanStatus('scanning')

      // ── Polling decode loop ─────────────────────────────────────
      // Canvas is only used by the jsQR path; BarcodeDetector receives
      // the video element directly. We create the 2d context once with
      // `willReadFrequently` so the browser can optimise pixel readbacks.
      const canvas = canvasRef.current
      const ctx    = canvas
        ? canvas.getContext('2d', { willReadFrequently: true })
        : null

      async function tick() {
        if (!aliveRef.current) return

        const v = videoRef.current
        // Wait until at least one frame is available (readyState ≥ 2)
        if (!v || v.readyState < 2) {
          timerId.current = setTimeout(tick, POLL_MS)
          return
        }

        try {
          if (detector) {
            // ── Tier 1: BarcodeDetector ─────────────────────────
            const codes = await detector.detect(v)
            if (codes.length > 0 && aliveRef.current) {
              setScanStatus('done')
              onScan?.(codes[0].rawValue)
              return
            }
          } else if (ctx && canvas) {
            // ── Tier 2: jsQR canvas decode ──────────────────────
            const w = v.videoWidth  || 640
            const h = v.videoHeight || 480
            canvas.width  = w
            canvas.height = h
            ctx.drawImage(v, 0, 0, w, h)

            const imageData = ctx.getImageData(0, 0, w, h)
            // inversionAttempts: 'dontInvert' is fastest and correct for
            // standard dark-on-light QR codes shown on screens / paper.
            const result = jsQR(
              imageData.data,
              imageData.width,
              imageData.height,
              { inversionAttempts: 'dontInvert' },
            )
            if (result && aliveRef.current) {
              setScanStatus('done')
              onScan?.(result.data)
              return
            }
          }
        } catch {
          // Ignore per-frame errors: blurry / partial frames are normal
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

  /* ── Render ─────────────────────────────────────────────────── */

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

      {/* Hidden canvas — only used by the jsQR decode path */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Requesting overlay */}
      {scanStatus === 'requesting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <svg
            className="mb-3 h-7 w-7 animate-spin opacity-70"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="text-sm">{t('checkin.requesting')}</p>
        </div>
      )}

      {/* Scanning UI — corner brackets + animated scan line */}
      {scanStatus === 'scanning' && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48">
              {/* Corners */}
              <span className="absolute left-0  top-0    block h-8 w-8 rounded-tl border-l-2 border-t-2 border-white" />
              <span className="absolute right-0 top-0    block h-8 w-8 rounded-tr border-r-2 border-t-2 border-white" />
              <span className="absolute bottom-0 left-0  block h-8 w-8 rounded-bl border-b-2 border-l-2 border-white" />
              <span className="absolute bottom-0 right-0 block h-8 w-8 rounded-br border-b-2 border-r-2 border-white" />
              {/* Animated scan line */}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
