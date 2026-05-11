import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { person } from '../data/content'
import { navScrolling } from '../utils/navScrolling'

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v13M7 11l5 5 5-5M4 20h16" />
  </svg>
)

const NAV_ITEMS = [
  { label: 'ABOUT', id: 'about' },
  { label: 'WORK', id: 'work' },
  { label: 'PROJECTS', id: 'projects' },
  { label: 'STACK', id: 'stack' },
  { label: 'CONTACT', id: 'contact' },
]

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const SOCIALS = [
  { Icon: GithubIcon, title: 'GitHub', href: person.contact.githubUrl },
  { Icon: TwitterIcon, title: 'Twitter', href: person.contact.twitterUrl },
  { Icon: LinkedinIcon, title: 'LinkedIn', href: person.contact.linkedinUrl },
]

const DESKTOP_ACTIONS = [
  { Icon: TwitterIcon, title: 'Twitter', href: person.contact.twitterUrl, external: true },
  { Icon: LinkedinIcon, title: 'LinkedIn', href: person.contact.linkedinUrl, external: true },
  { Icon: GithubIcon, title: 'GitHub', href: person.contact.githubUrl, external: true },
  {
    Icon: DownloadIcon,
    title: 'Download CV',
    href: '/CV_Eng.pdf',
    download: 'German_Vinokurov_CV.pdf',
    accent: true,
  },
]

