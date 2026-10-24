import type { FlashView } from '@/core'
import {
  SKYLINE_COLOR,
  SKYLINE_MAX_HEIGHT,
  SKYLINE_MIN_HEIGHT,
  SKYLINE_SEED,
  WINDOW_COLOR,
  WINDOW_LIT_SHARE,
} from './config'
import { seededRandom } from './random'
import { hsla } from './toScreen'

export interface Skyline {
  buildings: Path2D
  windows: Path2D
}

/** Builds a random (but repeatable) city silhouette standing on the horizon. */
export function createSkyline(width: number, horizonY: number, skyHeight: number, dpr: number): Skyline {
  const random = seededRandom(SKYLINE_SEED)
  const buildings = new Path2D()
  const windows = new Path2D()
  const cell = 7 * dpr

  for (let x = -10 * dpr; x < width; ) {
    const w = (26 + random() * 60) * dpr
    const tall = random() < 0.15 // a few towers stand out
    const h = skyHeight * (SKYLINE_MIN_HEIGHT + random() * (SKYLINE_MAX_HEIGHT - SKYLINE_MIN_HEIGHT)) * (tall ? 1.5 : 1)
    const top = horizonY - h
    buildings.rect(x, top, w, h + 1)
    if (tall) buildings.rect(x + w / 2 - dpr, top - 14 * dpr, 2 * dpr, 14 * dpr) // antenna

    for (let wy = top + cell; wy < horizonY - cell; wy += cell) {
      for (let wx = x + cell * 0.6; wx < x + w - cell; wx += cell) {
        if (random() < WINDOW_LIT_SHARE) windows.rect(wx, wy, 3 * dpr, 3 * dpr)
      }
    }
    x += w + random() * 6 * dpr
  }
  return { buildings, windows }
}

/** Draws the city; a sky flash briefly lights up its walls. */
export function drawSkyline(ctx: CanvasRenderingContext2D, skyline: Skyline, flash: FlashView): void {
  ctx.fillStyle = SKYLINE_COLOR
  ctx.fill(skyline.buildings)
  if (flash.strength > 0) {
    ctx.fillStyle = hsla({ ...flash.color, l: 30 }, flash.strength)
    ctx.fill(skyline.buildings)
  }
  ctx.fillStyle = WINDOW_COLOR
  ctx.fill(skyline.windows)
}
