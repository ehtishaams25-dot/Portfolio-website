import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
}

export function useCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let frame = 0
    let width = 0
    let height = 0
    const particles: Particle[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const move = (event: PointerEvent) => {
      for (let i = 0; i < 3; i += 1) {
        particles.push({
          x: event.clientX,
          y: event.clientY,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8,
          life: 1,
          size: Math.random() * 2.4 + 1,
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.018
        p.size *= 0.992
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.fillStyle = `rgba(220, 181, 88, ${p.life * 0.55})`
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      frame = requestAnimationFrame(animate)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return canvasRef
}
