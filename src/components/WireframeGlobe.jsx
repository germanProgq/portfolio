import { useRef, useEffect } from 'react'

const LAT   = 11
const LON   = 18
const SEGS  = 72
const SPEED = 0.0018
const TILT  = 0.38     /* ~22° axial lean */
const FA    = 0.14     /* front-face opacity */
const BA    = 0.045    /* back-face opacity  */

function pt(lat, lon, angle, cx, cy, R) {
  /* sphere */
  const x0 = Math.cos(lat) * Math.cos(lon)
  const y0 = Math.sin(lat)
  const z0 = Math.cos(lat) * Math.sin(lon)
  /* spin Y */
  const ca = Math.cos(angle), sa = Math.sin(angle)
  const x1 = x0 * ca - z0 * sa
  const y1 = y0
  const z1 = x0 * sa + z0 * ca
  /* tilt Z */
  const ct = Math.cos(TILT), st = Math.sin(TILT)
  const x2 = x1 * ct - y1 * st
  const y2 = x1 * st + y1 * ct
  const z2 = z1
  /* perspective */
  const s = 1 / (1.55 - z2 * 0.45)
  return { sx: cx + x2 * R * s, sy: cy + y2 * R * s, z: z2 }
}

function drawRing(ctx, pts) {
  /* draw front (z≥0) and back (z<0) as separate paths in one pass */
  const front = [], back = []
  pts.forEach((p, i) => {
    const arr = p.z >= 0 ? front : back
    arr.push({ ...p, first: i === 0 || pts[i - 1].z * p.z < 0 })
  })

  const stroke = (segs, alpha) => {
    if (!segs.length) return
    ctx.beginPath()
    ctx.strokeStyle = `rgba(255,92,92,${alpha})`
    segs.forEach(({ sx, sy, first }) => {
      if (first) ctx.moveTo(sx, sy)
      else       ctx.lineTo(sx, sy)
    })
    ctx.stroke()
  }

  stroke(front, FA)
  stroke(back,  BA)
}

export default function WireframeGlobe() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')
    const dpr  = Math.min(window.devicePixelRatio || 1, 2)

    let W = 0, H = 0, cx = 0, cy = 0, R = 0
    let angle = 0, raf

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return   /* not laid out yet */
      W = rect.width
      H = rect.height
      canvas.width  = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = W * 0.52
      cy = H * 0.50
      R  = Math.min(W * 0.50, H * 0.72)
    }

    /* retry until the section has been laid out */
    const init = () => {
      resize()
      if (W === 0) { setTimeout(init, 60); return }
      raf = requestAnimationFrame(draw)
    }

    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (!W || !H) return
      ctx.clearRect(0, 0, W, H)
      angle += SPEED
      ctx.lineWidth = 0.7

      for (let i = 0; i <= LAT; i++) {
        const lat = (i / LAT) * Math.PI - Math.PI / 2
        const pts = Array.from({ length: SEGS + 1 }, (_, j) =>
          pt(lat, (j / SEGS) * Math.PI * 2, angle, cx, cy, R)
        )
        drawRing(ctx, pts)
      }
      for (let i = 0; i < LON; i++) {
        const lon = (i / LON) * Math.PI * 2
        const pts = Array.from({ length: SEGS + 1 }, (_, j) =>
          pt((j / SEGS) * Math.PI - Math.PI / 2, lon, angle, cx, cy, R)
        )
        drawRing(ctx, pts)
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    init()

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}
