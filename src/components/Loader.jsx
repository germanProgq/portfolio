import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null)
  const gRef = useRef(null)
  const vRef = useRef(null)
  const nameRef = useRef(null)

  useGSAP(() => {
    document.body.style.overflow = 'hidden'

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = ''
        onComplete()
      },
    })

    tl.fromTo(
      gRef.current,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.18, ease: 'power3.out' }
    )
      .fromTo(
        vRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.18, ease: 'power3.out' },
        '<'
      )
      .to({}, { duration: 0.05 })
      .fromTo(
        nameRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.24, ease: 'power3.inOut' }
      )
      .to({}, { duration: 0.08 })
      .to(loaderRef.current, { opacity: 0, duration: 0.18, ease: 'power2.in' })
      .set(loaderRef.current, { display: 'none' })
  }, [])

  return (
    <div ref={loaderRef} style={styles.loader} aria-hidden="true">
      <div style={styles.inner}>
        <span ref={gRef} style={styles.initial}>G</span>
        <span ref={nameRef} style={styles.name}>ERMAN VINOKURO</span>
        <span ref={vRef} style={styles.initial}>V</span>
      </div>
    </div>
  )
}

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
  },
  initial: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(48px, 8vw, 120px)',
    color: 'var(--fg)',
    lineHeight: 1,
    display: 'block',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(48px, 8vw, 120px)',
    color: 'var(--fg)',
    lineHeight: 1,
    display: 'block',
    overflow: 'hidden',
    clipPath: 'inset(0 100% 0 0)',
    whiteSpace: 'nowrap',
  },
}
