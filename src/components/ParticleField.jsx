import { useRef, useEffect } from 'react'

/* ─── tunables ─── */
const MAX_DIST   = 130
const SPEED      = 0.13
const BASE_A     = 0.022   /* resting opacity — barely there */
const HOVER_A    = 0.16    /* peak near cursor */
const MOUSE_R    = 160
const IDLE_DIM   = 0.38
const IDLE_DELAY = 2600    /* ms before field dims after last move */

function nodeCount() {
  const w = window.innerWidth
  if (w < 640)  return 24
  if (w < 1024) return 38
  return 55
}

export default function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    /* ── sizing ── */
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const W = window.innerWidth, H = window.innerHeight
      canvas.width  = W * dpr
      canvas.height = H * dpr
      canvas.style.width  = W + 'px'
      canvas.style.height = H + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()

    /* ── nodes ── */
    let W = window.innerWidth, H = window.innerHeight
    let N = nodeCount()

    const mk = () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * SPEED,
      vy:    (Math.random() - 0.5) * SPEED,
      phase: Math.random() * Math.PI * 2,
      r:     Math.random() > 0.82 ? 1.7 : 1.0,
      a:     BASE_A,
    })

    let nodes = Array.from({ length: N }, mk)

    /* ── mouse ── */
    const mouse    = { x: -9999, y: -9999 }
    let globalMult = IDLE_DIM
    let targetMult = IDLE_DIM
    let fadeTimer  = null
    let lastMouse  = 0

    const onMove = (e) => {
      const now = performance.now()
      if (now - lastMouse < 16) return  /* throttle to ~60fps */
      lastMouse = now
      mouse.x = e.clientX
      mouse.y = e.clientY
      targetMult = 1.0
      clearTimeout(fadeTimer)
      fadeTimer = setTimeout(() => { targetMult = IDLE_DIM }, IDLE_DELAY)
    }

    /* ── visibility ── */
    let paused = false
    const onVisible = () => { paused = document.hidden }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('mousemove', onMove, { passive: true })

    /* ── resize ── */
    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      N = nodeCount()
      /* repopulate to new count */
      while (nodes.length < N) nodes.push(mk())
      if (nodes.length > N) nodes.length = N
      resize()
    }
    window.addEventListener('resize', onResize, { passive: true })

    /* ── draw loop ── */
    let raf
    const draw = (t) => {
      raf = requestAnimationFrame(draw)
      if (paused) return

      ctx.clearRect(0, 0, W, H)
      globalMult += (targetMult - globalMult) * 0.022

      /* update */
      nodes.forEach(n => {
        n.x += n.vx + Math.sin(t * 0.00036 + n.phase) * 0.065
        n.y += n.vy + Math.cos(t * 0.00029 + n.phase * 1.3) * 0.052
        if (n.x < 0)  { n.x = 0; n.vx =  Math.abs(n.vx) }
        if (n.x > W)  { n.x = W; n.vx = -Math.abs(n.vx) }
        if (n.y < 0)  { n.y = 0; n.vy =  Math.abs(n.vy) }
        if (n.y > H)  { n.y = H; n.vy = -Math.abs(n.vy) }
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y)
        const prox = d < MOUSE_R ? 1 - d / MOUSE_R : 0
        n.a = (BASE_A + (HOVER_A - BASE_A) * prox) * globalMult
      })

      /* connections */
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > MAX_DIST * MAX_DIST) continue
          const fade = 1 - Math.sqrt(d2) / MAX_DIST
          const la   = Math.max(a.a, b.a) * fade * 0.7
          /* near-cursor: tint accent; resting: near-white */
          const br  = la / (HOVER_A * globalMult + 0.001)
          const rCh = Math.round(240 + 15 * br)
          const gCh = Math.round(240 - 148 * Math.min(br, 1))
          ctx.strokeStyle = `rgba(${rCh},${gCh},${gCh},${la})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      /* dots */
      nodes.forEach(n => {
        const br = n.a / (HOVER_A * globalMult + 0.001)
        ctx.shadowBlur  = n.r > 1.5 && br > 0.5 ? 5 : 0
        ctx.shadowColor = `rgba(255,92,92,${n.a * 0.7})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240,240,240,${n.a * 1.5})`
        ctx.fill()
      })
      ctx.shadowBlur = 0
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fadeTimer)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}