export default function Nav({ visible }) {
  const navRef = useRef(null)
  const overlayRef = useRef(null)
  const lenis = useLenis()
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [language, setLanguage] = useState('en')

  useGSAP(() => {
    if (!navRef.current) return
    gsap.set(navRef.current, { y: -52, opacity: 0 })
  }, [])

  useEffect(() => {
    if (!visible || !navRef.current) return
    gsap.to(navRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.1 })
  }, [visible])

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 'top -60px',
      onUpdate: (self) => setScrolled(self.progress > 0),
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    if (!visible) return
    const triggers = NAV_ITEMS.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return null
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setActive(id),
        onEnterBack: () => setActive(id),
      })
    }).filter(Boolean)
    return () => triggers.forEach((t) => t.kill())
  }, [visible])

  /* lock body scroll when menu open */
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return

    gsap.killTweensOf(el)

    if (menuOpen) {
      lenis?.stop()
      gsap.set(el, { display: 'flex' })
      gsap.fromTo(el,
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      )
    } else {
      lenis?.start()
      gsap.to(el, {
        opacity: 0,
        y: -16,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => gsap.set(el, { display: 'none', y: 0 }),
      })
    }
    return () => gsap.killTweensOf(el)
  }, [menuOpen, lenis])

  const scrollTo = (id) => {
    lenis?.start()
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    const targetY = el.getBoundingClientRect().top + window.scrollY - 56
    navScrolling.active = true
    if (lenis) {
      lenis.scrollTo(targetY, {
        duration: 1.2,
        onComplete: () => { navScrolling.active = false },
      })
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' })
      setTimeout(() => { navScrolling.active = false }, 1300)
    }
  }

  const scrollTop = () => {
    setMenuOpen(false)
    navScrolling.active = true
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 1.2,
        onComplete: () => { navScrolling.active = false },
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => { navScrolling.active = false }, 1300)
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        style={{
          ...styles.nav,
          background: 'rgba(8, 8, 8, 0.65)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <button onClick={scrollTop} style={styles.logo} data-cursor className="nav-logo" aria-label="Scroll to top">
          GV
        </button>

        {/* Desktop links */}
        <div style={styles.items} className="nav-desktop-items">
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{ ...styles.item, color: active === id ? 'var(--accent)' : 'var(--muted)' }}
              className="nav-item-btn"
              aria-current={active === id ? 'page' : undefined}
              data-cursor
            >
              {label}
            </button>
          ))}
        </div>

        {/* Desktop socials */}
        <div style={styles.socials} className="nav-desktop-socials">
          {DESKTOP_ACTIONS.map(({ Icon, title, href, external, download, accent }) => (
            <a
              key={title}
              href={href}
              title={title}
              aria-label={title}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              download={download}
              style={accent ? styles.downloadLink : styles.socialLink}
              className={accent ? 'download-icon-link' : 'social-icon-link'}
              data-cursor
            >
              <Icon />
            </a>
          ))}
          <button
            type="button"
            aria-label="Language selector"
            aria-pressed={language === 'ru'}
            onClick={() => setLanguage((current) => (current === 'en' ? 'ru' : 'en'))}
            style={styles.languageToggle}
            className="language-toggle"
            data-cursor
          >
            <span
              aria-hidden="true"
              style={{
                ...styles.languageThumb,
                transform: language === 'ru' ? 'translateX(38px)' : 'translateX(0)',
              }}
            />
            <span style={{ ...styles.languageOption, color: language === 'en' ? 'var(--bg)' : 'var(--muted)' }}>
              EN
            </span>
            <span style={{ ...styles.languageOption, color: language === 'ru' ? 'var(--bg)' : 'var(--muted)' }}>
              RU
            </span>
          </button>
        </div>

        {/* Mobile controls */}
        <div style={styles.mobileControls} className="nav-mobile-controls">
          <button
            type="button"
            aria-label="Language selector"
            aria-pressed={language === 'ru'}
            onClick={() => setLanguage((current) => (current === 'en' ? 'ru' : 'en'))}
            style={{ ...styles.languageToggle, ...styles.mobileLanguageToggle }}
            className="language-toggle"
            data-cursor
          >
            <span
              aria-hidden="true"
              style={{
                ...styles.languageThumb,
                ...styles.mobileLanguageThumb,
                transform: language === 'ru' ? 'translateX(30px)' : 'translateX(0)',
              }}
            />
            <span style={{ ...styles.languageOption, ...styles.mobileLanguageOption, color: language === 'en' ? 'var(--bg)' : 'var(--muted)' }}>
              EN
            </span>
            <span style={{ ...styles.languageOption, ...styles.mobileLanguageOption, color: language === 'ru' ? 'var(--bg)' : 'var(--muted)' }}>
              RU
            </span>
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.hamburger}
            className="nav-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            data-cursor
          >
            <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none' }} />
            <span style={{ ...styles.bar, opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'none' }} />
            <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <div
        id="mobile-navigation"
        ref={overlayRef}
        style={styles.overlay}
        className="nav-overlay"
        aria-hidden={!menuOpen}
      >
        <div style={styles.overlayItems}>
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={styles.overlayItem}
              data-cursor
            >
              {label}
            </button>
          ))}
        </div>
        <div style={styles.overlaySocials}>
          {SOCIALS.map(({ Icon, title, href }) => (
            <a
              key={title}
              href={href}
              title={title}
              aria-label={title}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.overlaySocialLink}
              className="overlay-social-link"
              data-cursor
            >
              <Icon />
            </a>
          ))}
        </div>

        <a
          href="/CV_Eng.pdf"
          download="German_Vinokurov_CV.pdf"
          style={styles.overlayCV}
          className="overlay-cv-btn"
          data-cursor
        >
          <DownloadIcon />
          <span>Download CV</span>
        </a>
      </div>

      <style>{navCSS}</style>
    </>
  )
}

