import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null)
  const wordRefs = useRef([])
  const lineRef = useRef(null)

  useGSAP(() => {
    document.body.style.overflow = 'hidden'

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = ''
        onComplete()
      },
    })

    tl.fromTo(
      wordRefs.current,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power3.out',
      }
    )
      .fromTo(
        lineRef.current,
        { scaleX: 0, opacity: 0, transformOrigin: 'center center' },
        { scaleX: 1, opacity: 1, duration: 0.42, ease: 'power3.inOut' },
        '-=0.2'
      )
      .to(wordRefs.current, {
        y: -6,
        duration: 0.28,
        ease: 'power2.inOut',
      }, '+=0.12')
      .to(loaderRef.current, { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, '-=0.05')
      .set(loaderRef.current, { display: 'none' })
  }, [])

  return (
    <div ref={loaderRef} style={styles.loader} aria-hidden="true">
      <div style={styles.inner} className="loader-inner">
        <span ref={(el) => (wordRefs.current[0] = el)} style={styles.word}>GERMAN</span>
        <span ref={(el) => (wordRefs.current[1] = el)} style={styles.word}>VINOKUROV</span>
        <span ref={lineRef} style={styles.line} />
      </div>
      <style>{loaderCSS}</style>
    </div>
  )
}

const loaderCSS = `
  @media (max-width: 560px) {
    .loader-inner {
      flex-direction: column !important;
      gap: 0.2rem !important;
      text-align: center;
    }
  }
`

const styles = {
  loader: {
    position: 'fixed',
    inset: 0,
    background: '#080808',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(0.6rem, 1.4vw, 1.4rem)',
    position: 'relative',
  },
  word: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(48px, 8vw, 120px)',
    color: 'var(--fg)',
    lineHeight: 0.95,
    display: 'block',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '-0.7rem',
    height: '1px',
    background: 'var(--accent)',
    opacity: 0,
  },
}
