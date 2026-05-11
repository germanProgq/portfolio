import { useRef, useLayoutEffect, useState, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience } from '../data/content'
import { useIsMobile } from '../hooks/useIsMobile'

const clamp01 = gsap.utils.clamp(0, 1)
const THREAD_READER_RATIO = 0.68
const THREAD_DRAW_LEAD = 0.075

/* Build an organic bezier path through measured dot centres */
function buildPath(pts, cx, totalH) {
  if (!pts.length) return ''
  const warp = Math.min(cx * 0.08, 48)
  let d = `M ${cx} 0`
  d += ` C ${cx + warp} ${pts[0].y * 0.28},${cx - warp} ${pts[0].y * 0.72},${cx} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    const h = b.y - a.y
    const s = i % 2 === 0 ? 1 : -1
    d += ` C ${cx + s * warp} ${a.y + h * 0.32},${cx - s * warp} ${b.y - h * 0.32},${cx} ${b.y}`
  }
  d += ` L ${cx} ${totalH}`
  return d
}

function CardContent({ job, i, isLeft }) {
  const flip = isLeft ? 'row-reverse' : 'row'
  const align = isLeft ? 'flex-end' : 'flex-start'
  const ta = isLeft ? 'right' : 'left'
  return (
    <>
      <div style={{ ...cs.top, flexDirection: flip }}>
        <span style={cs.company}>{job.company}</span>
        <span style={cs.idx}>{String(i + 1).padStart(2, '0')}</span>
      </div>
      <h3 style={{ ...cs.role, textAlign: ta }}>{job.role}</h3>
      <div style={{ ...cs.meta, flexDirection: flip, justifyContent: align }}>
        <span style={cs.period}>{job.period}</span>
        <span style={cs.metaDot}>·</span>
        <span style={cs.period}>{job.type}</span>
      </div>
      <ul style={{ ...cs.bullets, alignItems: align }}>
        {job.bullets.map((b, j) => (
          <li key={j} style={{ ...cs.bullet, flexDirection: flip }}>
            <span style={cs.dash}>—</span>
            <span style={cs.bText}>{b}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Experience() {
  const sectionRef = useRef(null)
  const wrapperRef = useRef(null)
  const pathRef    = useRef(null)
  const dotRefs    = useRef([])
  const ringRefs   = useRef([])
  const cardRefs   = useRef([])
  const fracsRef   = useRef([])
  const isMobile   = useIsMobile()
  const [pathD, setPathD] = useState(null)

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

    const activated = new Array(experience.length).fill(false)

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

        } else if (pathProgress < hideBefore && activated[i]) {
          activated[i] = false
          const dot  = dotRefs.current[i]
          const card = cardRefs.current[i]
          if (!dot || !card) return
          gsap.to(dot,  { scale: 0, opacity: 0, duration: 0.18, overwrite: 'auto' })
          gsap.to(card, { x: i % 2 === 0 ? -70 : 70, opacity: 0, duration: 0.22, overwrite: 'auto' })
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
  }, { scope: sectionRef, dependencies: [pathD, isMobile], revertOnUpdate: true })

  /* ── Mobile ── */
  if (isMobile) return <MobileExperience />

  return (
    <section id="work" ref={sectionRef} style={s.section}>
      <div style={s.header}>
        <span style={s.headerLabel}>EXPERIENCE</span>
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
            <path d={pathD} stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.08" fill="none" />
            {/* animated drawn path */}
            <path
              ref={pathRef}
              d={pathD}
              stroke="var(--accent)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              filter="url(#exp-glow)"
            />
          </svg>
        )}

        {experience.map((job, i) => {
          const isLeft = i % 2 === 0
          return (
            <div key={i} style={s.entry}>
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
    </section>
  )
}

/* ── Mobile version ── */
function MobileExperience() {
  const ref = useRef(null)
  useGSAP(() => {
    ref.current.querySelectorAll('[data-mc]').forEach(card => {
      gsap.fromTo(card,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 86%', toggleActions: 'play none none reverse' } }
      )
    })
  }, { scope: ref })

  return (
    <section id="work" ref={ref} style={s.section}>
      <div style={s.header}><span style={s.headerLabel}>EXPERIENCE</span></div>
      {experience.map((job, i) => (
        <div key={i} data-mc style={mob.card}>
          <div style={mob.top}>
            <span style={mob.company}>{job.company}</span>
            <span style={mob.idx}>{String(i + 1).padStart(2, '0')}</span>
          </div>
          <h3 style={mob.role}>{job.role}</h3>
          <div style={mob.meta}>
            <span style={mob.period}>{job.period}</span>
            <span style={mob.dot}>·</span>
            <span style={mob.period}>{job.type}</span>
          </div>
          <ul style={mob.bullets}>
            {job.bullets.map((b, j) => (
              <li key={j} style={mob.bullet}>
                <span style={mob.dash}>—</span>
                <span style={mob.txt}>{b}</span>
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
