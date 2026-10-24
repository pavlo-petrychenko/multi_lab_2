import type { RocketView } from '@/core'
import { ROCKET_SIZE } from './config'
import { hsla, type ToScreen } from './toScreen'

/** Bright rocket heads; their tails come from trail sparks plus the sky fade. */
export function drawRockets(ctx: CanvasRenderingContext2D, rockets: readonly RocketView[], toScreen: ToScreen, scale: number): void {
  for (const rocket of rockets) {
    const [x, y] = toScreen(rocket.x, rocket.y)
    ctx.fillStyle = hsla({ ...rocket.color, l: 85 }, 1)
    ctx.beginPath()
    ctx.arc(x, y, ROCKET_SIZE * scale, 0, Math.PI * 2)
    ctx.fill()
  }
}
