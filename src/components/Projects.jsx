import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useIsMobile'

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
)

function splitProjectTitle(name) {
  if (name.includes(' ')) return [name]

  const suffix = ['DESIGN', 'UNIT'].find((part) => name.endsWith(part) && name.length > part.length)
  if (!suffix) return [name]

  return [name.slice(0, -suffix.length), suffix]
}

function CardContent({ project, labels }) {
  const titleHref = project.website || project.github
  const titleParts = splitProjectTitle(project.name)

  return (
    <div style={s.cardInner}>
      {/* left: number + title */}
      <div style={s.titleCol}>
        <span data-anim="num" style={s.number}>{project.number}</span>
        <a href={titleHref} target="_blank" rel="noopener noreferrer" style={s.titleLink} data-cursor>
          <h3 data-text={project.name} style={s.title} className="project-title" data-i18n>
            {titleParts.map((part, i) => (
              <span key={`${part}-${i}`} className="project-title-part">
                {part}
              </span>
            ))}
          </h3>
        </a>
      </div>

      {/* right: description + tags + links */}
      <div style={s.bodyCol}>
        <p data-anim="desc" style={s.description} data-i18n>{project.description}</p>
        <div style={s.tags}>
          {project.tags.map((tag, j) => (
            <span key={j} data-anim="tag" style={s.tag} data-i18n>
              {tag}{j < project.tags.length - 1 && <span style={s.tagSep}> /</span>}
            </span>
          ))}
        </div>
        <div style={s.links}>
          {project.website && (
            <a href={project.website} target="_blank" rel="noopener noreferrer"
              data-anim="link" style={s.iconLink} className="proj-link" title={labels.website} data-cursor data-i18n>
              <GlobeIcon /><span>{labels.website}</span>
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              data-anim="link" style={s.iconLink} className="proj-link" title={labels.github} data-cursor data-i18n>
              <GithubIcon /><span>{labels.github}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function getCardElems(card) {
  return {
    num:   card.querySelector('[data-anim="num"]'),
    desc:  card.querySelector('[data-anim="desc"]'),
    tags:  [...card.querySelectorAll('[data-anim="tag"]')],
    links: [...card.querySelectorAll('[data-anim="link"]')],
  }
}

function setCardHidden(card) {
  const { num, desc, tags, links } = getCardElems(card)
  if (num)  gsap.set(num,  { y: 10, opacity: 0 })
  if (desc) gsap.set(desc, { y: 18, opacity: 0 })
  if (tags.length)  gsap.set(tags,  { y: 12, opacity: 0 })
  if (links.length) gsap.set(links, { y: 10, opacity: 0 })
}

function animateCardIn(card) {
  const { num, desc, tags, links } = getCardElems(card)
  const tl = gsap.timeline()
  if (num)  tl.fromTo(num,  { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: 'power3.out' }, 0)
  if (desc) tl.fromTo(desc, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4,  ease: 'power3.out' }, 0.1)
  if (tags.length)  tl.fromTo(tags,  { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power3.out' }, 0.2)
  if (links.length) tl.fromTo(links, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, stagger: 0.07, ease: 'power3.out' }, 0.28)
  return tl
}

export default function Projects() {
  const sectionRef = useRef(null)
  const stageRef   = useRef(null)
  const cardRefs   = useRef([])
  const isMobile   = useIsMobile()
  const { content } = useLanguage()
  const projects = content.projects
  const sectionTitle = content.ui.sections.projects
  const labels = content.ui.projectLinks
  const N          = projects.length

  useGSAP(() => {
    if (isMobile) return
    const stage = stageRef.current
    const cards  = cardRefs.current
    if (!stage || !cards.length) return

    /* hide all card interiors before any scroll */
    cards.forEach(card => setCardHidden(card))

    const transforms = cards.map((card, i) => ({
      card,
      xPercent: i > 0 ? 100 : 0,
      scale: 1,
    }))
    const renderCard = (i) => {
      const transform = transforms[i]
      if (!transform?.card) return
      transform.card.style.transform =
        `translate3d(${transform.xPercent}%, 0, 0) scale(${transform.scale})`
    }

    /* all cards except the first start off-screen to the right */
    transforms.forEach((_, i) => renderCard(i))
    let lastIdx = -1

    /* track which cards have had their inner animation fired */
    const innerFired = new Array(N).fill(false)

    ScrollTrigger.create({
      trigger: stage,
      start: 'top 52px',
      end: () => `+=${Math.max(1, N - 1) * window.innerHeight}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const idx = self.progress * (N - 1)   /* 0 → N-1 over full scroll */
        if (Math.abs(idx - lastIdx) < 0.001) return
        lastIdx = idx

        /* card 0 is always in position — animate its interior on first onUpdate */
        if (!innerFired[0]) {
          innerFired[0] = true
          animateCardIn(cards[0])
        }

        cards.forEach((card, i) => {
          if (i === 0) return
          /* each card occupies a 1-unit window of idx */
          const cp = gsap.utils.clamp(0, 1, idx - (i - 1))
          transforms[i].xPercent = (1 - cp) * 100
          renderCard(i)

          /* slightly scale-down the card being covered */
          if (cards[i - 1]) {
            transforms[i - 1].scale = 1 - cp * 0.04
            renderCard(i - 1)
          }

          /* fire inner animation when card is mostly arrived */
          if (cp >= 0.88 && !innerFired[i]) {
            innerFired[i] = true
            animateCardIn(card)
          }
          /* reset when card has slid well off screen (user scrolled back) */
          if (cp < 0.08 && innerFired[i]) {
            innerFired[i] = false
            setCardHidden(card)
          }
        })
      },
      onLeaveBack() {
        /* user scrolled back above the section — reset card 0 */
        if (innerFired[0]) {
          innerFired[0] = false
          setCardHidden(cards[0])
        }
      },
    })
  }, { scope: sectionRef, dependencies: [isMobile, N], revertOnUpdate: true })

  /* mobile: per-card ScrollTrigger slide-in with staggered inner elements */
  useGSAP(() => {
    if (!isMobile) return
    sectionRef.current.querySelectorAll('[data-mob-panel]').forEach(panel => {
      const num   = panel.querySelector('[data-anim="num"]')
      const title = panel.querySelector('.project-title')
      const desc  = panel.querySelector('[data-anim="desc"]')
      const tags  = [...panel.querySelectorAll('[data-anim="tag"]')]
      const links = [...panel.querySelectorAll('[data-anim="link"]')]

      /* set initial hidden state — title slides from left */
      gsap.set([num, desc, ...tags, ...links].filter(Boolean), { y: 0, opacity: 0 })
      if (title) gsap.set(title, { x: -72, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top 86%', toggleActions: 'play none none reverse' },
      })
      if (num)  tl.fromTo(num,  { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: 'power3.out' }, 0)
      if (title) tl.fromTo(title, { x: -72, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.52, ease: 'power3.out',
        onComplete() {
          title.classList.add('project-title--glitch')
          setTimeout(() => title.classList.remove('project-title--glitch'), 420)
        },
      }, 0.04)
      if (desc)         tl.fromTo(desc,  { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36, ease: 'power3.out' }, 0.22)
      if (tags.length)  tl.fromTo(tags,  { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, stagger: 0.04, ease: 'power3.out' }, 0.32)
      if (links.length) tl.fromTo(links, { y: 8,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.26, stagger: 0.07, ease: 'power3.out' }, 0.40)
    })
  }, { scope: sectionRef, dependencies: [isMobile, projects], revertOnUpdate: true })

  return (
    <section id="projects" ref={sectionRef} style={s.section}>
      <div style={s.header}>
        <h2 style={s.headerLabel} data-i18n>{sectionTitle}</h2>
      </div>

      {isMobile ? (
        /* ── Mobile: stacked vertical list ── */
        projects.map((project) => (
          <div key={project.number} data-mob-panel style={s.mobPanel}>
            <CardContent project={project} labels={labels} />
          </div>
        ))
      ) : (
        /* ── Desktop: pinned stacked cards ── */
        <div ref={stageRef} style={s.stage}>
          {projects.map((project, i) => (
            <div
              key={project.number}
              ref={el => (cardRefs.current[i] = el)}
              data-project-card
              data-project-title={project.name}
              style={{ ...s.card, zIndex: i + 1 }}
            >
              <CardContent project={project} labels={labels} />
            </div>
          ))}
        </div>
      )}

      <style>{css}</style>
    </section>
  )
}

const css = `
  .project-title { position: relative; }
  .project-title::before, .project-title::after {
    content: attr(data-text);
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0;
  }
  @keyframes glitch-top {
    0%   { transform:translate3d(-3px,-1px,0); opacity:.85; color:var(--accent); }
    25%  { transform:translate3d(3px,1px,0); }
    50%  { transform:translate3d(-2px,0,0); }
    75%  { transform:translate3d(1px,-1px,0); }
    100% { transform:translate3d(0,0,0); opacity:0; }
  }
  @keyframes glitch-bot {
    0%   { transform:translate3d(3px,1px,0); opacity:.7; }
    33%  { transform:translate3d(-3px,-1px,0); }
    66%  { transform:translate3d(2px,0,0); }
    100% { transform:translate3d(0,0,0); opacity:0; }
  }
  .project-title:hover::before { animation: glitch-top 0.28s steps(1) forwards; }
  .project-title:hover::after  { animation: glitch-bot 0.28s steps(1) .04s forwards; }
  .project-title-part { display: inline; }
  @media (max-width: 767px) {
    [data-mob-panel] > div {
      grid-template-columns: minmax(0, 40%) minmax(0, 1fr) !important;
      gap: 1rem !important;
      align-items: start !important;
    }
    [data-mob-panel] > div > div:first-child {
      min-width: 0 !important;
      max-width: 100% !important;
    }
    [data-mob-panel] .project-title {
      max-width: 100% !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
      font-size: clamp(28px, 9vw, 38px) !important;
      line-height: 0.95 !important;
      letter-spacing: 0 !important;
    }
    [data-mob-panel] .project-title::before,
    [data-mob-panel] .project-title::after {
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }
    [data-mob-panel] .project-title-part {
      display: block;
    }
    .project-title--glitch::before { animation: glitch-top 0.28s steps(1) forwards; }
    .project-title--glitch::after  { animation: glitch-bot 0.28s steps(1) .04s forwards; }
  }
  .proj-link:hover { color: var(--fg) !important; border-color: var(--fg) !important; }
`

const NAV_H = 52

const s = {
  section: { borderBottom: '1px solid var(--border)' },
  header: { padding: '2.5rem 6vw 2rem', borderBottom: '1px solid var(--border)' },
  headerLabel: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 400,
    color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase',
  },

  /* pinned stage — ScrollTrigger owns the scroll distance */
  stage: {
    position: 'relative',
    height: `calc(100svh - ${NAV_H}px)`,
    overflow: 'hidden',
  },

  /* individual card — absolutely fills the stage */
  card: {
    position: 'absolute',
    inset: 0,
    background: 'var(--bg)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  },

  /* two-column layout inside each card */
  cardInner: {
    width: '100%',
    padding: '5vh 6vw',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4vw',
    alignItems: 'center',
  },
  titleCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  number: {
    fontFamily: 'var(--font-mono)', fontSize: '11px',
    color: 'var(--muted)', letterSpacing: '0.1em',
  },
  titleLink: { textDecoration: 'none', color: 'inherit', cursor: 'none', display: 'block' },
  title: {
    fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: 'clamp(44px, 7.5vw, 120px)',
    lineHeight: 0.92, letterSpacing: '-0.02em',
    color: 'var(--fg)', margin: 0, cursor: 'none', position: 'relative',
  },
  bodyCol: { display: 'flex', flexDirection: 'column', gap: '1.75rem', justifyContent: 'center' },
  description: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(13px, 1.1vw, 16px)',
    color: 'var(--muted)', lineHeight: 1.7, maxWidth: '420px',
  },
  tags: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  tag: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em' },
  tagSep: { color: 'var(--accent)' },
  links: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  iconLink: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 0.9vw, 12px)',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--accent)', border: '1px solid var(--accent)',
    padding: '0.45rem 0.9rem', transition: 'color 0.18s, border-color 0.18s',
    cursor: 'none',
  },

  /* mobile */
  mobPanel: {
    borderBottom: '1px solid var(--border)',
    padding: '0',
  },
}
