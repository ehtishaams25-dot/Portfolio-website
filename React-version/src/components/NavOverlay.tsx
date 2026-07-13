import { X } from 'lucide-react'
import { navItems } from '../data/portfolio'

type NavOverlayProps = {
  open: boolean
  onClose: () => void
}

export function NavOverlay({ open, onClose }: NavOverlayProps) {
  return (
    <nav
      className={`fixed inset-0 z-50 grid place-items-center bg-forest text-beige transition duration-500 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-label="Primary navigation"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="ds-icon-button absolute right-edge top-8"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <X size={22} />
      </button>
      <ul className="space-y-4 text-center font-serif text-[clamp(3.8rem,12vw,10rem)] leading-[0.82]">
        {navItems.map((item, index) => (
          <li
            key={item.href}
            className={`transition duration-700 ${
              open ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-6 opacity-0 blur-sm'
            }`}
            style={{ transitionDelay: `${open ? 120 + index * 80 : 0}ms` }}
          >
            <a
              href={item.href}
              className="block hover:text-gold"
              onClick={onClose}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
