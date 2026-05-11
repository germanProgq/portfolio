import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { contentEn, contentRu } from '../data/content'

const LanguageContext = createContext(null)

const TEXT_SELECTOR = '[data-i18n]'

function getTextNodes() {
  return gsap.utils
    .toArray(TEXT_SELECTOR)
    .filter((el) => {
      if (!el.isConnected || el.getClientRects().length === 0) return false
      const rect = el.getBoundingClientRect()
      return rect.bottom > -80 && rect.top < window.innerHeight + 80
    })
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [transitionLabel, setTransitionLabel] = useState('RU')

  const overlayRef  = useRef(null)
  const scanRef     = useRef(null)
  const wakeRef     = useRef(null)
  const flashRef    = useRef(null)
  const bar0Ref     = useRef(null)
  const bar1Ref     = useRef(null)
  const bar2Ref     = useRef(null)
  const codeRef     = useRef(null)
  const gridRef     = useRef(null)
  const busyRef     = useRef(false)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const switchLanguage = useCallback((targetLang) => {
    if (busyRef.current || targetLang === lang) return
    busyRef.current = true

    const overlay = overlayRef.current
    const scan    = scanRef.current
    const wake    = wakeRef.current
    const flash   = flashRef.current
    const code    = codeRef.current
    const grid    = gridRef.current
    const bars    = [bar0Ref.current, bar1Ref.current, bar2Ref.current]
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (!overlay || reduceMotion) {
      setLang(targetLang)
      busyRef.current = false
      return
    }

    setTransitionLabel(targetLang.toUpperCase())
    if (code) code.textContent = targetLang.toUpperCase()

    const vh = window.innerHeight
    const outgoingText = getTextNodes()
    const tl = gsap.timeline({
      onComplete() {
        gsap.set(overlay, { display: 'none' })
        gsap.set(getTextNodes(), { clearProps: 'opacity,transform,filter,willChange' })
        busyRef.current = false
      },
    })

    /* ── initial states ── */
    gsap.set(overlay,  { display: 'block', opacity: 0 })
    gsap.set(scan,     { y: 0,  opacity: 1 })
    gsap.set(wake,     { y: -120, opacity: 0.55 })
    gsap.set(flash,    { opacity: 0 })
    gsap.set(code,     { xPercent: -50, yPercent: -50, opacity: 0, y: 18, scale: 0.98 })
    gsap.set(grid,     { opacity: 0, scale: 1.04 })
    gsap.set(outgoingText, { willChange: 'transform, opacity, filter' })
    bars.forEach((bar, i) => {
      if (!bar) return
      const topPct = 18 + i * 27
      gsap.set(bar, {
        top: `${topPct}%`, opacity: 0, scaleX: 0,
        transformOrigin: i % 2 === 0 ? 'left center' : 'right center',
      })
    })

    tl
      /* 1. Overlay slams in */
      .to(overlay, { opacity: 1, duration: 0.11, ease: 'power4.in' })

      /* 2. Scan line + wake sweep top → bottom */
      .to([scan, wake], {
        y: vh + 130,
        duration: 0.46,
        ease: 'power2.inOut',
      }, 0.09)
      .to(grid, { opacity: 0.28, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.06)
      .to(code, {
        opacity: 0.9,
        y: 0,
        scale: 1,
        duration: 0.18,
        ease: 'power3.out',
      }, 0.11)
      .to(outgoingText, {
        opacity: 0.08,
        y: -12,
        filter: 'blur(8px)',
        duration: 0.18,
        ease: 'power3.in',
        stagger: { each: 0.004, from: 'random' },
      }, 0.12)

      /* 3. Glitch bars flash at staggered points during sweep */
      .to(bars[0], { opacity: 0.55, scaleX: 1, duration: 0.07 }, 0.14)
      .to(bars[0], { opacity: 0,   duration: 0.11 }, 0.22)
      .to(bars[1], { opacity: 0.38, scaleX: 1, duration: 0.06 }, 0.25)
      .to(bars[1], { opacity: 0,   duration: 0.10 }, 0.32)
      .to(bars[2], { opacity: 0.48, scaleX: 1, duration: 0.07 }, 0.37)
      .to(bars[2], { opacity: 0,   duration: 0.09 }, 0.45)

      /* 4. Language flips mid-sweep */
      .call(() => {
        setLang(targetLang)
        requestAnimationFrame(() => {
          const incomingText = getTextNodes()
          gsap.set(incomingText, { willChange: 'transform, opacity, filter' })
          gsap.fromTo(
            incomingText,
            { opacity: 0, y: 18, filter: 'blur(12px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.52,
              ease: 'expo.out',
              stagger: { each: 0.006, from: 'random' },
              onComplete: () => gsap.set(incomingText, { clearProps: 'opacity,transform,filter,willChange' }),
            }
          )
        })
      }, [], 0.27)

      /* 5. Brief white flare at the pivot point */
      .to(flash, { opacity: 0.07, duration: 0.05 }, 0.28)
      .to(flash, { opacity: 0,   duration: 0.16 }, 0.34)
      .to(code, { opacity: 0, y: -12, duration: 0.2, ease: 'power2.in' }, 0.38)
      .to(grid, { opacity: 0, scale: 0.98, duration: 0.22, ease: 'power2.in' }, 0.42)

      /* 6. Overlay dissolves out */
      .to(overlay, { opacity: 0, duration: 0.24, ease: 'power3.out' }, 0.52)
  }, [lang])

  const content = useMemo(
    () => (lang === 'ru' ? contentRu : contentEn),
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, content }}>
      {children}

      {/* ── Cinematic transition overlay ── */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          display: 'none', overflow: 'hidden',
          background: '#080808', pointerEvents: 'none',
        }}
      >
        <div ref={gridRef} style={{
          position: 'absolute',
          inset: '-12%',
          backgroundImage: [
            'linear-gradient(rgba(255,92,92,0.15) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,92,92,0.12) 1px, transparent 1px)',
            'radial-gradient(circle at 50% 50%, rgba(255,92,92,0.18), transparent 42%)',
          ].join(','),
          backgroundSize: '52px 52px, 52px 52px, 100% 100%',
          transformOrigin: 'center',
          opacity: 0,
          pointerEvents: 'none',
        }} />

        {/* CRT scanlines texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.014) 2px,rgba(255,255,255,0.014) 4px)',
        }} />

        {/* Glitch artifact bars */}
        {[bar0Ref, bar1Ref, bar2Ref].map((ref, i) => (
          <div key={i} ref={ref} style={{
            position: 'absolute', left: 0, right: 0,
            height: `${3 + i * 2}px`,
            background: i === 1
              ? 'rgba(255,92,92,0.7)'
              : 'rgba(255,255,255,0.55)',
          }} />
        ))}

        {/* Glow wake (trails below the scan line) */}
        <div ref={wakeRef} style={{
          position: 'absolute', left: 0, right: 0,
          top: 0, height: '120px',
          background: 'linear-gradient(to bottom, rgba(255,92,92,0.18) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Main scan line */}
        <div ref={scanRef} style={{
          position: 'absolute', left: 0, right: 0,
          top: 0, height: '3px',
          background: 'linear-gradient(90deg,transparent 0%,rgba(255,92,92,0.5) 12%,#ff5c5c 38%,#fff 50%,#ff5c5c 62%,rgba(255,92,92,0.5) 88%,transparent 100%)',
          boxShadow: [
            '0 0 0 1px rgba(255,92,92,0.25)',
            '0 0 18px 5px rgba(255,92,92,0.6)',
            '0 0 55px 14px rgba(255,92,92,0.22)',
            '0 0 100px 28px rgba(255,92,92,0.08)',
          ].join(','),
          filter: 'blur(0.4px)',
        }} />

        <div ref={codeRef} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(44px, 12vw, 160px)',
          fontWeight: 500,
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.92)',
          textShadow: '0 0 24px rgba(255,92,92,0.9), 0 0 80px rgba(255,92,92,0.28)',
          mixBlendMode: 'screen',
          opacity: 0,
        }}>
          {transitionLabel}
        </div>

        {/* White flash at pivot */}
        <div ref={flashRef} style={{
          position: 'absolute', inset: 0,
          background: '#fff', opacity: 0, pointerEvents: 'none',
        }} />
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
