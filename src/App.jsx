import { useEffect, useRef, useState } from 'react'
import CharacterCanvas from './CharacterCanvas'
import './index.css'

const projects = [
  {
    number: '01',
    name: 'A portfolio with a pulse',
    type: 'Interactive portfolio · Built project',
    description: 'A full-screen portfolio experiment pairing a cursor-responsive portrait with a quiet, editorial interface.',
    image: '/frames/center.webp',
    alt: 'Portrait used in the interactive portfolio experience',
    tone: 'project-red',
    tags: ['React', 'Canvas', 'Interaction'],
    detail: 'This portfolio is an exploration of how a personal site can feel present without getting in the way. A set of pre-rendered portrait frames tracks pointer direction, while the layout keeps the introduction direct and the work easy to reach.',
    href: 'https://github.com/Nandhana2255/Port_folio',
  },
  {
    number: '02',
    name: 'Daylight, in balance',
    type: 'Wellness dashboard · Concept study',
    description: 'A calmer way to notice patterns in daily movement, rest, and energy.',
    demo: 'wellness',
    tone: 'project-green',
    tags: ['Product UI', 'Responsive', 'Data viz'],
    detail: 'A self-initiated interface study focused on making personal wellness data feel encouraging instead of clinical. The concept explores a simple daily overview, readable trends, and small, low-pressure actions.',
  },
  {
    number: '03',
    name: 'Good things, gathered',
    type: 'Independent storefront · Concept study',
    description: 'A considered shopping experience for small-batch objects and makers.',
    demo: 'storefront',
    tone: 'project-blue',
    tags: ['E-commerce', 'Frontend', 'Art direction'],
    detail: 'A self-initiated storefront concept exploring clear product storytelling, a lightweight catalogue, and a warm editorial rhythm that keeps the objects at the center.',
  },
]

const skills = [
  { name: 'Frontend', items: 'React · JavaScript · HTML & CSS' },
  { name: 'Backend', items: 'APIs · Data modeling · Integration' },
  { name: 'Practice', items: 'Responsive UI · Accessibility · Prototyping' },
]
const CURRENT_YEAR = new Date().getFullYear()

