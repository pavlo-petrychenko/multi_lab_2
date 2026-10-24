import type { FireworkScene, Renderer } from '@/core'
import { WATER_HEIGHT_PX } from './config'
import { drawFlash } from './flash'
import { drawLabels } from './labels'
import { drawParticles } from './particles'
import { drawRockets } from './rockets'
import { drawSky } from './sky'
import { createSkyline, drawSkyline, type Skyline } from './skyline'
import { createStars, drawStars, type Star } from './stars'
import { createToScreen, type ToScreen } from './toScreen'
import { drawWater } from './water'

export interface CanvasRendererOptions {
  canvas: HTMLCanvasElement
}

const NO_FLASH = { color: { h: 0, s: 0, l: 0 }, strength: 0 }

/** Draws a FireworkScene on a 2D canvas, layer by layer: sky, fireworks, city, lake, labels. */
export class CanvasRenderer implements Renderer<FireworkScene> {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private toScreen: ToScreen = createToScreen(1)
  private dpr = 1
  private horizonY = 0
  private stars: Star[] = []
  private skyline: Skyline = { buildings: new Path2D(), windows: new Path2D() }
  showLabels = false

  constructor({ canvas }: CanvasRendererOptions) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is not supported')
    this.canvas = canvas
    this.ctx = ctx
  }

  /** Matches the canvas to its CSS size and pixel density; returns the sky's aspect ratio (above the lake). */
  resize(cssWidth: number, cssHeight: number, dpr: number): number {
    this.dpr = dpr
    this.canvas.width = Math.round(cssWidth * dpr)
    this.canvas.height = Math.round(cssHeight * dpr)
    const skyHeight = Math.max(1, cssHeight - WATER_HEIGHT_PX)
    this.horizonY = skyHeight * dpr
    this.toScreen = createToScreen(this.horizonY)
    this.stars = createStars(this.canvas.width, this.horizonY, dpr)
    this.skyline = createSkyline(this.canvas.width, this.horizonY, this.horizonY, dpr)
    this.clear()
    return cssWidth / skyHeight
  }

  render(scene: FireworkScene): void {
    const { ctx, canvas, toScreen, dpr, horizonY } = this

    drawSky(ctx, canvas.width, horizonY) // translucent: last frame fades into motion trails
    drawStars(ctx, this.stars, scene.time)

    ctx.save()
    ctx.translate(Math.sin(scene.time * 93) * scene.shake * dpr, Math.cos(scene.time * 71) * scene.shake * dpr)
    ctx.globalCompositeOperation = 'lighter' // overlapping light adds up into glow
    drawFlash(ctx, scene.flash, canvas.width, horizonY)
    drawRockets(ctx, scene.rockets, toScreen, dpr)
    drawParticles(ctx, scene.particles, toScreen, dpr)
    ctx.globalCompositeOperation = 'source-over'
    drawSkyline(ctx, this.skyline, scene.flash)
    ctx.restore()

    drawWater(ctx, canvas, horizonY, scene.time, dpr)
    if (this.showLabels) drawLabels(ctx, scene.labels, toScreen, dpr)
  }

  clear(): void {
    drawSky(this.ctx, this.canvas.width, this.horizonY, 1)
    drawStars(this.ctx, this.stars, 0)
    drawSkyline(this.ctx, this.skyline, NO_FLASH)
    drawWater(this.ctx, this.canvas, this.horizonY, 0, this.dpr)
  }
}
