import { useEffect, useRef } from 'react'
import type { Engine } from '@/engine'

/** Full-window canvas the engine draws on. */
export function Stage({ engine }: { engine: Engine }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    engine.attach(canvas)

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      engine.resize(width, height, window.devicePixelRatio || 1)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [engine])

  return <canvas ref={canvasRef} className="stage" />
}
