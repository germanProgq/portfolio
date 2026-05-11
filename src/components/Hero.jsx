import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useScramble } from 'use-scramble'
import { person } from '../data/content'

const SOCIALS = [
  { label: 'GitHub', href: person.contact.githubUrl },
  { label: 'Twitter', href: person.contact.twitterUrl },
  { label: 'LinkedIn', href: person.contact.linkedinUrl },
  { label: 'Email', href: `mailto:${person.contact.email}` },
]

export default function Hero() {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)
  const roleRef = useRef(null)
  const metaRef = useRef(null)
  const scrollRef = useRef(null)
  const socialsRef = useRef(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const [roleVisible, setRoleVisible] = useState(true)

  const { ref: nameRef, replay } = useScramble({
    text: person.name,
    speed: 1,
    tick: 1,
    step: 3,
    scramble: 6,
    seed: 2,
    chance: 0.9,
    playOnMount: false,
  })

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.05 })

    tl.fromTo(nameRef.current, { opacity: 0 }, {
      opacity: 1, duration: 0.2,
      onComplete: () => replay(),
    })
      .fromTo(lineRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.5, ease: 'power3.inOut' },
        '+=0.1'
      )
      .fromTo(roleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(socialsRef.current.children,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: 'power3.out' },
        '-=0.1'
      )
      .fromTo([metaRef.current, scrollRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.08 },
        '-=0.15'
      )
  }, [])

  /* role cycling */
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleVisible(false)
      setTimeout(() => {
        setRoleIndex((i) => (i + 1) % person.roles.length)
        setRoleVisible(true)
      }, 220)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  /* scroll hint pulse */
  useGSAP(() => {
    if (!scrollRef.current) return
    gsap.to(scrollRef.current, {
      y: 6, duration: 0.9, repeat: -1, yoyo: true, ease: 'power1.inOut',
    })
  }, [])

  return (
    <section id="hero" ref={sectionRef} style={styles.section}>
      <div style={styles.inner}>
        <h1 ref={nameRef} style={styles.name} aria-label={person.name}>
          {person.name}
        </h1>
        <div ref={lineRef} style={styles.line} />
        <div ref={roleRef} style={styles.roleWrap}>
          <span style={{
            ...styles.role,
            opacity: roleVisible ? 1 : 0,
            transform: roleVisible ? 'translateY(0)' : 'translateY(-10px)',
          }}>
            {person.roles[roleIndex]}
          </span>
        </div>
      </div>

      <div ref={socialsRef} style={styles.socials}>
        {SOCIALS.map(({ label, href }) => (
          <a key={label} href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            style={styles.socialItem}
            className="hero-social"
            data-cursor
          >
            <span style={styles.socialLabel}>{label}</span>
            <span style={styles.socialArrow} aria-hidden="true">↗</span>
          </a>
        ))}
      </div>

      <div ref={metaRef} style={styles.meta}>
        <span style={styles.metaText}>{person.contact.location}</span>
        <span style={styles.metaDot}>·</span>
        <span style={styles.metaText}>{person.contact.phone}</span>
      </div>

      <div ref={scrollRef} style={styles.scrollHint}>
        <span style={styles.scrollText}>scroll ↓</span>
      </div>

      <style>{heroCSS}</style>
    </section>
  )
}

const heroCSS = `
  .hero-social {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
    overflow: hidden;
  }
  .hero-social::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent);
    transition: width 0.25s ease;
  }
  .hero-social:hover::after { width: 100%; }
  .hero-social:hover        { color: var(--fg) !important; }
`

const styles = {
  section: {
    position: 'relative',
    height: '100svh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 6vw',
    paddingTop: '52px',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(38px, 8.5vw, 150px)',
    lineHeight: 0.95,
    letterSpacing: 0,
    color: 'var(--fg)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  line: {
    width: '100%',
    height: '1px',
    background: 'var(--accent)',
    transformOrigin: 'left center',
  },
  roleWrap: {
    overflow: 'hidden',
    height: '1.8em',
    display: 'flex',
    alignItems: 'center',
  },
  role: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(13px, 1.4vw, 20px)',
    color: 'var(--muted)',
    letterSpacing: '0.04em',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
    display: 'block',
  },
  socials: {
    position: 'absolute',
    bottom: '4rem',
    left: '6vw',
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  socialItem: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(12px, 1vw, 14px)',
    color: 'var(--accent)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
    cursor: 'none',
    gap: '4px',
    padding: '6px 0',
  },
  socialLabel: {
    color: 'inherit',
    transition: 'color 0.2s',
  },
  socialArrow: {
    color: 'var(--accent)',
    fontSize: '10px',
  },
  meta: {
    position: 'absolute',
    bottom: '2rem',
    left: '6vw',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--muted)',
  },
  metaDot: { color: 'var(--faint)' },
  metaText: { color: 'var(--muted)' },
  scrollHint: {
    position: 'absolute',
    bottom: '2rem',
    right: '6vw',
  },
  scrollText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--muted)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
}
