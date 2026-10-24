import { STAR_DENSITY, STAR_SEED } from './config'
import { seededRandom } from './random'

export interface Star {
  x: number
  y: number
  size: number
  phase: number
  speed: number
}

/** Scatters stars over the sky, denser near the top. */
export function createStars(width: number, skyHeight: number, dpr: number): Star[] {
  const random = seededRandom(STAR_SEED)
  const count = Math.round((width * skyHeight) / (STAR_DENSITY * dpr * dpr))
  return Array.from({ length: count }, () => ({
    x: random() * width,
    y: Math.pow(random(), 1.6) * skyHeight * 0.85,
    size: (random() < 0.1 ? 1.6 : 0.9) * dpr,
    phase: random() * Math.PI * 2,
    speed: 0.6 + random() * 2,
  }))
}

/** Twinkling stars: each one pulses at its own speed. */
export function drawStars(ctx: CanvasRenderingContext2D, stars: readonly Star[], time: number): void {
  for (const star of stars) {
    const alpha = 0.35 + 0.3 * Math.sin(time * star.speed + star.phase)
    ctx.fillStyle = `rgba(220, 225, 255, ${alpha})`
    ctx.fillRect(star.x, star.y, star.size, star.size)
  }
}
