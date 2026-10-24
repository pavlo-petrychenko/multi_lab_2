import { drumOf, type BurstKind, type Hsl, type NoteEvent, type Seconds } from '@/core'
import {
  CROSSETTE_MAX_DURATION,
  FLASH_CHORD_BONUS,
  FLASH_MAX,
  FLASH_MIN_VELOCITY,
  GROUND_HEIGHT,
  HEIGHT_HIGH,
  HEIGHT_LOW,
  KICK_SHAKE,
  LANE_SPREAD,
  LIFETIME_BASE,
  LIFETIME_MAX,
  LIFETIME_MIN,
  LIFETIME_PER_SECOND,
  LIGHTNESS_BASE,
  LIGHTNESS_PER_VELOCITY,
  LIVE_MARGIN,
  PARTICLES_BASE,
  PARTICLES_PER_VELOCITY,
  PITCH_HIGH,
  PITCH_LOW,
  RADIUS_BASE,
  RADIUS_PER_VELOCITY,
  RING_MIN_CHORD,
  SPARKLE_MIN_VELOCITY,
  WILLOW_MIN_DURATION,
} from './config'

/**
 * The MIDI → visual rules. One function per rule; each is pure and
 * documented, so this file doubles as the "how MIDI drives the animation" spec.
 */

export interface Lane {
  index: number
  count: number
}

/** Pitch → burst height: low notes burst low, high notes burst high (linear, clamped). */
export function pitchToHeight(pitch: number): number {
  return lerp(HEIGHT_LOW, HEIGHT_HIGH, pitchToUnit(pitch))
}

/** Track kind → height: drums burst on the ground, everything else by pitch. */
export function burstHeight(note: NoteEvent): number {
  return note.trackKind === 'drums' ? GROUND_HEIGHT : pitchToHeight(note.pitch)
}

/**
 * Track → horizontal lane; pitch → offset inside the lane.
 * Drums: kick in the lane centre, snare to the left, hi-hats to the right.
 * Live keyboard: the whole sky, left = low, right = high.
 */
export function laneX(note: NoteEvent, lane: Lane): number {
  if (note.trackKind === 'live') return lerp(LIVE_MARGIN, 1 - LIVE_MARGIN, pitchToUnit(note.pitch))

  const width = 1 / lane.count
  const center = (lane.index + 0.5) * width
  const offset = note.trackKind === 'drums' ? drumOffset(note.pitch) : pitchToUnit(note.pitch) - 0.5
  return center + offset * width * LANE_SPREAD
}

/** Velocity → particle count: harder notes make denser bursts. */
export function velocityToParticleCount(velocity: number): number {
  return Math.round(PARTICLES_BASE + velocity * PARTICLES_PER_VELOCITY)
}

/** Velocity → burst radius: harder notes make bigger bursts. */
export function velocityToRadius(velocity: number): number {
  return RADIUS_BASE + velocity * RADIUS_PER_VELOCITY
}

/** Track color + velocity → final color: harder notes are brighter. */
export function noteColor(base: Hsl, velocity: number): Hsl {
  return { ...base, l: LIGHTNESS_BASE + velocity * LIGHTNESS_PER_VELOCITY }
}

/** Duration → how long the sparks live: short notes pop, long notes linger. */
export function durationToLifetime(duration: Seconds): Seconds {
  return clamp(LIFETIME_BASE + duration * LIFETIME_PER_SECOND, LIFETIME_MIN, LIFETIME_MAX)
}

/**
 * Track kind + chord + duration → burst type:
 * drums → ground, chords → ring, long notes → willow, short notes → crossette, others → peony.
 */
export function burstKind(note: NoteEvent): BurstKind {
  if (note.trackKind === 'drums') return 'ground'
  if (note.chordSize >= RING_MIN_CHORD) return 'ring'
  if (note.duration >= WILLOW_MIN_DURATION) return 'willow'
  if (note.duration <= CROSSETTE_MAX_DURATION) return 'crossette'
  return 'peony'
}

/** Velocity → glitter: the loudest notes strobe before fading. */
export function velocityToSparkle(velocity: number): boolean {
  return velocity >= SPARKLE_MIN_VELOCITY
}

/** Velocity + chord → sky flash: loud notes light up the sky, chords even more. */
export function burstFlash(note: NoteEvent): number {
  const loudness = clamp((note.velocity - FLASH_MIN_VELOCITY) / (1 - FLASH_MIN_VELOCITY), 0, 1)
  if (loudness === 0) return 0
  return Math.min(FLASH_MAX, loudness * FLASH_MAX + (note.chordSize - 1) * FLASH_CHORD_BONUS)
}

/** Kick drum + velocity → screen shake: you see the beat, not just hear it. */
export function burstShake(note: NoteEvent): number {
  return note.trackKind === 'drums' && drumOf(note.pitch) === 'kick' ? note.velocity * KICK_SHAKE : 0
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** MIDI pitch → note name, e.g. 60 → "C4". */
export function noteName(pitch: number): string {
  return `${NOTE_NAMES[pitch % 12]}${Math.floor(pitch / 12) - 1}`
}

const DRUM_LABELS = { kick: 'Kick', snare: 'Snare', hiHat: 'Hi-hat', crash: 'Crash', percussion: 'Perc' }

/** Note → label shown over its burst: note name for melodies, drum name for drums. */
export function noteLabel(note: NoteEvent): string {
  const name = note.trackKind === 'drums' ? DRUM_LABELS[drumOf(note.pitch)] : noteName(note.pitch)
  return `${name} · v${Math.round(note.velocity * 127)}`
}

/** General MIDI drum → offset inside the lane (−0.5…0.5): kick centre, snare left, cymbals right. */
function drumOffset(pitch: number): number {
  switch (drumOf(pitch)) {
    case 'kick':
      return 0
    case 'snare':
      return -0.35
    case 'hiHat':
      return 0.35
    case 'crash':
      return 0.2
    case 'percussion':
      return ((pitch % 5) - 2) * 0.15 // spread other percussion by pitch
  }
}

function pitchToUnit(pitch: number): number {
  return clamp((pitch - PITCH_LOW) / (PITCH_HIGH - PITCH_LOW), 0, 1)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
