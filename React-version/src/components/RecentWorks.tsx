import { ArrowUpRight } from 'lucide-react'
import { workItems } from '../data/portfolio'
import { SectionHeading } from './SectionHeading'

const paletteClass = {
  forest: 'bg-forest text-beige',
  void: 'bg-void text-beige',
}

export function RecentWorks() {
  return (
    <section id="works" className="ds-section bg-beige text-forest">
      <div className="ds-shell">
        <SectionHeading kicker="Recent works" title="selected edits with a pulse" />
      </div>
      <div className="overflow-x-auto px-edge pb-4 [scrollbar-width:none]">
        <div className="flex min-w-max gap-5">
          {workItems.map((work) => (
            <a
              key={work.title}
              href={work.href}
              target="_blank"
              rel="noreferrer"
              className={`reveal group w-[min(78vw,31rem)] rounded-card p-4 transition duration-300 hover:-translate-y-2 ${
                paletteClass[work.palette as keyof typeof paletteClass]
              }`}
            >
              <div className="aspect-[16/10] overflow-hidden rounded-[0.35rem] bg-black">
                <video
                  src={work.video}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(event) => event.currentTarget.play().catch(() => undefined)}
                  onMouseLeave={(event) => event.currentTarget.pause()}
                />
              </div>
              <div className="mt-5 flex items-start justify-between gap-5">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="ds-pill">{work.year}</span>
                    <span className="ds-pill">{work.type}</span>
                  </div>
                  <h3 className="font-serif text-4xl leading-none">{work.title}</h3>
                </div>
                <span className="ds-icon-button shrink-0">
                  <ArrowUpRight size={22} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
