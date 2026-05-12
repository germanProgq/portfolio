import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { flushSync } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { contentEn, contentRu } from '../data/content'
import { navScrolling } from '../utils/navScrolling'
import { captureScrollPosition, resolveScrollY, saveScrollPosition } from '../utils/scrollMemory'

const LanguageContext = createContext(null)

const TEXT_SELECTOR = '[data-i18n]'
const LANGUAGE_STORAGE_KEY = 'portfolio:language'
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&+-/<>'
const GLITCH_TEXT_SELECTOR = '.hero-name, .project-title, h1, h2, h3, .nav-item-btn, .nav-overlay button'
const MAX_ANIMATED_TEXT_NODES = 44
const MAX_SCRAMBLE_TARGETS = 7
const TEXT_NODE = 3

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return stored === 'ru' || stored === 'en' ? stored : 'en'
  } catch {
    return 'en'
  }
}

function getTextNodes() {
  return gsap.utils
    .toArray(TEXT_SELECTOR)
    .filter((el) => {
      if (el.matches('[data-word]')) return false
      if (!el.isConnected || el.getClientRects().length === 0) return false
      const rect = el.getBoundingClientRect()
      return rect.bottom > -80 && rect.top < window.innerHeight + 80
    })
    .slice(0, MAX_ANIMATED_TEXT_NODES)
}

function canScrambleText(el) {
  return el.childNodes.length === 1 && el.firstChild?.nodeType === TEXT_NODE
}

function pickScrambleTargets(elements) {
  const candidates = elements
    .filter((el) => canScrambleText(el) && el.textContent.trim().length > 0)
    .filter((el) => el.textContent.length <= 80)
    .filter((el) => el.matches(GLITCH_TEXT_SELECTOR) || el.closest('nav'))

  return candidates
    .sort((a, b) => {
      const aHero = a.classList.contains('hero-name') ? 0 : 1
      const bHero = b.classList.contains('hero-name') ? 0 : 1
      if (aHero !== bHero) return aHero - bHero
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top
    })
    .slice(0, MAX_SCRAMBLE_TARGETS)
}

function randomScrambleChar(index, frame) {
  const seed = Math.sin((index + 1) * 91.13 + frame * 17.71) * 10000
  const charIndex = Math.abs(Math.floor(seed)) % SCRAMBLE_CHARS.length
  return SCRAMBLE_CHARS[charIndex]
}

function buildScrambledText(text, progress, frame) {
  const chars = Array.from(text)
  const revealCount = Math.floor(chars.length * progress)

  return chars
    .map((char, index) => {
      if (char.trim() === '') return char
      if (index < revealCount) return char
      return randomScrambleChar(index, frame)
    })
    .join('')
}

function scrambleTextElements(elements, onComplete) {
  const targets = elements
    .filter(canScrambleText)
    .map((el) => ({ el, text: el.textContent || '' }))
    .filter(({ text }) => text.length > 0)

  if (!targets.length) {
    onComplete()
    return
  }

  let frame = 0
  const state = { progress: 0 }

  gsap.to(state, {
    progress: 1,
    duration: 0.42,
    ease: 'power1.out',
    onUpdate() {
      frame += 1
      targets.forEach(({ el, text }) => {
        el.textContent = buildScrambledText(text, state.progress, frame)
      })
    },
    onComplete() {
      targets.forEach(({ el, text }) => {
        el.textContent = text
      })
      onComplete()
    },
  })
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage)
  const busyRef     = useRef(false)
  const lenis = useLenis()

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch {
      /* storage can be unavailable in private or restricted contexts */
    }
  }, [lang])

  const switchLanguage = useCallback((targetLang) => {
    if (busyRef.current || targetLang === lang) return
    busyRef.current = true

    const preservedPosition = captureScrollPosition()
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const restorePreservedPosition = () => {
      ScrollTrigger.refresh()
      const targetY = resolveScrollY(preservedPosition)

      navScrolling.active = true
      if (lenis) {
        lenis.scrollTo(targetY, { immediate: true, force: true })
      } else {
        window.scrollTo(0, targetY)
      }
    }

    const commitLanguage = () => {
      navScrolling.active = true
      flushSync(() => setLang(targetLang))
      restorePreservedPosition()
    }

    const finish = () => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        navScrolling.active = false
        saveScrollPosition()
        busyRef.current = false
      })
    }

    if (reduceMotion) {
      commitLanguage()
      finish()
      return
    }

    const outgoingText = getTextNodes()
    gsap.killTweensOf(outgoingText)

    if (!outgoingText.length) {
      commitLanguage()
      finish()
      return
    }

    gsap.set(outgoingText, {
      willChange: 'transform, opacity, text-shadow',
      transformOrigin: 'center center',
    })

    gsap.to(outgoingText, {
      opacity: 0.42,
      x: () => gsap.utils.random(-2, 2, 1),
      y: () => gsap.utils.random(-1, 1, 1),
      textShadow: '1px 0 rgba(255,92,92,0.45), -1px 0 rgba(255,255,255,0.22)',
      duration: 0.08,
      ease: 'steps(1)',
      stagger: { each: 0.0015, from: 'start' },
      onComplete() {
        commitLanguage()
        requestAnimationFrame(() => {
          const incomingText = getTextNodes()
          gsap.killTweensOf(incomingText)
          if (!incomingText.length) {
            gsap.set(outgoingText, { clearProps: 'opacity,transform,textShadow,willChange,transformOrigin' })
            finish()
            return
          }

          const scrambleTargets = pickScrambleTargets(incomingText)
          const scrambleSet = new Set(scrambleTargets)
          const passiveTargets = incomingText.filter((el) => !scrambleSet.has(el))

          gsap.set(incomingText, {
            willChange: 'transform, opacity, text-shadow',
            transformOrigin: 'center center',
          })

          if (scrambleTargets.length) {
            gsap.set(scrambleTargets, {
              opacity: 0.82,
              x: () => gsap.utils.random(-2, 2, 1),
              y: () => gsap.utils.random(-1, 1, 1),
              textShadow: '1px 0 rgba(255,92,92,0.5), -1px 0 rgba(255,255,255,0.18)',
            })
          }

          if (passiveTargets.length) {
            gsap.fromTo(
              passiveTargets,
              { opacity: 0.55, y: 2 },
              { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
            )
          }

          if (!scrambleTargets.length) {
            gsap.to(incomingText, {
              opacity: 1,
              x: 0,
              y: 0,
              textShadow: '0px 0 rgba(255,92,92,0)',
              duration: 0.22,
              ease: 'power2.out',
              onComplete() {
                gsap.set(incomingText, { clearProps: 'opacity,transform,textShadow,willChange,transformOrigin' })
                finish()
              },
            })
            return
          }

          scrambleTextElements(scrambleTargets, () => {
            gsap.to(incomingText, {
              opacity: 1,
              x: 0,
              y: 0,
              textShadow: '0px 0 rgba(255,92,92,0)',
              duration: 0.16,
              ease: 'power2.out',
              onComplete() {
                gsap.set(incomingText, { clearProps: 'opacity,transform,textShadow,willChange,transformOrigin' })
                finish()
              },
            })
          })
        })
      },
    })
  }, [lang, lenis])

  const content = useMemo(
    () => (lang === 'ru' ? contentRu : contentEn),
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, content }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
