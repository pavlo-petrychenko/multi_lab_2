import type { FlashView } from '@/core'
import { FLASH_ALPHA } from './config'
import { hsla } from './toScreen'

/** Lights the whole sky in the color of a loud burst. */
export function drawFlash(ctx: CanvasRenderingContext2D, flash: FlashView, width: number, horizonY: number): void {
  if (flash.strength <= 0) return
  const glow = ctx.createLinearGradient(0, 0, 0, horizonY)
  glow.addColorStop(0, hsla(flash.color, flash.strength * FLASH_ALPHA))
  glow.addColorStop(1, hsla(flash.color, flash.strength * FLASH_ALPHA * 0.4))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, horizonY)
}
