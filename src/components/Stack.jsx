import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stackRows } from '../data/content'
import { useIsMobile } from '../hooks/useIsMobile'
import { STACK_ICONS } from '../utils/stackIcons'

const desktopDurations = [166, 210, 136, 240, 186]
const mobileDurations  = [220, 280, 180, 320, 248]

const ICON_SIZE = 15

function StackItem({ name }) {
  const icon = STACK_ICONS[name]
  return (
    <span style={st.item}>
      {icon && (
        <svg
          viewBox="0 0 24 24"
          width={ICON_SIZE}
          height={ICON_SIZE}
          fill="currentColor"
          style={st.icon}
          aria-hidden="true"
        >
          <path d={icon.path} />
        </svg>
      )}
      <span style={st.name}>{name}</span>
      <span style={st.sep}> · </span>
    </span>
  )
}

function MarqueeTrack({ row, duration, isReverse, onPause, onResume }) {
  /* 8 copies per half → seamless loop at any viewport width */
  const items = Array(8).fill(row).flat()

  return (
    <div
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
        {/* two identical halves for seamless loop */}
        {[0, 1].map(half => (
          <span key={half} style={st.half}>
            {items.map((name, j) => <StackItem key={`${half}-${j}`} name={name} />)}
          </span>
        ))}
      </span>
    </div>
  )
}

export default function Stack() {
  const sectionRef = useRef(null)
  const headerRef  = useRef(null)
  const rowRefs    = useRef([])
  const isMobile   = useIsMobile()

  useGSAP(
    () => {
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
    },
    { scope: sectionRef }
  )

  const pause  = (e) => {
    const inner = e.currentTarget.querySelector('[data-inner]')
    if (!inner) return
    inner.style.animationPlayState = 'paused'
    gsap.to(inner, { opacity: 0.45, duration: 0.18, overwrite: 'auto' })
  }
  const resume = (e) => {
    const inner = e.currentTarget.querySelector('[data-inner]')
    if (!inner) return
    inner.style.animationPlayState = 'running'
    gsap.to(inner, { opacity: 1, duration: 0.18, overwrite: 'auto' })
  }

  const durations = isMobile ? mobileDurations : desktopDurations

  return (
    <section id="stack" ref={sectionRef} style={st.section}>
      <div style={st.header}>
        <h2 ref={headerRef} style={st.headerLabel} aria-label="STACK">
          {'STACK'.split('').map((ch, i) => (
            <span key={i} data-char aria-hidden="true" style={{ display: 'inline-block' }}>{ch}</span>
          ))}
        </h2>
      </div>

      <div style={st.marqueeWrap}>
        {stackRows.map((row, i) => (
          <div key={i} ref={el => (rowRefs.current[i] = el)}>
            <MarqueeTrack
              row={row}
              duration={durations[i]}
              isReverse={i % 2 !== 0}
              onPause={pause}
              onResume={resume}
            />
          </div>
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
  row: { overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'default' },
  inner: {
    display: 'inline-flex',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    transition: 'opacity 0.18s',
    whiteSpace: 'nowrap',
    willChange: 'transform',
    alignItems: 'center',
  },
  half: { display: 'inline-flex', alignItems: 'center' },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(12px, 1.2vw, 17px)',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
  },
  icon: { flexShrink: 0, display: 'block' },
  name: { display: 'inline' },
  sep: { opacity: 0.4, marginLeft: '3px' },
}
