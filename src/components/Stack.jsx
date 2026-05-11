import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stackRows } from '../data/content'
import { useIsMobile } from '../hooks/useIsMobile'

const desktopDurations = [83, 105, 68, 120, 93]
const mobileDurations  = [110, 140, 90, 160, 124]

export default function Stack() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const rowRefs = useRef([])
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      const chars = headerRef.current.querySelectorAll('[data-char]')

      gsap.fromTo(chars,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          stagger: 0.04, duration: 0.4, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      rowRefs.current.forEach((row, i) => {
        if (!row) return
        gsap.fromTo(row,
          { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
          {
            opacity: 1, x: 0, duration: 0.4, delay: i * 0.06, ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    },
    { scope: sectionRef }
  )

  const pauseRow = (inner) => {
    inner.style.animationPlayState = 'paused'
    gsap.to(inner, { opacity: 0.45, duration: 0.18 })
  }
  const resumeRow = (inner) => {
    inner.style.animationPlayState = 'running'
    gsap.to(inner, { opacity: 1, duration: 0.18 })
  }

  return (
    <section id="stack" ref={sectionRef} style={styles.section}>
      <div style={styles.header}>
        <h2 ref={headerRef} style={styles.headerLabel} aria-label="STACK">
          {'STACK'.split('').map((ch, i) => (
            <span key={i} data-char aria-hidden="true" style={{ display: 'inline-block' }}>{ch}</span>
          ))}
        </h2>
      </div>

      <div style={styles.marqueeWrap}>
        {stackRows.map((row, i) => {
          const isReverse = i % 2 !== 0
          /* repeat 8× so one "half" is always wider than any viewport */
          const single = row.join(' · ') + ' · '
          const half = single.repeat(8)
          const content = half + half
          return (
            <div
              key={i}
              ref={(el) => (rowRefs.current[i] = el)}
              style={styles.row}
              onMouseEnter={(e) => pauseRow(e.currentTarget.querySelector('[data-inner]'))}
              onMouseLeave={(e) => resumeRow(e.currentTarget.querySelector('[data-inner]'))}
            >
              <div
                data-inner
                style={{
                  ...styles.rowInner,
                  animationName: isReverse ? 'marqueeReverse' : 'marquee',
                  animationDuration: `${(isMobile ? mobileDurations : desktopDurations)[i]}s`,
                }}
              >
                <span style={styles.rowText}>{content}</span>
              </div>
            </div>
          )
        })}
      </div>

      <style>{marqueeCSS}</style>
    </section>
  )
}

const marqueeCSS = `
  @keyframes marquee        { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
  @keyframes marqueeReverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
`

const styles = {
  section: { borderBottom: '1px solid var(--border)', overflow: 'hidden' },
  header: {
    padding: '3.5rem 6vw 2.5rem',
    borderBottom: '1px solid var(--border)',
    overflow: 'hidden',
  },
  headerLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 5vw, 80px)',
    color: 'var(--fg)',
    letterSpacing: 0,
    display: 'block',
  },
  marqueeWrap: {
    display: 'flex',
    flexDirection: 'column',
    padding: '2.5rem 0',
    gap: '0.6rem',
  },
  row: { overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'default' },
  rowInner: {
    display: 'inline-block',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    transition: 'opacity 0.18s',
    whiteSpace: 'nowrap',
    willChange: 'transform',
  },
  rowText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(12px, 1.2vw, 17px)',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
  },
}
