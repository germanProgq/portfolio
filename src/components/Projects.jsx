import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/content'

export default function Projects() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const panels = sectionRef.current.querySelectorAll('[data-panel]')

      panels.forEach((panel) => {
        const inner = panel.querySelector('[data-panel-inner]')

        gsap.fromTo(
          inner,
          { autoAlpha: 0, y: 48 },
          {
            autoAlpha: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 88%',
              end: 'top 20%',
              scrub: 0.4,
            },
          }
        )
      })
    },
    { scope: sectionRef }
  )

  const onPanelEnter = (e) => {
    gsap.to(e.currentTarget, { background: '#0d0d0d', duration: 0.25 })
    gsap.to(e.currentTarget.querySelector('[data-border-top]'), {
      scaleX: 1, duration: 0.3, ease: 'power2.out',
    })
  }

  const onPanelLeave = (e) => {
    gsap.to(e.currentTarget, { background: 'transparent', duration: 0.35 })
    gsap.to(e.currentTarget.querySelector('[data-border-top]'), {
      scaleX: 0, duration: 0.25,
    })
  }

  return (
    <section id="projects" ref={sectionRef} style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionLabel}>PROJECTS</h2>
      </div>

      {projects.map((project, i) => (
        <div
          key={i}
          data-panel
          style={styles.panel}
          onMouseEnter={onPanelEnter}
          onMouseLeave={onPanelLeave}
        >
          {/* accent top border that slides in on hover */}
          <div
            data-border-top
            style={styles.panelBorderTop}
          />

          <div data-panel-inner style={styles.panelInner}>
            <span style={styles.number}>{project.number}</span>

            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.titleLink}
              data-cursor
            >
              <h3 data-text={project.name} style={styles.title} className="project-title">
                {project.name}
              </h3>
            </a>

            <div style={styles.footer}>
              <p style={styles.description}>{project.description}</p>
              <div style={styles.footerRight}>
                <div style={styles.tags}>
                  {project.tags.map((tag, j) => (
                    <span key={j} style={styles.tag}>
                      {tag}
                      {j < project.tags.length - 1 && <span style={styles.tagSep}> /</span>}
                    </span>
                  ))}
                </div>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.githubLink}
                  className="project-github"
                  data-cursor
                  aria-label={`View ${project.name} on GitHub`}
                  onClick={(e) => e.stopPropagation()}
                >
                  View on GitHub ↗
                </a>
              </div>
            </div>
          </div>

          {i < projects.length - 1 && <div style={styles.panelBorderBottom} />}
        </div>
      ))}

      <style>{glitchCSS}</style>
    </section>
  )
}

const glitchCSS = `
  .project-title::before,
  .project-title::after {
    content: attr(data-text);
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    opacity: 0;
  }
  @keyframes glitch-top {
    0%   { transform: translate3d(-3px, -1px, 0); opacity: 0.85; color: var(--accent); }
    25%  { transform: translate3d(3px, 1px, 0); }
    50%  { transform: translate3d(-2px, 0, 0); }
    75%  { transform: translate3d(1px, -1px, 0); }
    100% { transform: translate3d(0, 0, 0); opacity: 0; }
  }
  @keyframes glitch-bot {
    0%   { transform: translate3d(3px, 1px, 0); opacity: 0.7; }
    33%  { transform: translate3d(-3px, -1px, 0); }
    66%  { transform: translate3d(2px, 0, 0); }
    100% { transform: translate3d(0, 0, 0); opacity: 0; }
  }
  .project-title:hover::before { animation: glitch-top 0.28s steps(1) forwards; }
  .project-title:hover::after  { animation: glitch-bot 0.28s steps(1) 0.04s forwards; }
  .project-github:hover { color: var(--fg) !important; }
`

const styles = {
  section: { borderBottom: '1px solid var(--border)' },
  sectionHeader: {
    padding: '2.5rem 6vw 2rem',
    borderBottom: '1px solid var(--border)',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--accent)',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  panel: {
    position: 'relative',
    minHeight: '88svh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'background 0.25s',
  },
  panelBorderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'var(--accent)',
    transformOrigin: 'left center',
    transform: 'scaleX(0)',
  },
  panelInner: {
    padding: '6vh 6vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '88svh',
    willChange: 'transform, opacity',
  },
  number: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--muted)',
    letterSpacing: '0.1em',
    alignSelf: 'flex-end',
  },
  titleLink: {
    display: 'block',
    margin: 'auto 0',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'none',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(56px, 13vw, 200px)',
    lineHeight: 0.9,
    letterSpacing: 0,
    color: 'var(--fg)',
    margin: 0,
    cursor: 'none',
    position: 'relative',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '4vw',
    flexWrap: 'wrap',
  },
  description: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(12px, 1.1vw, 16px)',
    color: 'var(--muted)',
    lineHeight: 1.65,
    maxWidth: '460px',
  },
  footerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  tags: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--muted)',
    letterSpacing: '0.06em',
  },
  tagSep: { color: 'var(--accent)' },
  githubLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(12px, 1vw, 14px)',
    color: 'var(--accent)',
    letterSpacing: '0.08em',
    transition: 'color 0.2s',
    cursor: 'none',
    padding: '6px 0',
    display: 'inline-block',
  },
  panelBorderBottom: {
    position: 'absolute',
    bottom: 0,
    left: '6vw',
    right: '6vw',
    height: '1px',
    background: 'var(--border)',
  },
}
