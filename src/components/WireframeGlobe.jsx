import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LAT   = 11
const LON   = 18
const SEGS  = 72
const SPEED = 0.0018
const TILT  = 0.38     /* ~22° axial lean */
const FA    = 0.14     /* front-face opacity */
const BA    = 0.045    /* back-face opacity  */

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const WIRE_DEFS = [
  ...Array.from({ length: LAT + 1 }, (_, i) => ({
    kind: 'lat',
    value: (i / LAT) * Math.PI - Math.PI / 2,
    delay: (i / LAT) * 0.55,
    span: 0.26,
  })),
  ...Array.from({ length: LON }, (_, i) => ({
    kind: 'lon',
    value: (i / LON) * Math.PI * 2,
    delay: 0.12 + (i / Math.max(1, LON - 1)) * 0.62,
    span: 0.25,
  })),
]

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

function lerpPoint(a, b, t) {
  return {
    sx: a.sx + (b.sx - a.sx) * t,
    sy: a.sy + (b.sy - a.sy) * t,
    z: a.z + (b.z - a.z) * t,
  }
}

function drawSegment(ctx, from, to, alphaScale) {
  const alpha = ((from.z + to.z) / 2 >= 0 ? FA : BA) * alphaScale
  ctx.beginPath()
  ctx.strokeStyle = `rgba(255,92,92,${alpha})`
  ctx.moveTo(from.sx, from.sy)
  ctx.lineTo(to.sx, to.sy)
  ctx.stroke()
}

function drawWire(ctx, pts, progress, alphaScale = 1) {
  const amount = clamp01(progress)
  if (amount <= 0) return null

  const totalSegments = pts.length - 1
  const scaled = amount * totalSegments
  const fullSegments = Math.floor(scaled)
  const partial = scaled - fullSegments
  let tip = pts[0]

  for (let i = 1; i <= fullSegments; i++) {
    drawSegment(ctx, pts[i - 1], pts[i], alphaScale)
    tip = pts[i]
  }

  if (fullSegments < totalSegments && partial > 0) {
    tip = lerpPoint(pts[fullSegments], pts[fullSegments + 1], partial)
    drawSegment(ctx, pts[fullSegments], tip, alphaScale)
  }

  return tip
}

function drawGlowTip(ctx, point, alpha) {
  if (!point || alpha <= 0) return

  const glow = ctx.createRadialGradient(point.sx, point.sy, 0, point.sx, point.sy, 18)
  glow.addColorStop(0, `rgba(255,120,120,${alpha})`)
  glow.addColorStop(0.24, `rgba(255,92,92,${alpha * 0.45})`)
  glow.addColorStop(1, 'rgba(255,92,92,0)')

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(point.sx, point.sy, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(255,180,180,${Math.min(1, alpha + 0.12)})`
  ctx.beginPath()
  ctx.arc(point.sx, point.sy, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export default function WireframeGlobe({ triggerRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')
    const dpr  = Math.min(window.devicePixelRatio || 1, 2)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const motion = {
      draw: reducedMotion ? 1 : 0,
    }

    let W = 0, H = 0, cx = 0, cy = 0, R = 0
    let angle = 0, raf, initTimer, timeline

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
      if (reducedMotion) drawFrame()
    }

    const drawFrame = () => {
      if (!W || !H) return

      ctx.clearRect(0, 0, W, H)
      ctx.lineWidth = 0.7
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.save()
      const activeTips = []
      const drawAmount = clamp01(motion.draw)

      WIRE_DEFS.forEach((wire) => {
        const localProgress = clamp01((drawAmount - wire.delay) / wire.span)
        if (localProgress <= 0) return

        const pts = Array.from({ length: SEGS + 1 }, (_, j) => {
          if (wire.kind === 'lat') {
            return pt(wire.value, (j / SEGS) * Math.PI * 2, angle, cx, cy, R)
          }
          return pt((j / SEGS) * Math.PI - Math.PI / 2, wire.value, angle, cx, cy, R)
        })

        const active = localProgress > 0 && localProgress < 1
        const tip = drawWire(ctx, pts, localProgress, active ? 1.25 : 1)
        if (active) {
          activeTips.push({
            point: tip,
            alpha: 0.2 + Math.sin(localProgress * Math.PI) * 0.52,
          })
        }
      })

      ctx.restore()

      activeTips.forEach(({ point, alpha }) => drawGlowTip(ctx, point, alpha))
    }

    /* retry until the section has been laid out */
    const init = () => {
      resize()
      if (W === 0) { initTimer = setTimeout(init, 60); return }

      if (reducedMotion) {
        drawFrame()
        return
      }

      const trigger = triggerRef?.current || canvas.parentElement
      timeline = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: 'top 72%',
          once: true,
        },
      })

      timeline.to(motion, { draw: 1, duration: 3.5, ease: 'power1.inOut' })

      raf = requestAnimationFrame(draw)
    }

    const draw = () => {
      raf = requestAnimationFrame(draw)
      angle += SPEED
      drawFrame()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    init()

    return () => {
      clearTimeout(initTimer)
      cancelAnimationFrame(raf)
      timeline?.scrollTrigger?.kill()
      timeline?.kill()
      ro.disconnect()
    }
  }, [triggerRef])

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
