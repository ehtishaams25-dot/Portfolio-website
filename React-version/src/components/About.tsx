import { useRef } from 'react'
import { SectionHeading } from './SectionHeading'

export function About() {
  const imageRef = useRef<HTMLImageElement | null>(null)

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const image = imageRef.current
    if (!image) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    image.style.transform = `translate(${x * 18}px, ${y * 18}px) scale(1.04)`
  }

  const resetImage = () => {
    if (imageRef.current) imageRef.current.style.transform = 'translate(0, 0) scale(1)'
  }

  return (
    <section id="about" className="ds-section bg-beige text-forest">
      <div className="ds-shell grid items-center gap-12 lg:grid-cols-[1.05fr_0.8fr]">
        <div>
          <SectionHeading kicker="About me" title="editor, motion designer, story obsessive" />
          <p className="reveal ds-copy">
            I build edits that move with intention: sharp pacing, clean graphic systems, and visual choices that make
            brands feel unmistakable. The work stretches across YouTube, events, brand films, documentaries, shorts,
            thumbnails, and channel systems.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            {['Video', 'Motion', 'Thumbnails', 'YouTube Systems'].map((item) => (
              <span key={item} className="ds-pill text-forest">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div
          className="reveal relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-card border border-forest/20 bg-forest p-3 shadow-glow"
          onPointerMove={handleMove}
          onPointerLeave={resetImage}
        >
          <img
            ref={imageRef}
            src="/assets/images/headshot.png"
            alt="Mohammed Ehtishaam Shaikh"
            className="h-full w-full rounded-[0.35rem] object-cover transition duration-500"
          />
        </div>
      </div>
    </section>
  )
}
