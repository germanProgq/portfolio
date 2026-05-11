import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const current = useRef({ x: -100, y: -100 })
  const rafRef = useRef(null)
  const isRunningRef = useRef(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return
    cursor.style.display = 'block'
    cursor.style.transform = 'translate3d(-200px, -200px, 0) translate(-50%, -50%) scale(1)'

    const lerp = 0.22
    const snapEpsilon = 0.1

    const updateCursor = () => {
      const scale = cursor.dataset.active === 'true' ? 2.2 : 1
      cursor.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%) scale(${scale})`
    }

    const tick = () => {
      const dx = pos.current.x - current.current.x
      const dy = pos.current.y - current.current.y

      current.current.x = Math.abs(dx) < snapEpsilon
        ? pos.current.x
        : current.current.x + dx * lerp
      current.current.y = Math.abs(dy) < snapEpsilon
        ? pos.current.y
        : current.current.y + dy * lerp

      updateCursor()

      const isSettled = current.current.x === pos.current.x && current.current.y === pos.current.y
      if (isSettled) {
        isRunningRef.current = false
        rafRef.current = null
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (document.hidden || isRunningRef.current) return
      isRunningRef.current = true
      rafRef.current = requestAnimationFrame(tick)
    }

    const stopLoop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      isRunningRef.current = false
    }

    const onMouseMove = (e) => {
      pos.current.x = e.clientX
      pos.current.y = e.clientY
      startLoop()
    }

    const setInteractive = (active) => {
      cursor.dataset.active = active ? 'true' : 'false'
      startLoop()
    }

    const onPointerOver = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setInteractive(true)
    }

    const onPointerOut = (e) => {
      const fromInteractive = e.target.closest('a, button, [data-cursor]')
      const toInteractive = e.relatedTarget?.closest?.('a, button, [data-cursor]')
      if (fromInteractive && !toInteractive) {
        setInteractive(false)
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop()
        return
      }
      startLoop()
    }

    const onMouseLeaveWindow = () => {
      cursor.dataset.visible = 'false'
      cursor.style.opacity = '0'
      stopLoop()
    }

    const onMouseEnterWindow = () => {
      cursor.dataset.visible = 'true'
      cursor.style.opacity = '1'
      startLoop()
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointerout', onPointerOut)
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.documentElement.addEventListener('mouseleave', onMouseLeaveWindow)
    document.documentElement.addEventListener('mouseenter', onMouseEnterWindow)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.documentElement.removeEventListener('mouseleave', onMouseLeaveWindow)
      document.documentElement.removeEventListener('mouseenter', onMouseEnterWindow)
      stopLoop()
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
        transition: 'opacity 0.15s ease',
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
