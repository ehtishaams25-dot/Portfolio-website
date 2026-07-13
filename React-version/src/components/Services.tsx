import { Clapperboard, Image, Settings2, Sparkles } from 'lucide-react'
import { services } from '../data/portfolio'

const icons = [Clapperboard, Sparkles, Image, Settings2]

export function Services() {
  return (
    <section id="services" className="ds-section bg-beige text-forest">
      <div className="ds-shell">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = icons[index]
            return (
              <article
                key={service.title}
                className="reveal rounded-card bg-forest p-6 text-beige transition duration-300 hover:-translate-y-2 hover:outline hover:outline-1 hover:outline-gold"
              >
                <div className="mb-12 text-gold">
                  <Icon size={34} strokeWidth={1.5} />
                </div>
                <h3 className="mb-4 font-serif text-4xl leading-none">{service.title}</h3>
                <p className="text-sm font-light leading-7 text-beige/76">{service.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
