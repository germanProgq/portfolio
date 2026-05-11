import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience } from '../data/content'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Experience() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      if (isMobile) return

      const totalCards = experience.length
      const movePercent = -(100 / totalCards) * (totalCards - 1)

      gsap.to(trackRef.current, {
        xPercent: movePercent,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 0.8,
          start: 'top top',
          end: `+=${window.innerHeight * (totalCards - 0.6)}`,
          anticipatePin: 1,
        },
      })
    },
    { scope: sectionRef, dependencies: [isMobile] }
  )

  const onBulletEnter = (e) => {
    gsap.to(e.currentTarget.querySelector('[data-dash]'), { x: 4, duration: 0.18, ease: 'power2.out' })
    gsap.to(e.currentTarget.querySelector('[data-text]'), { color: 'var(--fg)', duration: 0.18 })
  }
  const onBulletLeave = (e) => {
    gsap.to(e.currentTarget.querySelector('[data-dash]'), { x: 0, duration: 0.25, ease: 'power2.out' })
    gsap.to(e.currentTarget.querySelector('[data-text]'), { color: 'var(--muted)', duration: 0.25 })
  }

  if (isMobile) {
    return (
      <section id="work" ref={sectionRef} style={mobileStyles.section}>
        <div style={mobileStyles.header}>
          <h2 style={mobileStyles.headerLabel}>EXPERIENCE</h2>
        </div>
        {experience.map((job, i) => (
          <div key={i} style={mobileStyles.card}>
            <div style={mobileStyles.cardTop}>
              <span style={mobileStyles.company}>{job.company}</span>
              <span style={mobileStyles.index}>{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 style={mobileStyles.role}>{job.role}</h3>
            <div style={mobileStyles.meta}>
              <span style={mobileStyles.period}>{job.period}</span>
              <span style={mobileStyles.dot}>·</span>
              <span style={mobileStyles.type}>{job.type}</span>
            </div>
            <ul style={mobileStyles.bullets}>
              {job.bullets.map((b, j) => (
                <li key={j} style={mobileStyles.bullet}>
                  <span style={mobileStyles.dash}>—</span>
                  <span style={mobileStyles.bulletText}>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    )
  }

  return (
    <section id="work" ref={sectionRef} style={styles.section}>
      <div style={styles.rail}>
        <h2 style={styles.railLabel}>EXPERIENCE</h2>
      </div>
      <div style={styles.viewport}>
        <div ref={trackRef} style={styles.track}>
          {experience.map((job, i) => (
            <div key={i} data-card style={styles.card}>
              <div style={styles.cardInner}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={styles.cardCompany}>{job.company}</span>
                </div>
                <h3 style={styles.cardRole}>{job.role}</h3>
                <div style={styles.cardMeta}>
                  <span style={styles.cardPeriod}>{job.period}</span>
                  <span style={styles.cardDot}>·</span>
                  <span style={styles.cardType}>{job.type}</span>
                </div>
                <ul style={styles.bullets}>
                  {job.bullets.map((b, j) => (
                    <li key={j} style={styles.bullet} onMouseEnter={onBulletEnter} onMouseLeave={onBulletLeave}>
                      <span data-dash style={styles.bulletDash}>—</span>
                      <span data-text style={styles.bulletText}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {i < experience.length - 1 && <div style={styles.cardDivider} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const styles = {
  section: {
    position: 'relative',
    height: '100svh',
    display: 'flex',
    overflow: 'hidden',
    borderBottom: '1px solid var(--border)',
  },
  rail: {
    width: '14vw', minWidth: '100px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRight: '1px solid var(--border)', flexShrink: 0,
  },
  railLabel: {
    fontFamily: 'var(--font-mono)', fontSize: '10px',
    letterSpacing: '0.2em', color: 'var(--muted)',
    textTransform: 'uppercase', writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
  },
  viewport: { flex: 1, overflow: 'hidden', position: 'relative' },
  track: {
    display: 'flex', height: '100%',
    width: `${experience.length * 100}%`,
  },
  card: {
    width: `${100 / experience.length}%`,
    height: '100%', display: 'flex', position: 'relative', alignItems: 'center',
  },
  cardInner: { padding: '0 5vw', width: '100%' },
  cardHeader: { display: 'flex', alignItems: 'baseline', gap: '1.5rem', marginBottom: '1.25rem' },
  cardIndex: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  cardCompany: {
    fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: 'clamp(32px, 5vw, 76px)', color: 'var(--accent)',
    lineHeight: 1, letterSpacing: 0,
  },
  cardRole: {
    fontFamily: 'var(--font-display)', fontWeight: 500,
    fontSize: 'clamp(16px, 1.8vw, 26px)', color: 'var(--fg)', marginBottom: '0.6rem',
  },
  cardMeta: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' },
  cardPeriod: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  cardDot: { color: 'var(--faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' },
  cardType: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  bullets: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem', maxWidth: '460px' },
  bullet: { display: 'flex', gap: '0.9rem', cursor: 'default', paddingLeft: '2px' },
  bulletDash: {
    color: 'var(--accent)', flexShrink: 0, fontFamily: 'var(--font-mono)',
    fontSize: '14px', lineHeight: 1.65,
  },
  bulletText: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(12px, 1.1vw, 15px)',
    color: 'var(--muted)', lineHeight: 1.65, transition: 'color 0.2s',
  },
  cardDivider: {
    position: 'absolute', right: 0, top: '10%', height: '80%',
    width: '1px', background: 'var(--border)',
  },
}

const mobileStyles = {
  section: {
    borderBottom: '1px solid var(--border)',
  },
  header: {
    padding: '2.5rem 6vw 2rem',
    borderBottom: '1px solid var(--border)',
  },
  headerLabel: {
    fontFamily: 'var(--font-mono)', fontSize: '10px',
    color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase',
  },
  card: {
    padding: '2.5rem 6vw',
    borderBottom: '1px solid var(--border)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  company: {
    fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: 'clamp(28px, 8vw, 52px)', color: 'var(--accent)',
    lineHeight: 1, letterSpacing: 0,
  },
  index: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', paddingTop: '6px' },
  role: {
    fontFamily: 'var(--font-display)', fontWeight: 500,
    fontSize: 'clamp(15px, 4vw, 20px)', color: 'var(--fg)', marginBottom: '0.5rem',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  period: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  dot: { color: 'var(--faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' },
  type: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  bullets: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  bullet: { display: 'flex', gap: '0.75rem' },
  dash: { color: 'var(--accent)', flexShrink: 0, fontFamily: 'var(--font-mono)', lineHeight: 1.6 },
  bulletText: { fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 },
}
