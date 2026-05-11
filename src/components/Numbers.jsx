import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Numbers() {
  const sectionRef = useRef(null)
  const isMobile = useIsMobile()
  const { content } = useLanguage()
  const numbers = content.numbers
  const sectionTitle = content.ui.sections.numbers

  useGSAP(
    () => {
      if (!sectionRef.current) return
      const statEls = sectionRef.current.querySelectorAll('[data-stat-value]')

      statEls.forEach((el) => {
        const target = parseInt(el.dataset.statValue, 10)
        const prefix = el.dataset.prefix || ''
        const suffix = el.dataset.suffix || ''

        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const obj = { val: 0 }
            gsap.to(obj, {
              val: target,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = prefix + Math.round(obj.val) + suffix
              },
              onComplete: () => {
                gsap.fromTo(el,
                  { color: 'var(--accent)' },
                  { color: 'var(--fg)', duration: 0.5, ease: 'power2.out' }
                )
              },
            })
          },
        })
      })

      gsap.fromTo(
        sectionRef.current.querySelectorAll('[data-stat]'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    },
    { scope: sectionRef, dependencies: [numbers], revertOnUpdate: true }
  )

  return (
    <section id="numbers" ref={sectionRef} style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.headerLabel} data-i18n>{sectionTitle}</h2>
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}>
        {numbers.map((item, i) => (
          <div key={i} data-stat style={{
            ...styles.stat,
            borderRight: isMobile
              ? (i % 2 === 0 ? '1px solid var(--border)' : 'none')
              : (i < numbers.length - 1 ? '1px solid var(--border)' : 'none'),
            borderBottom: isMobile && i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <span
              data-stat-value={item.value}
              data-prefix={item.prefix || ''}
              data-suffix={item.suffix || ''}
              style={styles.value}
              data-i18n
            >
              {(item.prefix || '') + '0' + (item.suffix || '')}
            </span>
            <span style={styles.label} data-i18n>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

const styles = {
  section: { borderBottom: '1px solid var(--border)' },
  header: {
    padding: '3.5rem 6vw 2.5rem',
    borderBottom: '1px solid var(--border)',
  },
  headerLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--accent)',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  stat: {
    padding: '3.5rem 6vw',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  value: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(44px, 7vw, 110px)',
    lineHeight: 1,
    color: 'var(--fg)',
    letterSpacing: 0,
    display: 'block',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: 1.5,
  },
}
