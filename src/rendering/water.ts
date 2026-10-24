import { REFLECTION_SLICE_PX, REFLECTION_STRETCH, WATER_BOTTOM, WATER_TOP } from './config'

/**
 * Mirrors the sky into the lake below the horizon, row by row,
 * with each row shifted sideways a little to make ripples.
 */
export function drawWater(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, horizonY: number, time: number, dpr: number): void {
  const { width, height } = canvas
  const slice = REFLECTION_SLICE_PX * dpr

  for (let depth = 0; depth < height - horizonY; depth += slice) {
    const sourceY = horizonY - (depth + slice) * REFLECTION_STRETCH
    if (sourceY < 0) break
    const ripple = Math.sin(depth / dpr / 3 + time * 2.2) * (0.5 + depth / dpr / 25) * dpr
    ctx.drawImage(canvas, 0, sourceY, width, slice * REFLECTION_STRETCH, ripple, horizonY + depth, width, slice)
  }

  const tint = ctx.createLinearGradient(0, horizonY, 0, height)
  tint.addColorStop(0, `rgba(${WATER_TOP}, 0.45)`)
  tint.addColorStop(1, `rgba(${WATER_BOTTOM}, 0.92)`)
  ctx.fillStyle = tint
  ctx.fillRect(0, horizonY, width, height - horizonY)
}
