import type { CSSProperties, PointerEvent } from 'react'
import { useMemo, useRef, useState } from 'react'
import { shortFormVideos } from '../data/portfolio'
import { SectionHeading } from './SectionHeading'

type DragState = {
  active: boolean
  startX: number
  offset: number
}

export function VideoCarousel() {
  const [drag, setDrag] = useState<DragState>({ active: false, startX: 0, offset: 0 })
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const cards = useMemo(() => [...shortFormVideos, ...shortFormVideos], [])

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag((current) => ({ ...current, active: true, startX: event.clientX }))
    videoRefs.current.forEach((video) => {
      video?.play().catch(() => undefined)
    })
  }

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.active) return
    const delta = event.clientX - drag.startX
    setDrag((current) => ({
      active: true,
      startX: event.clientX,
      offset: current.offset + delta,
    }))
  }

  const endDrag = () => {
    setDrag((current) => ({ ...current, active: false }))
  }

  return (
    <section id="video-scroll" className="ds-section overflow-hidden bg-void text-beige">
      <div className="ds-shell">
        <SectionHeading kicker="Short-form edits" title="drag through the gallery" tone="light" />
      </div>
      <div
        className="relative cursor-grab select-none overflow-hidden py-10 active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="flex w-max gap-5 px-edge transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${drag.offset}px)` }}
        >
          {cards.map((src, index) => {
            const centerDistance = Math.abs(index - cards.length / 2)
            const style = {
              '--rot': `${(index % 5 - 2) * 1.6}deg`,
              '--scale': `${1 - Math.min(centerDistance * 0.01, 0.08)}`,
            } as CSSProperties

            return (
              <article
                key={`${src}-${index}`}
                className="video-card w-[min(72vw,17rem)] shrink-0 overflow-hidden rounded-card border border-beige/10 bg-beige/6 p-2 shadow-glow transition duration-300 hover:z-10 hover:scale-[1.03]"
                style={style}
              >
                <video
                  ref={(node) => {
                    videoRefs.current[index] = node
                  }}
                  src={src}
                  className="aspect-[9/16] h-auto w-full rounded-[0.35rem] object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(event) => {
                    event.currentTarget.muted = false
                    event.currentTarget.play().catch(() => undefined)
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.muted = true
                  }}
                />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
