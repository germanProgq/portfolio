import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { person } from '../data/content'

export default function Contact() {
  const sectionRef = useRef(null)
  const quoteRef = useRef(null)
  const linksRef = useRef(null)
  const magnetTweens = useRef(new WeakMap())

  const quoteWords = person.tagline.toUpperCase().split(' ')

  useGSAP(
    () => {
      const wordEls = quoteRef.current.querySelectorAll('[data-word]')

      gsap.fromTo(
        wordEls,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.045,
          duration: 0.55,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: quoteRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      gsap.fromTo(
        linksRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: linksRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    },
    { scope: sectionRef }
  )

  const getMagnetTweens = (el) => {
    let tweens = magnetTweens.current.get(el)
    if (!tweens) {
      tweens = {
        x: gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power2.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power2.out' }),
      }
      magnetTweens.current.set(el, tweens)
    }
    return tweens
  }

  const handleMouseMove = (e, el) => {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * 0.22
    const dy = (e.clientY - cy) * 0.22
    const tweens = getMagnetTweens(el)
    tweens.x(dx)
    tweens.y(dy)
  }

  const handleMouseLeave = (el) => {
    const tweens = getMagnetTweens(el)
    tweens.x(0)
    tweens.y(0)
  }

  const contactLinks = [
    { label: person.contact.email, href: `mailto:${person.contact.email}` },
    { label: person.contact.phone, href: `tel:${person.contact.phone.replace(/[^\d+]/g, '')}` },
    { label: `github/${person.contact.github}`, href: person.contact.githubUrl },
    { label: person.contact.twitter, href: person.contact.twitterUrl },
    { label: 'linkedin', href: person.contact.linkedinUrl },
  ]

  return (
    <section id="contact" ref={sectionRef} style={styles.section}>
      <h2 ref={quoteRef} style={styles.quoteWrap}>
        {quoteWords.map((word, i) => (
          <span key={i} data-word style={styles.quoteWord}>
            {word}{i < quoteWords.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h2>

      <div style={styles.divider} />

      <div ref={linksRef} style={styles.linksRow}>
        {contactLinks.map((link, i) => (
          <span key={i} style={styles.linkWrap}>
            <a
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="contact-link"
              style={styles.link}
              data-cursor
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
            >
              {link.label}
            </a>
            {i < contactLinks.length - 1 && <span style={styles.linkSep}>|</span>}
          </span>
        ))}
      </div>

      <div style={styles.footer}>
        <span style={styles.copyright}>© 2026 German Vinokurov</span>
      </div>

      <style>{contactCSS}</style>
    </section>
  )
}

const contactCSS = `
  .contact-link {
    position: relative;
    display: inline-block;
    transition: color 0.2s;
  }
  .contact-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent);
    transition: width 0.22s ease;
  }
  .contact-link:hover { color: var(--accent) !important; }
  .contact-link:hover::after { width: 100%; }
`

const styles = {
  section: {
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '12vh 6vw',
    position: 'relative',
  },
  quoteWrap: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(32px, 5.5vw, 90px)',
    lineHeight: 1.05,
    letterSpacing: 0,
    color: 'var(--fg)',
    maxWidth: '14ch',
    marginBottom: '4rem',
    overflow: 'hidden',
  },
  quoteWord: {
    display: 'inline-block',
    marginRight: '0.2em',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'var(--border)',
    marginBottom: '2.5rem',
  },
  linksRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem 0',
    alignItems: 'center',
  },
  linkWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(13px, 1vw, 15px)',
    color: 'var(--fg)',
    letterSpacing: '0.05em',
    display: 'inline-block',
    cursor: 'none',
    padding: '4px 0',
  },
  linkSep: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--faint)',
    marginLeft: '0.5rem',
  },
  footer: {
    position: 'absolute',
    bottom: '2rem',
    right: '6vw',
  },
  copyright: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--faint)',
    letterSpacing: '0.06em',
  },
}
