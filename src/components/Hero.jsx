import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useScramble } from 'use-scramble'
import { useLanguage } from '../context/LanguageContext'

export default function Hero({ active = false }) {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)
  const roleRef = useRef(null)
  const metaRef = useRef(null)
  const scrollRef = useRef(null)
  const socialsRef = useRef(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const [roleVisible, setRoleVisible] = useState(true)
  const { content, lang } = useLanguage()
  const { person, ui } = content
  const nameStyle = lang === 'ru' ? { ...styles.name, ...styles.nameRu } : styles.name
  const roleRowStyle = lang === 'ru' ? { ...styles.roleRow, ...styles.roleRowRu } : styles.roleRow
  const socials = [
    { label: 'GitHub', href: person.contact.githubUrl },
    { label: 'Twitter', href: person.contact.twitterUrl },
    { label: 'LinkedIn', href: person.contact.linkedinUrl },
    { label: 'Email', href: `mailto:${person.contact.email}` },
  ]

  const hasActivatedRef = useRef(false)

  const { ref: nameRef, replay } = useScramble({
    text: person.name,
    speed: 1,
    tick: 1,
    step: 3,
    scramble: 6,
    seed: 2,
    chance: 0.9,
    playOnMount: false,
    onAnimationEnd: () => {
      if (!nameRef.current) return
      gsap.to(nameRef.current, { opacity: 1, duration: 0.35, ease: 'power3.out' })
    },
  })

  useGSAP(() => {
    if (!nameRef.current || !lineRef.current || !roleRef.current || !socialsRef.current) return

    if (!active) {
      gsap.set(nameRef.current, { opacity: 0 })
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(roleRef.current, { y: 20, opacity: 0 })
      gsap.set(socialsRef.current.children, { y: 14, opacity: 0 })
      gsap.set([metaRef.current, scrollRef.current], { opacity: 0 })
      return
    }

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
  }, { dependencies: [active], revertOnUpdate: true })

  useEffect(() => {
    if (active) hasActivatedRef.current = true
  }, [active])

  /* hide name while scramble resolves latin↔cyrillic garbage characters */
  useEffect(() => {
    if (!hasActivatedRef.current || !nameRef.current) return
    gsap.set(nameRef.current, { opacity: 0 })
  }, [person.name])

  useEffect(() => {
    setRoleIndex(0)
    setRoleVisible(true)
  }, [person.roles])

  /* role cycling */
  useEffect(() => {
    if (!active) return
    let timeoutId = null
    const interval = setInterval(() => {
      setRoleVisible(false)
      timeoutId = setTimeout(() => {
        setRoleIndex((i) => (i + 1) % person.roles.length)
        setRoleVisible(true)
      }, 220)
    }, 2200)
    return () => {
      clearInterval(interval)
      clearTimeout(timeoutId)
    }
  }, [active, person.roles])

  /* scroll hint pulse */
  useGSAP(() => {
    if (!active || !scrollRef.current) return
    gsap.to(scrollRef.current, {
      y: 6, duration: 0.9, repeat: -1, yoyo: true, ease: 'power1.inOut',
    })
  }, { dependencies: [active], revertOnUpdate: true })

  return (
    <section id="hero" ref={sectionRef} style={styles.section}>
      <div style={styles.inner}>
        <h1 ref={nameRef} style={nameStyle} className="hero-name" aria-label={person.name} data-i18n>
          {person.name}
        </h1>
        <div ref={lineRef} style={styles.line} />
        <div style={roleRowStyle} className="hero-role-row">
          <div ref={roleRef} style={styles.roleWrap} className="hero-role-text">
            <span style={{
              ...styles.role,
              opacity: roleVisible ? 1 : 0,
              transform: roleVisible ? 'translateY(0)' : 'translateY(-10px)',
            }} data-i18n>
              {person.roles[roleIndex]}
            </span>
          </div>

          <a
            href={ui.cvFile}
            download={ui.cvFilename}
            style={styles.cvBtn}
            className="hero-cv-btn"
            data-cursor
            data-i18n
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v13M7 11l5 5 5-5M4 20h16" />
            </svg>
            <span>CV</span>
          </a>
        </div>
      </div>

      <div ref={socialsRef} style={styles.socials}>
        {socials.map(({ label, href }) => (
          <a key={label} href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            style={styles.socialItem}
            className="hero-social"
            data-cursor
          >
            <span style={styles.socialLabel} data-i18n>{label}</span>
            <span style={styles.socialArrow} aria-hidden="true">↗</span>
          </a>
        ))}
      </div>

      <div ref={metaRef} style={styles.meta}>
        <span style={styles.metaText} data-i18n>{person.contact.location}</span>
        <span style={styles.metaDot}>·</span>
        <span style={styles.metaText} data-i18n>{person.contact.phone}</span>
      </div>

      <div ref={scrollRef} style={styles.scrollHint}>
        <span style={styles.scrollText} data-i18n>{ui.scrollHint}</span>
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
  .hero-cv-btn              { display: none !important; }
  .hero-cv-btn:hover        { background: var(--accent) !important; color: var(--bg) !important; }
  @media (max-width: 560px) {
    .hero-name {
      text-align: center !important;
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
      overflow-wrap: normal;
      word-break: normal;
    }
  }
  @media (max-width: 767px) {
    .hero-role-row {
      width: 100%;
      justify-content: space-between !important;
    }
    .hero-role-text {
      min-width: 0;
      flex: 1;
    }
    .hero-role-text span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .hero-cv-btn {
      display: inline-flex !important;
    }
  }
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
  nameRu: {
    fontSize: 'clamp(34px, 7.2vw, 124px)',
    textAlign: 'center',
  },
  line: {
    width: '100%',
    height: '1px',
    background: 'var(--accent)',
    transformOrigin: 'left center',
  },
  roleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  roleRowRu: {
    justifyContent: 'center',
    textAlign: 'center',
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
  cvBtn: {
    display: 'none',
    alignItems: 'center',
    gap: '0.55rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    padding: '0.55rem 0.8rem',
    flexShrink: 0,
    transition: 'background 0.2s, color 0.2s',
    cursor: 'none',
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
