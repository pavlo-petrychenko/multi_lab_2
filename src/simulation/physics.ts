import type { Seconds } from '@/core'
import { GRAVITY, MIN_FLIGHT } from './config'

/** Particle state that physics moves. */
export interface Body {
  x: number
  y: number
  vx: number
  vy: number
  age: Seconds
  /** Share of velocity kept after one second (0–1): lower = more air drag. */
  drag: number
  gravityScale: number
}

/** How long a rocket flies: from launch until its note, but never shorter than MIN_FLIGHT. */
export function flightTime(launchAt: Seconds, burstAt: Seconds): Seconds {
  return Math.max(burstAt - launchAt, MIN_FLIGHT)
}

/**
 * Launch speed that brings a rocket from the ground to `height` in exactly `flight` seconds.
 * From y(T) = v0·T − ½·g·T² = h  →  v0 = h/T + g·T/2.
 */
export function launchVelocity(height: number, flight: Seconds, gravity = GRAVITY): number {
  return height / flight + (gravity * flight) / 2
}

/** Rocket height `elapsed` seconds after launch: y(τ) = v0·τ − ½·g·τ². */
export function rocketHeight(v0: number, elapsed: Seconds, gravity = GRAVITY): number {
  return v0 * elapsed - (gravity * elapsed * elapsed) / 2
}

/** Moves a body by one time step: air drag, then gravity, then position. */
export function stepBody(body: Body, dt: Seconds, gravity = GRAVITY): void {
  const keep = Math.pow(body.drag, dt)
  body.vx *= keep
  body.vy = body.vy * keep - gravity * body.gravityScale * dt
  body.x += body.vx * dt
  body.y += body.vy * dt
  body.age += dt
}
