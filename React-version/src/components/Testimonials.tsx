import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { testimonials } from '../data/portfolio'
import { SectionHeading } from './SectionHeading'

export function Testimonials() {
  const [active, setActive] = useState(0)

  const move = (direction: number) => {
    setActive((current) => (current + direction + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="ds-section bg-void text-beige">
      <div className="ds-shell">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading kicker="Testimonials" title="people I have built with" tone="light" />
          <div className="reveal flex gap-3">
            <button type="button" className="ds-icon-button" onClick={() => move(-1)} aria-label="Previous testimonial">
              <ChevronLeft size={22} />
            </button>
            <button type="button" className="ds-icon-button" onClick={() => move(1)} aria-label="Next testimonial">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
        <div className="reveal overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {testimonials.map((item) => (
              <article key={item.name} className="w-full shrink-0 pr-0 md:pr-8">
                <div className="grid gap-8 rounded-card bg-beige p-6 text-forest md:grid-cols-[auto_1fr] md:p-8">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-serif text-[clamp(2rem,5vw,4.25rem)] leading-[0.95]">“{item.quote}”</p>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="text-sm text-forest/70">{item.role}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
