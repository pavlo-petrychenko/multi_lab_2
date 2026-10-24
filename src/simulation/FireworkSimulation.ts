import type {
  FireworkScene,
  FireworkSpec,
  FlashView,
  LabelView,
  RocketView,
  Seconds,
  Simulation,
  TimeWindow,
} from '@/core'
import { createBurst, createTrailSpark, splitParticle, updateLook, type Particle } from './bursts'
import { FLASH_FADE, LABEL_LIFETIME, MAX_PARTICLES, MAX_STEP, SHAKE_DECAY } from './config'
import { flightTime, launchVelocity, rocketHeight, stepBody } from './physics'

interface Rocket extends RocketView {
  launchAt: Seconds
  burstAt: Seconds
  v0: number
  spec: FireworkSpec
}

interface Label extends LabelView {
  age: Seconds
}

export interface FireworkSimulationOptions {
  random?: () => number
}

/**
 * The fireworks world. Rockets fly on an exact ballistic curve so they burst
 * at their note's time; burst particles are then integrated step by step.
 *
 * World units: y = 0 is the ground, y = 1 the top of the sky; x spans 0…aspect.
 */
export class FireworkSimulation implements Simulation<FireworkSpec, FireworkScene> {
  private readonly random: () => number
  private time: Seconds = 0
  private aspect = 16 / 9
  private rockets: Rocket[] = []
  private pending: FireworkSpec[] = []
  private particles: Particle[] = []
  private labels: Label[] = []
  private flash: FlashView = { color: { h: 0, s: 0, l: 100 }, strength: 0 }
  private shake = 0

  constructor({ random = Math.random }: FireworkSimulationOptions = {}) {
    this.random = random
  }

  /** Width / height of the sky, so bursts stay round on any screen. */
  setAspect(aspect: number): void {
    this.aspect = aspect
  }

  spawn(spec: FireworkSpec): void {
    if (spec.burst === 'ground') {
      this.pending.push(spec)
      return
    }
    const launchAt = this.time
    const flight = flightTime(launchAt, spec.burstAt)
    this.rockets.push({
      x: spec.x * this.aspect,
      y: 0,
      color: spec.color,
      launchAt,
      burstAt: launchAt + flight,
      v0: launchVelocity(spec.height, flight),
      spec,
    })
  }

  step({ from, to }: TimeWindow): void {
    const dt = Math.min(Math.max(to - from, 0), MAX_STEP)
    this.time = to

    this.rockets = this.rockets.filter((rocket) => {
      if (to >= rocket.burstAt) {
        this.explode(rocket.spec, rocket.x)
        return false
      }
      rocket.y = rocketHeight(rocket.v0, to - rocket.launchAt)
      if (dt > 0) this.particles.push(createTrailSpark(rocket.x, rocket.y, rocket.color, this.random))
      return true
    })

    this.pending = this.pending.filter((spec) => {
      if (to < spec.burstAt) return true
      this.explode(spec, spec.x * this.aspect)
      return false
    })

    const children: Particle[] = []
    for (const particle of this.particles) {
      stepBody(particle, dt)
      updateLook(particle, this.random)
      if (particle.splitAt !== null && particle.age >= particle.splitAt) {
        children.push(...splitParticle(particle))
        particle.age = particle.lifetime // the parent star is replaced by its four children
      }
    }
    this.particles = this.particles.filter((p) => p.age < p.lifetime && p.y > -0.05)
    this.particles.push(...children)
    if (this.particles.length > MAX_PARTICLES) this.particles.splice(0, this.particles.length - MAX_PARTICLES)

    for (const label of this.labels) {
      label.age += dt
      label.alpha = Math.max(0, 1 - label.age / LABEL_LIFETIME)
    }
    this.labels = this.labels.filter((label) => label.age < LABEL_LIFETIME)

    this.flash.strength = Math.max(0, this.flash.strength - dt * FLASH_FADE)
    this.shake = this.shake < 0.05 ? 0 : this.shake * Math.pow(SHAKE_DECAY, dt)
  }

  state(): FireworkScene {
    return {
      time: this.time,
      rockets: this.rockets,
      particles: this.particles,
      labels: this.labels,
      flash: this.flash,
      shake: this.shake,
    }
  }

  reset(): void {
    this.rockets = []
    this.pending = []
    this.particles = []
    this.labels = []
    this.flash.strength = 0
    this.shake = 0
  }

  private explode(spec: FireworkSpec, x: number): void {
    this.particles.push(...createBurst(spec, x, this.random))
    this.labels.push({ x, y: spec.height + spec.radius * 0.6, text: spec.label, alpha: 1, age: 0 })
    if (spec.flash > this.flash.strength) this.flash = { color: spec.color, strength: spec.flash }
    this.shake = Math.max(this.shake, spec.shake)
  }
}
