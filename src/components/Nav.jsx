import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { useLanguage } from '../context/LanguageContext'
import { navScrolling } from '../utils/navScrolling'

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v13M7 11l5 5 5-5M4 20h16" />
  </svg>
)

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

export default function Nav({ visible }) {
  const navRef     = useRef(null)
  const logoRef    = useRef(null)
  const itemsRef   = useRef(null)
  const socialsRef = useRef(null)
  const overlayRef = useRef(null)
  const toggleRef  = useRef(null)
  const thumbRef   = useRef(null)
  const lenis      = useLenis()
  const [active, setActive]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [compactNav, setCompactNav] = useState(false)

  const { lang, switchLanguage, content } = useLanguage()
  const { person, ui } = content
  const NAV_ITEMS = ui.navItems
  const SOCIALS = [
    { Icon: GithubIcon,   title: 'GitHub',   href: person.contact.githubUrl },
    { Icon: TwitterIcon,  title: 'Twitter',  href: person.contact.twitterUrl },
    { Icon: LinkedinIcon, title: 'LinkedIn', href: person.contact.linkedinUrl },
  ]

  useGSAP(() => {
    if (!navRef.current) return
    gsap.set(navRef.current, { y: -52, opacity: 0 })
  }, [])

  useEffect(() => {
    if (!visible || !navRef.current) return
    gsap.to(navRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.1 })
  }, [visible])

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
  }, [visible, NAV_ITEMS])

  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    const items = el.querySelectorAll('[data-ol]')
    gsap.killTweensOf([el, ...items])

    if (menuOpen) {
      lenis?.stop()
      gsap.set(el, { display: 'flex', y: '100%' })
      gsap.set(items, { y: 28, opacity: 0 })

      const tl = gsap.timeline()
      tl.to(el,    { y: 0, duration: 0.42, ease: 'power3.out' })
      tl.to(items, { y: 0, opacity: 1, duration: 0.26, stagger: 0.07, ease: 'power3.out' }, '-=0.18')
    } else {
      lenis?.start()
      const tl = gsap.timeline({
        onComplete: () => gsap.set(el, { display: 'none', y: 0 }),
      })
      tl.to(items, { opacity: 0, duration: 0.14, stagger: 0.03, ease: 'none' }, 0)
      tl.to(el,    { y: '100%', duration: 0.32, ease: 'power2.in' }, 0.08)
    }

    return () => gsap.killTweensOf([el, ...items])
  }, [menuOpen, lenis])

  const scrollTo = (id) => {
    lenis?.start()
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    const targetY = el.getBoundingClientRect().top + window.scrollY - 56
    navScrolling.active = true
    if (lenis) {
      lenis.scrollTo(targetY, { duration: 1.2, onComplete: () => { navScrolling.active = false } })
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' })
      setTimeout(() => { navScrolling.active = false }, 1300)
    }
  }

  const scrollTop = () => {
    setMenuOpen(false)
    navScrolling.active = true
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2, onComplete: () => { navScrolling.active = false } })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => { navScrolling.active = false }, 1300)
    }
  }

  const handleLangToggle = () => {
    const next = lang === 'en' ? 'ru' : 'en'

    const toggle = toggleRef.current
    const thumb  = thumbRef.current
    if (toggle && thumb) {
      gsap.timeline()
        .to(thumb,  { filter: 'brightness(1.14)', duration: 0.08, ease: 'power2.out' })
        .to(thumb,  { filter: 'brightness(1)',    duration: 0.18, ease: 'power2.out' })
      gsap.to(toggle, {
        boxShadow: '0 0 0 1px rgba(255,92,92,0.32), 0 0 14px rgba(255,92,92,0.12)',
        duration: 0.12,
        onComplete() {
          gsap.to(toggle, { boxShadow: '0 0 0 rgba(255,92,92,0)', duration: 0.28, ease: 'power2.out' })
        },
      })
    }

    switchLanguage(next)
  }

  const DESKTOP_ACTIONS = [
    { Icon: TwitterIcon,  title: 'Twitter',       href: person.contact.twitterUrl,  external: true },
    { Icon: LinkedinIcon, title: 'LinkedIn',      href: person.contact.linkedinUrl, external: true },
    { Icon: GithubIcon,   title: 'GitHub',        href: person.contact.githubUrl,   external: true },
    { Icon: DownloadIcon, title: ui.downloadCV,   href: ui.cvFile, download: ui.cvFilename, accent: true },
  ]

  const measureNavFit = useCallback(() => {
    const nav = navRef.current
    const logo = logoRef.current
    const items = itemsRef.current
    const socials = socialsRef.current
    if (!nav || !logo || !items || !socials) return

    const navRect = nav.getBoundingClientRect()
    const logoRect = logo.getBoundingClientRect()
    const itemsRect = items.getBoundingClientRect()
    const socialsRect = socials.getBoundingClientRect()
    const minGap = 24

    setCompactNav(
      navRect.width <= 767 ||
      logoRect.right + minGap > itemsRect.left ||
      itemsRect.right + minGap > socialsRect.left
    )
  }, [])

  useLayoutEffect(() => {
    let frame = 0
    let cancelled = false
    const requestMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!cancelled) measureNavFit()
      })
    }

    measureNavFit()
    requestMeasure()

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(requestMeasure)
      : null
    ;[navRef.current, logoRef.current, itemsRef.current, socialsRef.current]
      .filter(Boolean)
      .forEach((el) => observer?.observe(el))

    window.addEventListener('resize', requestMeasure)
    document.fonts?.ready?.then(requestMeasure)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', requestMeasure)
    }
  }, [measureNavFit, lang, NAV_ITEMS])

  useEffect(() => {
    if (!compactNav) setMenuOpen(false)
  }, [compactNav])

  return (
    <>
      <nav
        ref={navRef}
        className={compactNav ? 'nav-shell nav--compact' : 'nav-shell'}
        style={{
          ...styles.nav,
          background: 'rgba(8, 8, 8, 0.94)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <button ref={logoRef} onClick={scrollTop} style={styles.logo} data-cursor className="nav-logo" aria-label="Scroll to top">
          GV
        </button>

        <div ref={itemsRef} style={styles.items} className="nav-desktop-items">
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{ ...styles.item, color: active === id ? 'var(--accent)' : 'var(--muted)' }}
              className="nav-item-btn"
              aria-current={active === id ? 'page' : undefined}
              data-cursor
              data-i18n
            >
              {label}
            </button>
          ))}
        </div>

        <div ref={socialsRef} style={styles.socials} className="nav-desktop-socials">
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
              data-i18n={accent ? true : undefined}
            >
              <Icon />
            </a>
          ))}
          <button
            ref={toggleRef}
            type="button"
            aria-label="Language selector"
            aria-pressed={lang === 'ru'}
            onClick={handleLangToggle}
            style={styles.languageToggle}
            className="language-toggle"
            data-cursor
          >
            <span
              ref={thumbRef}
              aria-hidden="true"
              style={{
                ...styles.languageThumb,
                transform: lang === 'ru' ? 'translateX(38px)' : 'translateX(0)',
              }}
            />
            <span style={{ ...styles.languageOption, color: lang === 'en' ? 'var(--bg)' : 'var(--muted)' }}>EN</span>
            <span style={{ ...styles.languageOption, color: lang === 'ru' ? 'var(--bg)' : 'var(--muted)' }}>RU</span>
          </button>
        </div>

        <div style={styles.compactGroup}>
          <button
            type="button"
            onClick={handleLangToggle}
            style={styles.languageToggle}
            className="language-toggle nav-compact-lang"
            aria-label="Language selector"
            data-cursor
          >
            <span aria-hidden="true" style={{ ...styles.languageThumb, transform: lang === 'ru' ? 'translateX(38px)' : 'translateX(0)' }} />
            <span style={{ ...styles.languageOption, color: lang === 'en' ? 'var(--bg)' : 'var(--muted)' }}>EN</span>
            <span style={{ ...styles.languageOption, color: lang === 'ru' ? 'var(--bg)' : 'var(--muted)' }}>RU</span>
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

      <div
        id="mobile-navigation"
        ref={overlayRef}
        style={styles.overlay}
        className={compactNav ? 'nav-overlay nav-overlay--compact' : 'nav-overlay'}
        aria-hidden={!menuOpen}
      >
        <div style={styles.overlayItems}>
          {NAV_ITEMS.map(({ label, id }) => (
            <button key={id} data-ol onClick={() => scrollTo(id)} style={styles.overlayItem} data-cursor data-i18n>
              {label}
            </button>
          ))}
        </div>
        <div data-ol style={styles.overlaySocials}>
          {SOCIALS.map(({ Icon, title, href }) => (
            <a key={title} href={href} title={title} aria-label={title}
              target="_blank" rel="noopener noreferrer"
              style={styles.overlaySocialLink} className="overlay-social-link" data-cursor>
              <Icon />
            </a>
          ))}
        </div>
        <a data-ol href={ui.cvFile} download={ui.cvFilename} style={styles.overlayCV} className="overlay-cv-btn" data-cursor data-i18n>
          <DownloadIcon />
          <span>{ui.downloadCV}</span>
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
  .download-icon-link svg { display: block; width: 20px; height: 20px; }
  .nav-logo:hover        { opacity: 0.75; }

  .nav-shell .nav-desktop-items,
  .nav-shell .nav-desktop-socials {
    display: flex !important;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: opacity 0.18s ease, visibility 0.18s ease;
  }
  .nav-shell.nav--compact .nav-desktop-items,
  .nav-shell.nav--compact .nav-desktop-socials {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  .nav-shell .nav-hamburger { display: none !important; }
  .nav-shell.nav--compact .nav-hamburger { display: flex !important; }
  .nav-compact-lang { display: none !important; }
  .nav--compact .nav-compact-lang { display: grid !important; }
  .nav-overlay:not(.nav-overlay--compact) { display: none !important; }
  .nav-overlay .overlay-social-link svg { width: 100%; height: 100%; }
  .nav-overlay .overlay-social-link:hover { color: var(--accent) !important; }
  .overlay-cv-btn:hover { background: var(--accent) !important; color: var(--bg) !important; }
`

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: '52px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 6vw', zIndex: 9000,
    transition: 'background 0.3s, border-color 0.3s',
  },
  logo: {
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
    color: 'var(--accent)', letterSpacing: '0.05em', cursor: 'none', flexShrink: 0,
  },
  items: { gap: '2.5rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'none' },
  item: { fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.1em', transition: 'color 0.2s', cursor: 'none' },
  socials: {
    position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)',
    gap: '0.65rem', alignItems: 'center', justifyContent: 'flex-end', display: 'none', width: 'max-content',
  },
  socialLink: {
    color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '32px', height: '32px', transition: 'color 0.2s', flexShrink: 0,
  },
  downloadLink: {
    color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '32px', height: '32px', transition: 'color 0.2s, transform 0.2s', flexShrink: 0,
  },
  languageToggle: {
    position: 'relative', marginLeft: '0.65rem', width: '78px', height: '32px',
    display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center',
    border: '1px solid rgba(255, 92, 92, 0.45)', borderRadius: '999px', padding: '2px',
    color: 'var(--muted)', cursor: 'none', overflow: 'hidden',
    transition: 'border-color 0.22s ease, box-shadow 0.22s ease', flexShrink: 0,
  },
  languageThumb: {
    position: 'absolute', left: '3px', top: '3px', width: '34px', height: '24px',
    borderRadius: '999px', background: 'var(--accent)',
    boxShadow: '0 0 12px rgba(255, 92, 92, 0.35)',
    transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)', zIndex: 0,
  },
  languageOption: {
    position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', lineHeight: 1,
    transition: 'color 0.22s ease',
  },
  compactGroup: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  hamburger: { display: 'none', flexDirection: 'column', gap: '4px', padding: '4px', cursor: 'none' },
  bar: {
    width: '20px', height: '1px', background: 'var(--fg)', display: 'block',
    transition: 'transform 0.25s ease, opacity 0.2s', transformOrigin: 'center',
  },
  overlay: {
    position: 'fixed', inset: 0, background: '#080808', zIndex: 8999,
    display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '0', willChange: 'transform, opacity',
  },
  overlayItems: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' },
  overlayItem: {
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(36px, 10vw, 72px)',
    color: 'var(--muted)', letterSpacing: 0, cursor: 'none', transition: 'color 0.2s',
  },
  overlaySocials: { display: 'flex', gap: '2.5rem', marginTop: '4rem', alignItems: 'center' },
  overlaySocialLink: { color: 'var(--muted)', display: 'flex', alignItems: 'center', transition: 'color 0.2s', width: '36px', height: '36px' },
  overlayCV: {
    marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
    fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--accent)', border: '1px solid var(--accent)', padding: '0.7rem 1.4rem',
    transition: 'background 0.2s, color 0.2s', cursor: 'none',
  },
}
