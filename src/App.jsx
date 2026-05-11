import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'

import Loader from './components/Loader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Manifesto from './components/Manifesto'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Stack from './components/Stack'
import Numbers from './components/Numbers'
import Contact from './components/Contact'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    const onScroll = () => ScrollTrigger.update()
    const ticker = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', onScroll)
    gsap.ticker.add(ticker)
    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(ticker)
    }
  }, [lenis])

  const handleLoaderComplete = () => {
    setLoaded(true)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  return (
    <>
      <Cursor />
      <Loader onComplete={handleLoaderComplete} />
      <Nav visible={loaded} />

      <main aria-busy={!loaded}>
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
