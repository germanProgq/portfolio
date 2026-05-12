import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stackRows } from '../data/content'
import { useLanguage } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { STACK_ICONS } from '../utils/stackIcons'

const desktopDurations = [166, 210, 136, 240, 186]
const mobileDurations  = [220, 280, 180, 320, 248]
const ICON_SIZE = 15

/* ── helpers ── */
function getTX(el) {
  return new DOMMatrix(getComputedStyle(el).transform).m41
}

/* After a drag, calculate animationDelay so the marquee resumes
   from exactly where the finger/cursor left off.
   forward:  keyframes 0→-50%  (translateX goes negative)
   reverse:  keyframes -50%→0  (translateX goes from neg to 0) */
/* dur passed explicitly so it works even when animationName='none' */
function syncDelay(inner, isReverse, dur) {
  const half = inner.scrollWidth / 2
  const curX = getTX(inner)
  const pos  = ((-curX % half) + half) % half
  return -(isReverse ? (1 - pos / half) : (pos / half)) * dur
}

/* ── sub-components ── */
function StackItem({ name }) {
  const icon = STACK_ICONS[name]
  return (
    <span style={st.item}>
      {icon && (
        <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE}
          fill="currentColor" style={st.icon} aria-hidden="true">
          <path d={icon.path} />
        </svg>
      )}
      <span style={st.name}>{name}</span>
      <span style={st.sep}> · </span>
    </span>
  )
}

function MarqueeTrack({ row, duration, isReverse, rowRef, onPause, onResume }) {
  const items = Array(8).fill(row).flat()
  return (
    <div
      ref={rowRef}
      style={st.row}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <span
        data-inner
        style={{
          ...st.inner,
          animationName: isReverse ? 'marqueeReverse' : 'marquee',
          animationDuration: `${duration}s`,
        }}
      >
        {[0, 1].map(half => (
          <span key={half} style={st.half}>
            {items.map((name, j) => <StackItem key={`${half}-${j}`} name={name} />)}
          </span>
        ))}
      </span>
    </div>
  )
}