const navCSS = `
  .nav-item-btn:hover    { color: var(--fg) !important; }
  .social-icon-link      { color: var(--muted); transition: color 0.2s; }
  .social-icon-link:hover { color: var(--accent) !important; }
  .download-icon-link    { color: var(--accent); transition: color 0.2s, transform 0.2s; }
  .download-icon-link:hover { color: var(--fg) !important; transform: translateY(1px); }
  .language-toggle:hover { border-color: var(--accent) !important; }
  .social-icon-link svg,
  .download-icon-link svg {
    display: block;
    width: 20px;
    height: 20px;
  }
  .nav-logo:hover        { color: var(--accent) !important; }

  /* desktop: show links/socials; hide hamburger */
  @media (min-width: 768px) {
    .nav-desktop-items   { display: flex !important; }
    .nav-desktop-socials { display: flex !important; }
    .nav-mobile-controls { display: none !important; }
    .nav-overlay         { display: none !important; }
  }
  /* mobile: hide desktop links; show hamburger */
  @media (max-width: 767px) {
    .nav-desktop-items   { display: none !important; }
    .nav-desktop-socials { display: none !important; }
    .nav-mobile-controls { display: flex !important; }
    .nav-hamburger       { display: flex !important; }
  }
  /* overlay social icons fill their container */
  .nav-overlay .overlay-social-link svg {
    width: 100%;
    height: 100%;
  }
  .nav-overlay .overlay-social-link:hover { color: var(--accent) !important; }
  .overlay-cv-btn:hover { background: var(--accent) !important; color: var(--bg) !important; }
`

const styles = {
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 6vw',
    zIndex: 9000,
    transition: 'background 0.3s, backdrop-filter 0.3s, border-color 0.3s',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--fg)',
    letterSpacing: '0.05em',
    transition: 'color 0.2s',
    cursor: 'none',
  },
  items: {
    gap: '2.5rem',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'none',
  },
  item: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    letterSpacing: '0.1em',
    transition: 'color 0.2s',
    cursor: 'none',
  },
  socials: {
    position: 'absolute',
    right: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    gap: '0.65rem',
    alignItems: 'center',
    justifyContent: 'flex-end',
    display: 'none',
    width: 'max-content',
  },
  socialLink: {
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    transition: 'color 0.2s',
    flexShrink: 0,
  },
  downloadLink: {
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    transition: 'color 0.2s, transform 0.2s',
    flexShrink: 0,
  },
  languageToggle: {
    position: 'relative',
    marginLeft: '0.65rem',
    width: '78px',
    height: '32px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
    border: '1px solid rgba(255, 92, 92, 0.45)',
    borderRadius: '999px',
    padding: '2px',
    color: 'var(--muted)',
    cursor: 'none',
    overflow: 'hidden',
    transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
    boxShadow: '0 0 0 rgba(255, 92, 92, 0)',
    flexShrink: 0,
  },
  languageThumb: {
    position: 'absolute',
    left: '3px',
    top: '3px',
    width: '34px',
    height: '24px',
    borderRadius: '999px',
    background: 'var(--accent)',
    boxShadow: '0 0 12px rgba(255, 92, 92, 0.35)',
    transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
    zIndex: 0,
  },
  languageOption: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.08em',
    lineHeight: 1,
    transition: 'color 0.22s ease',
  },
  mobileControls: {
    display: 'none',
    alignItems: 'center',
    gap: '0.8rem',
    marginLeft: 'auto',
  },
  mobileLanguageToggle: {
    width: '62px',
    height: '28px',
    marginLeft: 0,
  },
  mobileLanguageThumb: {
    width: '26px',
    height: '20px',
  },
  mobileLanguageOption: {
    fontSize: '10px',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '4px',
    padding: '4px',
    cursor: 'none',
  },
  bar: {
    width: '20px',
    height: '1px',
    background: 'var(--fg)',
    display: 'block',
    transition: 'transform 0.25s ease, opacity 0.2s',
    transformOrigin: 'center',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#080808',
    zIndex: 8999,
    display: 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    willChange: 'transform, opacity',
  },
  overlayItems: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
  },
  overlayItem: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(36px, 10vw, 72px)',
    color: 'var(--muted)',
    letterSpacing: 0,
    cursor: 'none',
    transition: 'color 0.2s',
  },
  overlaySocials: {
    display: 'flex',
    gap: '2.5rem',
    marginTop: '4rem',
    alignItems: 'center',
  },
  overlaySocialLink: {
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    width: '36px',
    height: '36px',
  },
  overlayCV: {
    marginTop: '3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    padding: '0.7rem 1.4rem',
    transition: 'background 0.2s, color 0.2s',
    cursor: 'none',
  },
}
