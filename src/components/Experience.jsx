import { useRef, useLayoutEffect, useState, useCallback, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { useLanguage } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { navScrolling } from '../utils/navScrolling'

/* module-level — survives re-mounts, tracks whether the full animation
   has ever played in this session */
let impactEverFired = false

const clamp01 = gsap.utils.clamp(0, 1)
const THREAD_READER_RATIO = 0.68
const THREAD_DRAW_LEAD = 0.075

const clampValue = (min, max, value) => Math.max(min, Math.min(max, value))

function reflect(cp, pivot) {
  return [2 * pivot[0] - cp[0], 2 * pivot[1] - cp[1]]
}

function randomUnit(index, salt = 0) {
  const x = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function randomRange(index, salt, min, max) {
  return min + (max - min) * randomUnit(index, salt)
}

function buildPath(pts, cx, totalH) {
  if (!pts.length) return ''

  const firstY = pts[0].y
  let d = `M ${cx} 0`
  let prevCP = [cx, firstY * 0.68]

  d += ` C ${cx} ${firstY * 0.28}, ${prevCP[0]} ${prevCP[1]}, ${cx} ${firstY}`

  /* One self-crossing per gap. The seeded variation keeps the knots organic
     without changing shape on every render or resize. */
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], h = b.y - a.y
    const side = randomUnit(i, 1) > 0.5 ? 1 : -1
    const amp = clampValue(38, 74, h * randomRange(i, 2, 0.11, 0.16))
    const loopH = clampValue(82, 148, h * randomRange(i, 3, 0.25, 0.36))
    const crossY = a.y + h * randomRange(i, 4, 0.42, 0.56)
    const crossing = [cx + side * randomRange(i, 5, -5, 5), crossY]
    const upperLean = randomRange(i, 6, 0.52, 0.78)
    const lowerLean = randomRange(i, 7, 0.88, 1.24)
    const returnLean = randomRange(i, 8, 0.22, 0.46)
    const exitLean = randomRange(i, 9, 0.08, 0.2)

    const entryC1 = reflect(prevCP, [cx, a.y])
    const entryC2 = [
      cx + side * amp * upperLean,
      crossing[1] - loopH * randomRange(i, 10, 0.24, 0.36),
    ]
    d += ` C ${entryC1[0]} ${entryC1[1]}, ${entryC2[0]} ${entryC2[1]}, ${crossing[0]} ${crossing[1]}`

    const loopC1 = reflect(entryC2, crossing)
    const loopMid = [
      cx - side * amp * lowerLean,
      crossing[1] + loopH * randomRange(i, 11, 0.08, 0.22),
    ]
    const loopC2 = [
      cx - side * amp * randomRange(i, 12, 0.95, 1.34),
      crossing[1] - loopH * randomRange(i, 13, 0.18, 0.34),
    ]
    d += ` C ${loopC1[0]} ${loopC1[1]}, ${loopC2[0]} ${loopC2[1]}, ${loopMid[0]} ${loopMid[1]}`

    const returnC1 = reflect(loopC2, loopMid)
    const returnC2 = [
      cx - side * amp * returnLean,
      crossing[1] - loopH * randomRange(i, 14, 0.18, 0.31),
    ]
    d += ` C ${returnC1[0]} ${returnC1[1]}, ${returnC2[0]} ${returnC2[1]}, ${crossing[0]} ${crossing[1]}`

    const exitC1 = reflect(returnC2, crossing)
    const exitC2 = [
      cx + side * amp * exitLean,
      b.y - h * randomRange(i, 15, 0.14, 0.24),
    ]
    d += ` C ${exitC1[0]} ${exitC1[1]}, ${exitC2[0]} ${exitC2[1]}, ${cx} ${b.y}`
    prevCP = exitC2
  }

  const lastY = pts[pts.length - 1].y
  const tailC1 = reflect(prevCP, [cx, lastY])
  d += ` C ${tailC1[0]} ${tailC1[1]}, ${cx} ${lastY + (totalH - lastY) * 0.62}, ${cx} ${totalH}`

  return d
}