/* ── main component ── */
export default function Stack() {
  const sectionRef = useRef(null)
  const headerRef  = useRef(null)
  const rowRefs    = useRef([])
  const stackVisibleRef = useRef(false)
  const isMobile   = useIsMobile()
  const { content } = useLanguage()
  const sectionTitle = content.ui.sections.stack

  /* scroll-in animations */
  useGSAP(() => {
    if (!sectionRef.current || !headerRef.current) return
    gsap.fromTo(
      headerRef.current.querySelectorAll('[data-char]'),
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, stagger: 0.04, duration: 0.4, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play none none reverse' },
      }
    )
    rowRefs.current.forEach((row, i) => {
      if (!row) return
      gsap.fromTo(row,
        { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
        {
          opacity: 1, x: 0, duration: 0.4, delay: i * 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
        }
      )
    })
  }, { scope: sectionRef, dependencies: [sectionTitle], revertOnUpdate: true })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const setRunning = (running) => {
      stackVisibleRef.current = running
      rowRefs.current.forEach(row => {
        if (!row || row.dataset.dragging) return
        const inner = row.querySelector('[data-inner]')
        if (inner) inner.style.animationPlayState = running ? 'running' : 'paused'
      })
    }

    setRunning(false)
    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { rootMargin: '15% 0px' }
    )
    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  /* drag-to-scrub — Pointer Events API with setPointerCapture so the drag
     tracks the cursor/finger even when it leaves the element */
  useEffect(() => {
    const cleanups = stackRows.map((_, i) => {
      const rowEl = rowRefs.current[i]
      if (!rowEl) return null
      const inner = rowEl.querySelector('[data-inner]')
      if (!inner) return null
      const isRev = i % 2 !== 0

      let startCX = 0, startTX = 0, dur = 0
      let vel = 0, prevCX = 0, prevT = 0

      const animName = isRev ? 'marqueeReverse' : 'marquee'

      const begin = (clientX) => {
        rowEl.dataset.dragging = 'true'
        document.body.style.userSelect = 'none'

        startTX = getTX(inner)
        startCX = clientX
        dur     = parseFloat(inner.style.animationDuration) || 1
        vel = 0; prevCX = clientX; prevT = performance.now()

        /* set transform first, then kill animation — batched in one paint,
           so the element never flashes to translateX(0) */
        inner.style.transform     = `translateX(${startTX}px)`
        inner.style.animationName = 'none'
      }

      const move = (clientX) => {
        inner.style.transform = `translateX(${startTX + (clientX - startCX)}px)`
        const now = performance.now()
        const dt  = Math.max(now - prevT, 1)
        vel = ((clientX - prevCX) / dt) * 16
        prevCX = clientX; prevT = now
      }

      const end = () => {
        delete rowEl.dataset.dragging
        document.body.style.userSelect = ''

        const rawX = getTX(inner) + vel * 12
        inner.style.transform = `translateX(${rawX}px)`

        /* syncDelay reads rawX from inline transform while animationName='none' */
        inner.style.animationDelay = `${syncDelay(inner, isRev, dur)}s`
        inner.style.animationName  = animName   /* restore — overrides inline */
        inner.style.animationPlayState = stackVisibleRef.current ? 'running' : 'paused'
      }

      const onPD = (e) => {
        if (e.button !== 0) return        /* left-click / primary touch only */
        rowEl.setPointerCapture(e.pointerId)   /* all events route here until up */
        begin(e.clientX)
      }
      const onPM = (e) => { if (rowEl.dataset.dragging) move(e.clientX) }
      const onPU = (e) => { if (rowEl.dataset.dragging) { rowEl.releasePointerCapture(e.pointerId); end() } }

      rowEl.addEventListener('pointerdown',  onPD)
      rowEl.addEventListener('pointermove',  onPM)
      rowEl.addEventListener('pointerup',    onPU)
      rowEl.addEventListener('pointercancel', onPU)

      return () => {
        rowEl.removeEventListener('pointerdown',  onPD)
        rowEl.removeEventListener('pointermove',  onPM)
        rowEl.removeEventListener('pointerup',    onPU)
        rowEl.removeEventListener('pointercancel', onPU)
      }
    })

    return () => cleanups.forEach(c => c?.())
  }, [])

  /* hover dim/bright (skip if row is being dragged) */
  const onEnter = (e) => {
    if (e.currentTarget.dataset.dragging) return
    const inner = e.currentTarget.querySelector('[data-inner]')
    if (!inner) return
    inner.style.animationPlayState = 'paused'
    gsap.to(inner, { opacity: 0.4, duration: 0.18, overwrite: 'auto' })
  }
  const onLeave = (e) => {
    if (e.currentTarget.dataset.dragging) return
    const inner = e.currentTarget.querySelector('[data-inner]')
    if (!inner) return
    inner.style.animationPlayState = stackVisibleRef.current ? 'running' : 'paused'
    gsap.to(inner, { opacity: 1, duration: 0.18, overwrite: 'auto' })
  }

  const durations = isMobile ? mobileDurations : desktopDurations

  return (
    <section id="stack" ref={sectionRef} style={st.section}>
      <div style={st.header}>
        <h2 ref={headerRef} style={st.headerLabel} aria-label={sectionTitle} data-i18n>
          {sectionTitle.split('').map((ch, i) => (
            <span key={i} data-char aria-hidden="true" style={{ display: 'inline-block' }}>{ch}</span>
          ))}
        </h2>
      </div>

      <div style={st.marqueeWrap}>
        {stackRows.map((row, i) => (
          <MarqueeTrack
            key={i}
            row={row}
            duration={durations[i]}
            isReverse={i % 2 !== 0}
            rowRef={el => (rowRefs.current[i] = el)}
            onPause={onEnter}
            onResume={onLeave}
          />
        ))}
      </div>

      <style>{css}</style>
    </section>
  )
}

const css = `
  @keyframes marquee        { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
  @keyframes marqueeReverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
`

const st = {
  section: { borderBottom: '1px solid var(--border)', overflow: 'hidden' },
  header: { padding: '3.5rem 6vw 2.5rem', borderBottom: '1px solid var(--border)', overflow: 'hidden' },
  headerLabel: {
    fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: 'clamp(28px, 5vw, 80px)', color: 'var(--fg)',
    letterSpacing: 0, display: 'block',
  },
  marqueeWrap: { display: 'flex', flexDirection: 'column', padding: '2.5rem 0', gap: '0.6rem' },
  row: { overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'none', touchAction: 'none' },
  inner: {
    display: 'inline-flex',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationPlayState: 'paused',
    transition: 'opacity 0.18s',
    whiteSpace: 'nowrap',
    willChange: 'transform',
    alignItems: 'center',
  },
  half: { display: 'inline-flex', alignItems: 'center' },
  item: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px, 1.2vw, 17px)',
    color: 'var(--muted)', letterSpacing: '0.05em',
  },
  icon: { flexShrink: 0, display: 'block' },
  name: { display: 'inline' },
  sep: { opacity: 0.4, marginLeft: '3px' },
}
