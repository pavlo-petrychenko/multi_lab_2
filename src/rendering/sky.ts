import { SKY_BOTTOM, SKY_TOP, TRAIL_FADE } from './config'

/** Paints a translucent night sky over the last frame, so moving things leave fading trails. */
export function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number, alpha = TRAIL_FADE): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, `rgba(${SKY_TOP}, ${alpha})`)
  gradient.addColorStop(1, `rgba(${SKY_BOTTOM}, ${alpha})`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