function CardContent({ job, i, isLeft }) {
  const flip = isLeft ? 'row-reverse' : 'row'
  const align = isLeft ? 'flex-end' : 'flex-start'
  const ta = isLeft ? 'right' : 'left'
  return (
    <>
      <div style={{ ...cs.top, flexDirection: flip }}>
        {job.website ? (
          <a
            href={job.website}
            target="_blank"
            rel="noopener noreferrer"
            style={cs.companyLink}
            data-cursor
            data-i18n
          >
            {job.company}
          </a>
        ) : (
        <span style={cs.company} data-i18n>{job.company}</span>
        )}
        <span style={cs.idx}>{String(i + 1).padStart(2, '0')}</span>
      </div>
      <h3 style={{ ...cs.role, textAlign: ta }} data-i18n>{job.role}</h3>
      <div style={{ ...cs.meta, flexDirection: flip, justifyContent: align }}>
        <span style={cs.period} data-i18n>{job.period}</span>
        <span style={cs.metaDot}>·</span>
        <span style={cs.period} data-i18n>{job.type}</span>
      </div>
      <ul style={{ ...cs.bullets, alignItems: align }}>
        {job.bullets.map((b, j) => (
          <li key={j} style={{ ...cs.bullet, flexDirection: flip }}>
            <span style={cs.dash}>—</span>
            <span style={cs.bText} data-i18n>{b}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Experience() {
  const sectionRef    = useRef(null)
  const wrapperRef    = useRef(null)
  const pathRef   = useRef(null)
  const flashRef  = useRef(null)
  const borderLineRef = useRef(null)
  const glowRef       = useRef(null)
  const lenisRef      = useRef(null)
  const dotRefs       = useRef([])
  const ringRefs      = useRef([])
  const cardRefs      = useRef([])
  const fracsRef      = useRef([])
  const isMobile      = useIsMobile()
  const lenis         = useLenis()
  const [pathD, setPathD] = useState(null)
  const { content } = useLanguage()
  const jobs = content.experience
  const sectionTitle = content.ui.sections.experience

  useEffect(() => { lenisRef.current = lenis }, [lenis])

  const remeasure = useCallback(() => {
    if (isMobile || !wrapperRef.current) return
    const dots = dotRefs.current
    if (!dots.length || dots.some(d => !d)) return
    const wRect = wrapperRef.current.getBoundingClientRect()
    if (wRect.height < 10) return
    const cx = wRect.width / 2
    const pts = dots.map(dot => {
      const r = dot.getBoundingClientRect()
      return { x: cx, y: r.top - wRect.top + r.height / 2 }
    })
    fracsRef.current = pts.map(p => p.y / wRect.height)
    const nextPath = buildPath(pts, cx, wRect.height)
    setPathD(prevPath => (prevPath === nextPath ? prevPath : nextPath))
  }, [isMobile])

  useLayoutEffect(() => {
    if (isMobile) return
    const id = setTimeout(remeasure, 80)
    const ro = new ResizeObserver(remeasure)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => { clearTimeout(id); ro.disconnect() }
  }, [remeasure, isMobile])

  useGSAP(() => {
    if (isMobile || !pathD || !pathRef.current) return
    const path = pathRef.current
    const totalLen = path.getTotalLength()
    if (!totalLen) return

    /* initial hidden states */
    gsap.set(path, { strokeDasharray: totalLen, strokeDashoffset: totalLen })
    dotRefs.current.forEach((dot, i) => {
      gsap.set(dot, { scale: 0, opacity: 0 })
      if (ringRefs.current[i]) gsap.set(ringRefs.current[i], { scale: 0.5, opacity: 0 })
    })
    cardRefs.current.forEach((card, i) => {
      gsap.set(card, { x: i % 2 === 0 ? -70 : 70, opacity: 0 })
    })

    const activated   = new Array(jobs.length).fill(false)
    const impactFired = { current: false }

    /* ── Impact animation: fires once when the last node activates ── */
    const triggerImpact = () => {
      if (impactFired.current) return
      impactFired.current = true

      /* skip entirely when nav is driving the scroll */
      if (navScrolling.active) return

      /* abbreviated version for repeat visits — just flash the border line */
      if (impactEverFired) {
        const borderEl = borderLineRef.current
        if (borderEl) {
          gsap.set(borderEl, { scaleX: 0, scaleY: 1, opacity: 1, transformOrigin: 'left center' })
          gsap.to(borderEl,  { scaleX: 1, duration: 0.45, ease: 'power3.out' })
          gsap.to(borderEl,  { opacity: 0, duration: 0.35, delay: 0.45 })
        }
        return
      }
      impactEverFired = true

      const mainPath = pathRef.current
      const flashEl  = flashRef.current
      const borderEl = borderLineRef.current
      const glowEl   = glowRef.current
      const section  = sectionRef.current
      if (!mainPath) return

      const l = lenisRef.current
      if (l) l.stop()

      const tl   = gsap.timeline()
      const PEAK = 0.55   /* everything converges here */

      /* 1. All dots explode simultaneously */
      dotRefs.current.forEach((dot, i) => {
        const ring = ringRefs.current[i]
        if (!dot || !ring) return
        tl.to(dot, { scale: 2.4, duration: 0.1, ease: 'power4.out', overwrite: 'auto' }, 0)
        tl.to(dot, { scale: 1,   duration: 0.25, ease: 'elastic.out(1, 0.4)' },           0.1)
        tl.fromTo(ring,
          { scale: 0.3, opacity: 0.9 },
          { scale: 8,   opacity: 0, duration: 0.55, ease: 'expo.out', overwrite: 'auto' }, 0)
      })

      /* 2. Thread instantly flashes white then snaps back */
      tl.to(mainPath, { attr: { strokeWidth: 5, stroke: '#ffffff' }, duration: 0.06 }, 0)
      tl.to(mainPath, { attr: { strokeWidth: 1.5, stroke: 'var(--accent)' }, duration: 0.4, ease: 'power2.in' }, 0.06)

      /* 3. Section flash */
      if (flashEl) {
        tl.to(flashEl, { opacity: 0.1, duration: 0.06 }, 0)
        tl.to(flashEl, { opacity: 0,   duration: 0.35  }, 0.06)
      }

      /* 4. Bottom glow blooms and fades */
      if (glowEl) {
        tl.to(glowEl, { opacity: 1, duration: 0.18, ease: 'power3.out' }, 0)
        tl.to(glowEl, { opacity: 0, duration: 0.45, ease: 'power2.in'  }, PEAK)
      }

      /* 5. Border sweeps and blooms at peak */
      if (borderEl) {
        tl.set(borderEl, { scaleX: 0, scaleY: 1, opacity: 1, transformOrigin: 'left center' }, 0)
        tl.to(borderEl,  { scaleX: 1, duration: 0.35, ease: 'power3.out' }, 0)
        tl.to(borderEl,  { scaleY: 5, duration: 0.12, ease: 'power2.out' }, PEAK - 0.08)
        tl.to(borderEl,  { scaleY: 1, opacity: 0, duration: 0.35, ease: 'power2.in' }, PEAK + 0.05)
      }

      /* 6. Section shadow blooms */
      if (section) {
        tl.to(section, { boxShadow: '0 20px 90px -4px rgba(255,92,92,0.5)', duration: 0.2 }, 0)
        tl.to(section, { boxShadow: 'none', duration: 0.5 }, PEAK)
      }

      /* 7. Unlock scroll and launch into Projects at peak */
      tl.call(() => {
        const lenis  = lenisRef.current
        const target = document.getElementById('projects')
        if (lenis) lenis.start()
        if (!target) return
        const y = target.getBoundingClientRect().top + window.scrollY
        if (lenis) lenis.scrollTo(y, { duration: 1.4, easing: t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t })
        else       window.scrollTo({ top: y, behavior: 'smooth' })
      }, [], PEAK)
    }

    const updateThread = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return

      const rect = wrapper.getBoundingClientRect()
      const readerY = window.innerHeight * THREAD_READER_RATIO
      const pathProgress = clamp01((readerY - rect.top) / rect.height + THREAD_DRAW_LEAD)

      gsap.set(path, { strokeDashoffset: totalLen * (1 - pathProgress) })

      fracsRef.current.forEach((frac, i) => {
        const showAt = Math.max(0, frac - 0.015)
        const hideBefore = Math.max(0, frac - 0.11)

        if (pathProgress >= showAt && !activated[i]) {
          activated[i] = true
          const dot  = dotRefs.current[i]
          const ring = ringRefs.current[i]
          const card = cardRefs.current[i]
          if (!dot || !card) return

          gsap.to(dot, { scale: 1, opacity: 1, duration: 0.28, ease: 'back.out(2.8)', overwrite: 'auto' })
          if (ring) gsap.fromTo(ring,
            { scale: 0.4, opacity: 0.75 },
            { scale: 4, opacity: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' }
          )
          gsap.to(card, { x: 0, opacity: 1, duration: 0.48, delay: 0.04, ease: 'power3.out', overwrite: 'auto' })

          /* fire the impact animation when the last node activates */
          if (i === fracsRef.current.length - 1) {
            gsap.delayedCall(0.2, triggerImpact)
          }

        } else if (pathProgress < hideBefore && activated[i]) {
          activated[i] = false
          const dot  = dotRefs.current[i]
          const card = cardRefs.current[i]
          if (!dot || !card) return
          gsap.to(dot,  { scale: 0, opacity: 0, duration: 0.18, overwrite: 'auto' })
          gsap.to(card, { x: i % 2 === 0 ? -70 : 70, opacity: 0, duration: 0.22, overwrite: 'auto' })
          if (i === fracsRef.current.length - 1) impactFired.current = false
        }
      })
    }

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 95%',
      end: 'bottom 15%',
      onEnter: updateThread,
      onEnterBack: updateThread,
      onLeave: updateThread,
      onLeaveBack: updateThread,
      onUpdate: updateThread,
      onRefresh: updateThread,
    })
  }, { scope: sectionRef, dependencies: [pathD, isMobile, jobs], revertOnUpdate: true })

  /* ── Mobile ── */
  if (isMobile) return <MobileExperience jobs={jobs} sectionTitle={sectionTitle} />

  return (
    <section id="work" ref={sectionRef} style={s.section}>
      <div style={s.header}>
        <span style={s.headerLabel} data-i18n>{sectionTitle}</span>
      </div>

      <div ref={wrapperRef} style={s.wrapper}>
        {pathD && (
          <svg style={s.svg} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="exp-glow" x="-80%" y="-20%" width="260%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* faint guide path */}
            <path d={pathD} stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.08" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* animated drawn path */}
            <path
              ref={pathRef}
              d={pathD}
              stroke="var(--accent)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#exp-glow)"
            />
          </svg>
        )}

        {/* section-wide flash overlay */}
        <div ref={flashRef} style={{
          position: 'absolute', inset: 0,
          background: 'white', opacity: 0,
          pointerEvents: 'none', zIndex: 4,
        }} />

        {jobs.map((job, i) => {
          const isLeft = i % 2 === 0
          return (
            <div key={job.company} style={s.entry}>
              {/* left column */}
              <div style={s.col}>
                {isLeft && (
                  <div ref={el => (cardRefs.current[i] = el)} style={{ ...s.card, ...s.cardLeft }}>
                    <CardContent job={job} i={i} isLeft />
                  </div>
                )}
              </div>

              {/* centre node */}
              <div style={s.nodeCol}>
                <div style={s.nodeWrap}>
                  <div ref={el => (ringRefs.current[i] = el)} style={s.ring} />
                  <div ref={el => (dotRefs.current[i] = el)} style={s.dot} />
                </div>
              </div>

              {/* right column */}
              <div style={s.col}>
                {!isLeft && (
                  <div ref={el => (cardRefs.current[i] = el)} style={{ ...s.card, ...s.cardRight }}>
                    <CardContent job={job} i={i} isLeft={false} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* gradient glow rising from the bottom border at peak */}
      <div ref={glowRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '220px',
        background: 'linear-gradient(to top, rgba(230,50,50,0.55) 0%, rgba(230,50,50,0.12) 60%, transparent 100%)',
        opacity: 0, pointerEvents: 'none', zIndex: 3,
      }} />

      {/* border sweep — glowing line that races across when impact fires */}
      <div ref={borderLineRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'var(--accent)',
        boxShadow: '0 0 14px 3px var(--accent)',
        opacity: 0, pointerEvents: 'none', zIndex: 5,
        transform: 'scaleX(0)', transformOrigin: 'left center',
      }} />
    </section>
  )
}

/* ── Mobile version ── */
function MobileExperience({ jobs, sectionTitle }) {
  const ref = useRef(null)
  useGSAP(() => {
    ref.current.querySelectorAll('[data-mc]').forEach(card => {
      gsap.fromTo(card,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 86%', toggleActions: 'play none none reverse' } }
      )
    })
  }, { scope: ref, dependencies: [jobs], revertOnUpdate: true })

  return (
    <section id="work" ref={ref} style={s.section}>
      <div style={s.header}><span style={s.headerLabel} data-i18n>{sectionTitle}</span></div>
      {jobs.map((job, i) => (
        <div key={job.company} data-mc style={mob.card}>
          <div style={mob.top}>
            {job.website ? (
              <a href={job.website} target="_blank" rel="noopener noreferrer" style={mob.companyLink} data-cursor data-i18n>
                {job.company}
              </a>
            ) : (
              <span style={mob.company} data-i18n>{job.company}</span>
            )}
            <span style={mob.idx}>{String(i + 1).padStart(2, '0')}</span>
          </div>
          <h3 style={mob.role} data-i18n>{job.role}</h3>
          <div style={mob.meta}>
            <span style={mob.period} data-i18n>{job.period}</span>
            <span style={mob.dot}>·</span>
            <span style={mob.period} data-i18n>{job.type}</span>
          </div>
          <ul style={mob.bullets}>
            {job.bullets.map((b, j) => (
              <li key={j} style={mob.bullet}>
                <span style={mob.dash}>—</span>
                <span style={mob.txt} data-i18n>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

/* ─── Styles ─── */
const s = {
  section: { borderBottom: '1px solid var(--border)' },
  header: { padding: '2.5rem 6vw 2rem', borderBottom: '1px solid var(--border)' },
  headerLabel: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' },
  wrapper: { position: 'relative', padding: '4vh 0 6vh' },
  svg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' },
  entry: { display: 'grid', gridTemplateColumns: '1fr 44px 1fr', alignItems: 'center', minHeight: 'clamp(260px, 42vh, 460px)' },
  col: { display: 'flex', alignItems: 'center', padding: '2rem 0' },
  nodeCol: { display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 },
  nodeWrap: { position: 'relative', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', inset: '-8px', borderRadius: '50%', border: '1px solid var(--accent)', opacity: 0, pointerEvents: 'none' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', opacity: 0, position: 'relative', zIndex: 1, boxShadow: '0 0 8px var(--accent)' },
  card: { maxWidth: '100%' },
  cardLeft: { marginLeft: 'auto', paddingRight: 'clamp(2rem, 3.5vw, 4rem)', paddingLeft: 0 },
  cardRight: { marginRight: 'auto', paddingLeft: 'clamp(2rem, 3.5vw, 4rem)', paddingRight: 0 },
}

const cs = {
  top: { display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.75rem' },
  company: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 3.5vw, 54px)', color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' },
  companyLink: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 3.5vw, 54px)', color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em', textDecoration: 'none', cursor: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' },
  idx: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  role: { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(14px, 1.4vw, 20px)', color: 'var(--fg)', marginBottom: '0.5rem' },
  meta: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' },
  period: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  metaDot: { color: 'var(--faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' },
  bullets: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  bullet: { display: 'flex', gap: '0.75rem', maxWidth: '340px' },
  dash: { color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.65, flexShrink: 0 },
  bText: { fontFamily: 'var(--font-display)', fontSize: 'clamp(12px, 0.95vw, 14px)', color: 'var(--muted)', lineHeight: 1.65 },
}

const mob = {
  card: { padding: '2.5rem 6vw', borderBottom: '1px solid var(--border)' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  company: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 7vw, 48px)', color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' },
  companyLink: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 7vw, 48px)', color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em', textDecoration: 'none', cursor: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' },
  idx: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', paddingTop: '6px' },
  role: { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(14px, 4vw, 19px)', color: 'var(--fg)', marginBottom: '0.5rem' },
  meta: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  period: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  dot: { color: 'var(--faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' },
  bullets: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  bullet: { display: 'flex', gap: '0.75rem' },
  dash: { color: 'var(--accent)', fontFamily: 'var(--font-mono)', lineHeight: 1.65, flexShrink: 0 },
  txt: { fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65 },
}
