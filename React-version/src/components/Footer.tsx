import type { CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { socialLinks } from '../data/portfolio'

export function Footer() {
  return (
    <footer id="footer-section" className="relative overflow-hidden bg-beige text-forest">
      <div className="ds-shell grid min-h-[78vh] items-center gap-12 py-20 md:grid-cols-[1fr_0.9fr]">
        <div className="reveal">
          <a
            href="https://linktr.ee/itsehtishaam?fbclid=PAZXh0bgNhZW0CMTEAAac7ITp6QJvKr_db3X_zHxD3NiupPpwaHWvsWE6ZXeXU9CYzmatlqbuchrD1YA_aem_G0jVG31NhYcO86Sxbz9ghw"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-start gap-5 font-serif text-[clamp(5rem,14vw,13rem)] leading-[0.82] hover:text-gold"
          >
            let's talk
            <ArrowUpRight className="mt-5 h-10 w-10 md:h-16 md:w-16" strokeWidth={1.4} />
          </a>
        </div>
        <div className="reveal relative mx-auto aspect-square w-full max-w-md rounded-full border border-forest/25">
          {socialLinks.map((link, index) => {
            const sizeClass = link.size === 'large' ? 'text-2xl' : link.size === 'medium' ? 'text-xl' : 'text-sm'
            const style = {
              '--angle': `${index * (360 / socialLinks.length)}deg`,
              '--orbit': 'clamp(6rem, 17vw, 10rem)',
            } as CSSProperties

            return (
              <a
                key={link.text}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={`footer-word font-serif ${sizeClass} hover:text-gold`}
                style={style}
              >
                {link.text}
              </a>
            )
          })}
          <div className="absolute inset-[34%] rounded-full border border-gold/60" />
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-[-1.5vw] left-0 right-0 flex justify-center overflow-hidden font-serif text-[20vw] leading-none text-forest/12">
        {'ehtishaam'.split('').map((letter, index) => (
          <span key={`${letter}-${index}`} className="footer-name-letter inline-block">
            {letter}
          </span>
        ))}
      </div>
    </footer>
  )
}
