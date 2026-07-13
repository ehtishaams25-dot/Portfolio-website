import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useRevealAnimations() {
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((item) => {
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
          },
        })
      })

      gsap.to('.footer-name-letter', {
        yPercent: -12,
        stagger: 0.055,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        duration: 1.7,
      })
    })

    return () => context.revert()
  }, [])
}
