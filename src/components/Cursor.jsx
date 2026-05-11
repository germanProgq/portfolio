import { useEffect, useRef } from 'react'
import initCursorEngine from '../wasm/cursor_engine.wasm?init'

const fallbackSmoothAxis = (current, target, lerp, snapEpsilon) => {
  const delta = target - current
  return Math.abs(delta) < snapEpsilon ? target : current + delta * lerp
}

export default function Cursor() {
  const cursorRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const current = useRef({ x: -100, y: -100 })
  const rafRef = useRef(null)
  const smoothAxisRef = useRef(fallbackSmoothAxis)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    let cancelled = false
    const cursor = cursorRef.current
    if (!cursor) return
    cursor.style.display = 'block'
    cursor.style.transform = 'translate3d(-200px, -200px, 0) translate(-50%, -50%) scale(1)'

    initCursorEngine()
      .then((instance) => {
        if (!cancelled && typeof instance.exports.smooth_axis === 'function') {
          smoothAxisRef.current = instance.exports.smooth_axis
        }
      })
      .catch(() => {
        smoothAxisRef.current = fallbackSmoothAxis
      })

    const onMouseMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const setInteractive = (active) => {
      cursor.dataset.active = active ? 'true' : 'false'
      cursor.style.mixBlendMode = 'difference'
    }

    const onPointerOver = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setInteractive(true)
    }

    const onPointerOut = (e) => {
      const fromInteractive = e.target.closest('a, button, [data-cursor]')
      const toInteractive = e.relatedTarget?.closest?.('a, button, [data-cursor]')
      if (fromInteractive && !toInteractive) {
        cursor.dataset.active = 'false'
        cursor.style.mixBlendMode = 'normal'
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const onMouseLeaveWindow = () => {
      cursor.dataset.visible = 'false'
      cursor.style.opacity = '0'
    }

    const onMouseEnterWindow = () => {
      cursor.dataset.visible = 'true'
      cursor.style.opacity = '1'
      cursor.style.mixBlendMode = 'normal'
    }

    const lerp = 0.22
    const snapEpsilon = 0.1

    const tick = () => {
      const smoothAxis = smoothAxisRef.current
      current.current.x = smoothAxis(current.current.x, pos.current.x, lerp, snapEpsilon)
      current.current.y = smoothAxis(current.current.y, pos.current.y, lerp, snapEpsilon)

      const scale = cursor.dataset.active === 'true' ? 2.2 : 1
      cursor.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%) scale(${scale})`
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointerout', onPointerOut)
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.documentElement.addEventListener('mouseleave', onMouseLeaveWindow)
    document.documentElement.addEventListener('mouseenter', onMouseEnterWindow)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.documentElement.removeEventListener('mouseleave', onMouseLeaveWindow)
      document.documentElement.removeEventListener('mouseenter', onMouseEnterWindow)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: '0',
        top: '0',
        width: '18px',
        height: '18px',
        pointerEvents: 'none',
        zIndex: 99999,
        transform: 'translate3d(-200px, -200px, 0) translate(-50%, -50%) scale(1)',
        transition: 'opacity 0.15s ease, mix-blend-mode 0.15s',
        display: 'none',
        opacity: 1,
        willChange: 'transform',
      }}
      data-active="false"
      data-visible="true"
      aria-hidden="true"
    >
      <div style={{
        position: 'absolute', left: '50%', top: 0,
        width: '1px', height: '100%',
        background: 'var(--fg)', transform: 'translateX(-50%)',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: 0,
        height: '1px', width: '100%',
        background: 'var(--fg)', transform: 'translateY(-50%)',
      }} />
    </div>
  )
}
