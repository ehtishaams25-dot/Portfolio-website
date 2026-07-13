import { useState } from 'react'
import { Menu, RotateCcw } from 'lucide-react'
import { HeroScene } from './HeroScene'
import { NavOverlay } from './NavOverlay'

export function Hero() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <section id="hero" className="hero-noise relative min-h-screen overflow-hidden bg-void text-beige">
      <HeroScene />
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-edge py-8">
        <button
          type="button"
          className="pointer-events-auto inline-flex items-center gap-2 font-serif text-2xl text-beige hover:text-gold"
          onClick={() => window.location.reload()}
        >
          <RotateCcw size={18} />
          ES
        </button>
        <button
          type="button"
          className="pointer-events-auto ds-icon-button"
          onClick={() => setNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
      </header>
      <p className="pointer-events-none absolute bottom-8 right-edge z-20 max-w-56 border-l-2 border-gold pl-4 text-sm font-light uppercase leading-6 tracking-[0.16em] text-beige/70">
        Move through the rings. Dodge the clutter. Keep the edit clean.
      </p>
      <NavOverlay open={navOpen} onClose={() => setNavOpen(false)} />
    </section>
  )
}
