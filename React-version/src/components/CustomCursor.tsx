import { useCursorTrail } from '../hooks/useCursorTrail'

export function CustomCursor() {
  const canvasRef = useCursorTrail()

  return <canvas ref={canvasRef} className="cursor-canvas" aria-hidden="true" />
}
