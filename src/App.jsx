import { useEffect, useRef } from 'react'
import CharacterCanvas from './CharacterCanvas'
import './index.css'

export default function App() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const lastFrameTime = useRef(0)
  const rafRef = useRef(null)

  // Custom cursor animation loop
  useEffect(() => {
    function onMove(e) {
      if (e.pointerType === 'touch') return
      mousePos.current = { x: e.clientX, y: e.clientY }
      dotRef.current?.classList.add('is-visible')
      ringRef.current?.classList.add('is-visible')
    }
    function onPointerOver(e) {
      const interactive = e.target instanceof Element && e.target.closest('a, button')
      ringRef.current?.classList.toggle('is-hovering', Boolean(interactive))
    }
    function onPointerOut(e) {
      const nextInteractive = e.relatedTarget instanceof Element && e.relatedTarget.closest('a, button')
      ringRef.current?.classList.toggle('is-hovering', Boolean(nextInteractive))
    }
    function onWindowLeave(e) {
      if (!e.relatedTarget) {
        dotRef.current?.classList.remove('is-visible')
        ringRef.current?.classList.remove('is-visible', 'is-hovering')
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onWindowLeave)
    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointerout', onPointerOut)

    function animateCursor(timestamp) {
      const elapsed = lastFrameTime.current ? timestamp - lastFrameTime.current : 16.67
      lastFrameTime.current = timestamp
      const follow = 1 - Math.exp(-elapsed / 90)

      const dot = dotRef.current
      if (dot) {
        dot.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`
      }

      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * follow
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * follow
      const ring = ringRef.current
      if (ring) {
        ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`
      }

      rafRef.current = requestAnimationFrame(animateCursor)
    }
    rafRef.current = requestAnimationFrame(animateCursor)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onWindowLeave)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      {/* Custom cursor */}
      <div ref={dotRef} className="cursor-dot" id="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" id="cursor-ring" />

      <main>
        <section className="hero" id="hero" aria-label="Hero section">
          <div className="hero-character" id="hero-character" aria-hidden="true">
            <CharacterCanvas />
          </div>

          <nav className="hero-nav" id="hero-nav" aria-label="Main navigation">
            <ul className="nav-links" role="list">
              <li><a href="#work" id="nav-work">Work</a></li>
              <li><a href="#about" id="nav-about">About</a></li>
              <li><a href="#contact" id="nav-contact">Contact</a></li>
            </ul>
          </nav>

          <div className="hero-inner">
            <div className="hero-text" id="hero-text">
              <p className="hero-label" id="hero-label">Hi, I'm</p>
              <h1 className="hero-title" id="hero-title">
                <span className="title-line">Nandhana</span>
              </h1>
              <p className="hero-subtitle" id="hero-subtitle">
                I build thoughtful digital experiences, from polished interfaces
                to reliable systems behind the scenes. Full stack, end to end.
              </p>
              <div className="hero-cta" id="hero-cta">
                <a href="/resume.pdf" download className="btn-primary" id="btn-resume">
                  Resume
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </a>
                <a href="#contact" className="btn-secondary" id="btn-contact">
                  Let's Talk
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
