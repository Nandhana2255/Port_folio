import { useEffect, useRef, useState } from 'react'

const N_FRAMES = 64
const FRAME_WIDTH = 1280
const FRAME_HEIGHT = 720
const ANGLE_SMOOTHING_MS = 105
const DEADZONE_RADIUS = 0.12    // 12% of viewport diagonal = eye-contact zone

/**
 * Shortest-path angular lerp — never spins the long way around.
 * Operates in radians.
 */
function lerpAngle(current, target, factor) {
  let diff = target - current
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  return current + diff * factor
}

/**
 * CharacterCanvas — zero-ghosting, 60fps cursor-tracking canvas renderer.
 *
 * CONSTRAINTS HONORED:
 *  1. Zero CSS 3D transforms (no perspective, rotateX, rotateY on canvas/container)
 *  2. No video.currentTime seeking or video.play() at runtime
 *  3. Frames pre-extracted as WebP via Python/OpenCV, preloaded into HTMLImageElement[]
 *  4. requestAnimationFrame loop with lerpAngle + exact single-frame draw (NO alpha blending)
 *  5. Deadzone: cursor near face → center.webp (direct eye contact)
 *  6. Background matches video red: #c1281c
 */
export default function CharacterCanvas() {
  const canvasRef = useRef(null)
  const framesRef = useRef([])         // Image[64] for directional frames
  const centerRef = useRef(null)       // Image for center.webp
  const loadedRef = useRef(0)

  const [loadProgress, setLoadProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const smoothAngleRef = useRef(0)       // radians, smoothed each RAF tick
  const rafRef = useRef(null)

  const TOTAL_ASSETS = N_FRAMES + 1

  // ─── 1. Preload all WebP frames into Image objects ────────────────────────
  useEffect(() => {
    function onAssetLoad() {
      const n = ++loadedRef.current
      setLoadProgress(n / TOTAL_ASSETS)
      if (n === TOTAL_ASSETS) setIsReady(true)
    }

    const imgs = Array.from({ length: N_FRAMES }, (_, i) => {
      const img = new Image()
      img.onload = onAssetLoad
      img.onerror = onAssetLoad  // don't hang on 404
      img.src = `/frames/${String(i).padStart(3, '0')}.webp`
      return img
    })
    framesRef.current = imgs

    const center = new Image()
    center.onload = onAssetLoad
    center.onerror = onAssetLoad
    center.src = '/frames/center.webp'
    centerRef.current = center
  }, [TOTAL_ASSETS])

  // ─── 2. Mouse / touch tracking ────────────────────────────────────────────
  useEffect(() => {
    const onMouse = e => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onTouch = e => {
      const t = e.touches[0]
      mouseRef.current = { x: t.clientX, y: t.clientY }
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  // ─── 3. 60fps RAF render loop ──────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return
    const canvas = canvasRef.current
    if (!canvas) return

    // Keep at least one backing pixel per source pixel in the visible crop.
    function syncSize() {
      const cvs = canvasRef.current
      if (!cvs) return
      const rect = cvs.getBoundingClientRect()
      const sourceScale = Math.max(rect.width / FRAME_WIDTH, rect.height / FRAME_HEIGHT)
      const renderScale = Math.max(window.devicePixelRatio || 1, 1 / sourceScale)
      const W = Math.round(rect.width * renderScale)
      const H = Math.round(rect.height * renderScale)
      if (cvs.width !== W || cvs.height !== H) {
        cvs.width = W
        cvs.height = H
      }
    }

    syncSize()

    // ── Draw function ──
    let previousFrameTime = 0

    function render(timestamp) {
      const cvs = canvasRef.current
      if (!cvs) return

      const elapsed = previousFrameTime
        ? Math.min(timestamp - previousFrameTime, 50)
        : 16.67
      previousFrameTime = timestamp
      const smoothing = 1 - Math.exp(-elapsed / ANGLE_SMOOTHING_MS)

      const rect = cvs.getBoundingClientRect()
      const W = rect.width
      const H = rect.height

      const ctx = cvs.getContext('2d', { alpha: false })
      ctx.setTransform(cvs.width / W, 0, 0, cvs.height / H, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // ── Face center in screen (viewport) coords ──
      // The face sits near the center of the full-viewport frame.
      const faceCx = rect.left + rect.width * 0.50
      const faceCy = rect.top + rect.height * 0.38

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Deadzone: is cursor within 12% of viewport diagonal from face?
      const vDiag = Math.hypot(window.innerWidth, window.innerHeight)
      const dist = Math.hypot(mx - faceCx, my - faceCy)
      const inDeadzone = dist < vDiag * DEADZONE_RADIUS

      // Smoothly follow the cursor, returning to a forward gaze in the deadzone.
      const targetAngle = inDeadzone
        ? 0
        : Math.atan2(my - faceCy, mx - faceCx)

      smoothAngleRef.current = lerpAngle(
        smoothAngleRef.current,
        targetAngle,
        smoothing,
      )

      const angle = smoothAngleRef.current

      // The source sequence runs left, down, right, up from frame 000.
      // Invert the pointer angle and offset by half a turn to match it.
      const angleNorm = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const framePosition = (N_FRAMES / 2 - (angleNorm / (2 * Math.PI)) * N_FRAMES + N_FRAMES) % N_FRAMES
      const frameIndex = Math.round(framePosition) % N_FRAMES

      // ── Choose image: center.webp when in deadzone, directional otherwise ──
      // Use center.webp immediately when cursor is near face (direct eye contact)
      const img = inDeadzone ? centerRef.current : framesRef.current[frameIndex]

      // ── Draw exactly ONE frame — NO alpha blending, NO double draw ──
      if (img && img.complete && img.naturalWidth > 0) {
        // 1. Fill background with exact video red (prevents edge bleed artifacts)
        ctx.fillStyle = '#c1281c'
        ctx.fillRect(0, 0, W, H)

        // 2. "Cover" fit: scale image to fill canvas without distortion
        const iw = img.naturalWidth
        const ih = img.naturalHeight
        const scale = Math.max(W / iw, H / ih)
        const dw = iw * scale
        const dh = ih * scale
        const dx = (W - dw) / 2
        const dy = (H - dh) / 2

        // Draw single frame at 100% opacity — zero ghost
        ctx.globalAlpha = 1
        ctx.drawImage(img, dx, dy, dw, dh)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    const ro = new ResizeObserver(syncSize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [isReady])

  return (
    <div className="character-wrap" id="character-wrap">
      {/* Loading overlay — shown while preloading WebP frames */}
      {!isReady && (
        <div className="character-loading" id="character-loading" aria-live="polite">
          <div className="loading-bar" role="progressbar"
            aria-valuenow={Math.round(loadProgress * 100)} aria-valuemin="0" aria-valuemax="100">
            <div
              className="loading-progress"
              style={{ width: `${Math.round(loadProgress * 100)}%` }}
            />
          </div>
          <span>Loading…&nbsp;{Math.round(loadProgress * 100)}%</span>
        </div>
      )}

      {/*
        THE CANVAS — strictly 2D, no 3D transforms whatsoever.
        Width/height are controlled via JS (DPR-aware); CSS sizes via className.
      */}
      <canvas
        ref={canvasRef}
        className="character-canvas"
        id="character-canvas"
        style={{ display: isReady ? 'block' : 'none' }}
      />

      {isReady && (
        <p className="character-hint" id="character-hint" aria-hidden="true">
          <svg
            className="hint-cursor-icon"
            viewBox="0 0 24 24" fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.5 2.5l15 9.5-7.5 1-3.5 8z" opacity="0.6" />
          </svg>
          move your cursor
        </p>
      )}
    </div>
  )
}
