import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactLenis } from 'lenis/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './styles/global.css'
import './styles/responsive.css'
import App from './App'

gsap.registerPlugin(ScrollTrigger)
gsap.ticker.lagSmoothing(0)

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

function Root() {
  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        lerp: 0.1,
        duration: 1.2,
        syncTouch: false,
      }}
    >
      <App />
    </ReactLenis>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
