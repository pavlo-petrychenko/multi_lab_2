import type { ParticleView } from '@/core'
import { hsla, type ToScreen } from './toScreen'

/** Burst sparks: a soft halo plus a bright core, both fading with the particle's alpha. */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: readonly ParticleView[], toScreen: ToScreen, scale: number): void {
  for (const particle of particles) {
    const [x, y] = toScreen(particle.x, particle.y)
    const size = particle.size * scale

    ctx.fillStyle = hsla(particle.color, particle.alpha * 0.25)
    ctx.beginPath()
    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = hsla(particle.color, particle.alpha)
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}