export default function App() {
  const [activeProject, setActiveProject] = useState(null)
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

  useEffect(() => {
    if (!activeProject) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setActiveProject(null)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [activeProject])

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
              <li><a href="#services" id="nav-services">Services</a></li>
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
                <a href="#work" className="btn-primary" id="btn-resume">
                  Explore work
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

        <section className="work-section page-section" id="work" aria-labelledby="work-title">
          <div className="section-shell">
            <div className="section-heading work-heading">
              <div>
                <p className="eyebrow">A few things I’ve been making</p>
                <h2 id="work-title">Selected work<span className="heading-period">.</span></h2>
              </div>
              <p className="section-intro">One shipped personal project, alongside a couple of ideas explored for the joy of making them.</p>
            </div>

            <div className="project-grid">
              {projects.map(project => (
                <article className={`project-card ${project.tone}`} key={project.number}>
                  <button
                    className="project-open"
                    type="button"
                    onClick={() => setActiveProject(project)}
                    aria-label={`Open details for ${project.name}`}
                  >
                    <span className="project-image-wrap">
                      {project.image ? (
                        <img className="project-image" src={project.image} alt={project.alt} loading="lazy" />
                      ) : (
                        <span className={`project-demo ${project.demo}`} aria-hidden="true">
                          {project.demo === 'wellness' ? (
                            <span className="wellness-screen">
                              <span className="demo-topline"><strong>daylight</strong><span>MON, 16 JUNE</span></span>
                              <span className="wellness-greeting">A little more in <em>balance.</em></span>
                              <span className="wellness-summary"><span>YOUR WEEK</span><strong>Looking steady</strong><span>Small steps are adding up.</span></span>
                              <span className="wellness-chart" aria-hidden="true">
                                {[42, 66, 52, 83, 61, 94, 72].map((height, index) => (
                                  <span className="wellness-bar" style={{ '--bar-height': `${height}%` }} key={index} />
                                ))}
                              </span>
                              <span className="wellness-days">M&nbsp;&nbsp; T&nbsp;&nbsp; W&nbsp;&nbsp; T&nbsp;&nbsp; F&nbsp;&nbsp; S&nbsp;&nbsp; S</span>
                            </span>
                          ) : (
                            <span className="storefront-screen">
                              <span className="storefront-topline"><strong>good things</strong><span>OBJECTS WITH A STORY</span></span>
                              <span className="storefront-title">Made slowly.<br /><em>Kept forever.</em></span>
                              <span className="storefront-products">
                                <span className="store-product"><span className="product-shape vessel" /><small>Stoneware No. 04</small></span>
                                <span className="store-product"><span className="product-shape lamp" /><small>Folded light</small></span>
                                <span className="store-product"><span className="product-shape textile" /><small>Sunday weave</small></span>
                              </span>
                            </span>
                          )}
                        </span>
                      )}
                      <span className="project-number">{project.number}</span>
                      <span className="project-open-icon" aria-hidden="true">↗</span>
                    </span>
                    <span className="project-meta">
                      <span className="project-type">{project.type}</span>
                      <span className="project-name">{project.name}</span>
                      <span className="project-description">{project.description}</span>
                    </span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section page-section" id="about" aria-labelledby="about-title">
          <div className="section-shell about-layout">
            <div className="about-image-frame">
              <img src="/frames/center.webp" alt="Nandhana, creative full stack developer" loading="lazy" />
              <span className="about-image-caption">Curious by nature. Builder by practice.</span>
            </div>
            <div className="about-copy">
              <p className="eyebrow">A little about me</p>
              <h2 id="about-title">Good work lives<br />between <em>ideas</em> and details.</h2>
              <p className="about-lede">I’m Nandhana, a full stack developer who cares about how a product feels as much as how it works.</p>
              <p className="about-body">I enjoy taking a rough idea, finding its clearest shape, and building the experience around it. I’m happiest where thoughtful interface work meets practical engineering: the small decisions that make digital tools feel natural to use.</p>
              <div className="skill-list" aria-label="Skills and areas of practice">
                {skills.map((skill, index) => (
                  <div className="skill-row" key={skill.name}>
                    <span className="skill-index">0{index + 1}</span>
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-items">{skill.items}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="services-section page-section" id="services" aria-labelledby="services-title">
          <div className="section-shell">
            <div className="section-heading services-heading">
              <div>
                <p className="eyebrow">How I can contribute</p>
                <h2 id="services-title">From first sketch<br />to finished product.</h2>
              </div>
              <p className="section-intro">A flexible toolkit for turning a useful idea into a polished, working experience.</p>
            </div>
            <div className="service-list">
              <article className="service-row">
                <span className="service-number">01</span>
                <h3>Frontend development</h3>
                <p>Responsive interfaces with clear structure, considered motion, and attention to accessibility.</p>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
              <article className="service-row">
                <span className="service-number">02</span>
                <h3>Full stack features</h3>
                <p>Connecting the interface to reliable APIs and data flows, from the first request to the final state.</p>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
              <article className="service-row">
                <span className="service-number">03</span>
                <h3>Design-to-code</h3>
                <p>Turning visual direction into maintainable components without losing the details that make it distinct.</p>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
            </div>
          </div>
        </section>

        <section className="contact-section page-section" id="contact" aria-labelledby="contact-title">
          <div className="section-shell contact-layout">
            <div>
              <p className="eyebrow">Have something in mind?</p>
              <h2 id="contact-title">Let’s make<br /><em>it matter.</em></h2>
            </div>
            <div className="contact-aside">
              <p>I’m always glad to meet thoughtful people and hear about interesting work. Start a conversation or explore what I’m building.</p>
              <a className="contact-link" href="https://github.com/Nandhana2255/Port_folio/issues/new" target="_blank" rel="noreferrer">
                Start a conversation <span aria-hidden="true">↗</span>
              </a>
              <a className="github-link" href="https://github.com/Nandhana2255" target="_blank" rel="noreferrer">
                GitHub profile <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <footer className="site-footer section-shell">
            <a className="footer-mark" href="#hero" aria-label="Back to top">N<span>.</span></a>
            <span>Designed and built with intention.</span>
            <span>© {CURRENT_YEAR} Nandhana</span>
          </footer>
        </section>
      </main>

      {activeProject && (
        <div
          className="project-dialog-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setActiveProject(null)
          }}
        >
          <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <button className="dialog-close" type="button" onClick={() => setActiveProject(null)} aria-label="Close project details">×</button>
            <p className="eyebrow">{activeProject.type}</p>
            <h2 id="dialog-title">{activeProject.name}</h2>
            <p>{activeProject.detail}</p>
            <div className="dialog-tags">
              {activeProject.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>
            {activeProject.href && (
              <a className="dialog-project-link" href={activeProject.href} target="_blank" rel="noreferrer">
                View source on GitHub <span aria-hidden="true">↗</span>
              </a>
            )}
          </section>
        </div>
      )}
    </>
  )
}
