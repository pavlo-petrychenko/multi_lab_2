import type { BurstKind, FireworkSpec, Hsl, ParticleView, Seconds } from '@/core'
import { BURST_SPEED, SPLIT_SPEED, TRAIL_LIFETIME, TRAIL_SIZE } from './config'
import type { Body } from './physics'

export interface Particle extends Body, ParticleView {
  lifetime: Seconds
  baseColor: Hsl
  sparkle: boolean
  /** Age at which this star splits into four (crossette), or null. */
  splitAt: Seconds | null
}

type Random = () => number

/** Physical character of each burst type. */
interface BurstStyle {
  /** Share of spec.particleCount that is actually emitted. */
  density: number
  speed: number
  /** Random spread of speeds (0 = perfectly round shell). */
  jitter: number
  drag: number
  gravityScale: number
  lifetimeScale: number
  size: number
  /** Emission angles in radians, counter-clockwise from +x. */
  arc: [number, number]
  /** Share of the lifetime after which every star splits in four (null = never). */
  split: number | null
}

const FULL_CIRCLE: [number, number] = [0, 2 * Math.PI]

const STYLES: Record<BurstKind, BurstStyle> = {
  // Round, crisp sphere that hangs in the air.
  peony: { density: 1, speed: 1, jitter: 0.3, drag: 0.25, gravityScale: 0.2, lifetimeScale: 1, size: 2.2, arc: FULL_CIRCLE, split: null },
  // Slower sparks that droop down like willow branches.
  willow: { density: 0.9, speed: 0.75, jitter: 0.3, drag: 0.45, gravityScale: 0.45, lifetimeScale: 1.3, size: 1.8, arc: FULL_CIRCLE, split: null },
  // A few big stars that each split into four — short, punchy notes.
  crossette: { density: 0.12, speed: 0.9, jitter: 0.1, drag: 0.3, gravityScale: 0.15, lifetimeScale: 1.2, size: 2.6, arc: FULL_CIRCLE, split: 0.4 },
  // A thin, perfectly round ring — chords.
  ring: { density: 0.6, speed: 1.1, jitter: 0.03, drag: 0.25, gravityScale: 0.1, lifetimeScale: 1, size: 2, arc: FULL_CIRCLE, split: null },
  // Upward fan from the rooftops — drums.
  ground: { density: 0.5, speed: 1.4, jitter: 0.3, drag: 0.2, gravityScale: 1, lifetimeScale: 0.6, size: 2, arc: [Math.PI / 6, (5 * Math.PI) / 6], split: null },
}

/** Explodes a firework at (x, spec.height) into particles shaped by its burst type. */
export function createBurst(spec: FireworkSpec, x: number, random: Random = Math.random): Particle[] {
  const style = STYLES[spec.burst]
  const count = Math.max(6, Math.round(spec.particleCount * style.density))
  const [arcFrom, arcTo] = style.arc
  const turn = style.arc === FULL_CIRCLE ? random() : 0 // rotate whole shells randomly
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const angle = arcFrom + ((i + turn + random() * style.jitter) / count) * (arcTo - arcFrom)
    const speed = spec.radius * BURST_SPEED * style.speed * (1 - style.jitter / 2 + style.jitter * random())
    const lifetime = spec.lifetime * style.lifetimeScale * (0.8 + 0.4 * random())
    particles.push({
      x,
      y: spec.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      lifetime,
      drag: style.drag,
      gravityScale: style.gravityScale,
      color: spec.color,
      baseColor: spec.color,
      sparkle: spec.sparkle,
      splitAt: style.split === null ? null : lifetime * style.split,
      size: style.size,
      alpha: 1,
    })
  }
  return particles
}

/** Crossette: one star breaks into four, at right angles to each other. */
export function splitParticle(parent: Particle): Particle[] {
  const heading = Math.atan2(parent.vy, parent.vx)
  const remaining = parent.lifetime - parent.age
  return [0, 1, 2, 3].map((k) => {
    const angle = heading + Math.PI / 4 + (k * Math.PI) / 2
    return {
      ...parent,
      vx: parent.vx * 0.3 + Math.cos(angle) * SPLIT_SPEED,
      vy: parent.vy * 0.3 + Math.sin(angle) * SPLIT_SPEED,
      age: 0,
      lifetime: remaining + 0.2,
      size: parent.size * 0.75,
      splitAt: null,
    }
  })
}

/** Fades a particle out; sparkling ones strobe white-hot in the second half of their life. */
export function updateLook(particle: Particle, random: Random = Math.random): void {
  const life = particle.age / particle.lifetime
  particle.alpha = Math.max(0, 1 - life * life)
  particle.color = particle.baseColor
  if (particle.sparkle && life > 0.35 && random() < 0.45) {
    particle.alpha *= 0.15
  } else if (particle.sparkle && life > 0.35) {
    particle.color = { h: particle.baseColor.h, s: 40, l: 92 }
  }
}

/** A short-lived spark left behind a climbing rocket. */
export function createTrailSpark(x: number, y: number, color: Hsl, random: Random = Math.random): Particle {
  return {
    x,
    y,
    vx: (random() - 0.5) * 0.02,
    vy: -0.02,
    age: 0,
    lifetime: TRAIL_LIFETIME,
    drag: 0.5,
    gravityScale: 0.1,
    color,
    baseColor: color,
    sparkle: false,
    splitAt: null,
    size: TRAIL_SIZE,
    alpha: 1,
  }
}
