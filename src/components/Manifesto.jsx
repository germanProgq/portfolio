import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { person } from '../data/content'

export default function Manifesto() {
  const sectionRef = useRef(null)
  const markerRef = useRef(null)

  const words = person.about.split(' ')

  useGSAP(
    () => {
      const wordEls = sectionRef.current.querySelectorAll('[data-word]')

      wordEls.forEach((word) => {
        gsap.fromTo(
          word,
          { color: 'var(--faint)' },
          {
            color: 'var(--fg)',
            duration: 0.01,
            scrollTrigger: {
              trigger: word,
              start: 'top 62%',
              end: 'top 38%',
              scrub: true,
            },
          }
        )
      })

      /* marker tracks reading position — hidden outside section */
      gsap.fromTo(
        markerRef.current,
        { top: '38%' },
        {
          top: '62%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      )

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 10%',
        end: 'bottom 90%',
        onEnter: () => gsap.to(markerRef.current, { opacity: 0.3, duration: 0.2 }),
        onLeave: () => gsap.to(markerRef.current, { opacity: 0, duration: 0.2 }),
        onEnterBack: () => gsap.to(markerRef.current, { opacity: 0.3, duration: 0.2 }),
        onLeaveBack: () => gsap.to(markerRef.current, { opacity: 0, duration: 0.2 }),
      })
    },
    { scope: sectionRef }
  )

  return (
    <section id="about" ref={sectionRef} style={styles.section}>
      <div ref={markerRef} style={styles.marker} />

      <div style={styles.label}>
        <h2 style={styles.labelText}>ABOUT</h2>
      </div>

      <p style={styles.text}>
        {words.map((word, i) => (
          <span key={i} data-word style={styles.word}>
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
    </section>
  )
}

const styles = {
  section: {
    position: 'relative',
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '12vh 6vw',
    borderBottom: '1px solid var(--border)',
  },
  marker: {
    position: 'fixed',
    left: 0,
    right: 0,
    top: '38%',
    height: '1px',
    background: 'var(--accent)',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 100,
  },
  label: {
    marginBottom: '4rem',
  },
  labelText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--accent)',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  text: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: 'clamp(28px, 4.5vw, 72px)',
    lineHeight: 1.25,
    letterSpacing: 0,
    maxWidth: '18ch',
  },
  word: {
    display: 'inline',
    color: 'var(--faint)',
    transition: 'color 0.1s',
  },
}
