import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'

import { LanguageProvider } from './context/LanguageContext'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import ParticleField from './components/ParticleField'
import Hero from './components/Hero'
import Manifesto from './components/Manifesto'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Stack from './components/Stack'
import Numbers from './components/Numbers'
import Contact from './components/Contact'
import { navScrolling } from './utils/navScrolling'
import { readSavedScrollPosition, resolveScrollY, saveScrollPosition } from './utils/scrollMemory'

function AppInner() {
  const [loaded, setLoaded] = useState(false)
  const lenis = useLenis()
  const restoredRef = useRef(false)

  useEffect(() => {
    if (!lenis) return
    let saveFrame = 0

    const queueScrollSave = () => {
      if (saveFrame) return
      saveFrame = requestAnimationFrame(() => {
        saveFrame = 0
        saveScrollPosition()
      })
    }

    const onScroll = () => {
      ScrollTrigger.update()
      if (restoredRef.current) queueScrollSave()
    }

    const saveBeforeLeaving = () => {
      if (restoredRef.current) saveScrollPosition()
    }
    const saveWhenHidden = () => {
      if (document.visibilityState === 'hidden' && restoredRef.current) saveScrollPosition()
    }

    const ticker = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', onScroll)
    window.addEventListener('pagehide', saveBeforeLeaving)
    document.addEventListener('visibilitychange', saveWhenHidden)
    gsap.ticker.add(ticker)
    return () => {
      cancelAnimationFrame(saveFrame)
      lenis.off('scroll', onScroll)
      window.removeEventListener('pagehide', saveBeforeLeaving)
      document.removeEventListener('visibilitychange', saveWhenHidden)
      gsap.ticker.remove(ticker)
    }
  }, [lenis])

  const handleLoaderComplete = () => {
    setLoaded(true)
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()

      if (restoredRef.current) return
      restoredRef.current = true

      const savedPosition = readSavedScrollPosition()
      const savedY = resolveScrollY(savedPosition)
      if (savedY <= 0) return

      navScrolling.active = true

      const restoreNow = () => {
        const targetY = resolveScrollY(savedPosition)
        if (lenis) {
          lenis.scrollTo(targetY, { immediate: true, force: true })
        } else {
          window.scrollTo(0, targetY)
        }
      }

      restoreNow()
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        restoreNow()
        requestAnimationFrame(() => {
          navScrolling.active = false
          saveScrollPosition()
        })
      })
    })
  }

  return (
    <>
      <ParticleField />
      <Cursor />
      <Loader onComplete={handleLoaderComplete} />
      <Nav visible={loaded} />

      <main aria-busy={!loaded} style={{ position: 'relative', zIndex: 1 }}>
        <Hero active={loaded} />
        <Manifesto />
        <Experience />
        <Projects />
        <Stack />
        <Numbers />
        <Contact />
      </main>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
