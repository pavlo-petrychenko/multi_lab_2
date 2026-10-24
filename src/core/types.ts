/** Shared domain types. Every role folder speaks in these terms. */

export type Seconds = number

/** Half-open time interval (from, to] — the slice of song time covered by one frame. */
export interface TimeWindow {
  from: Seconds
  to: Seconds
}

export type TrackKind = 'melodic' | 'drums' | 'live'

export interface TrackInfo {
  id: string
  name: string
  kind: TrackKind
  /** Position among the song's tracks — used for lanes and colors. */
  index: number
  noteCount: number
}

export interface Song {
  name: string
  duration: Seconds
  tracks: TrackInfo[]
  /** All notes of all tracks, sorted by time. */
  notes: NoteEvent[]
}

export interface NoteEvent {
  id: string
  trackId: string
  trackKind: TrackKind
  time: Seconds
  duration: Seconds
  /** MIDI note number 0–127. */
  pitch: number
  /** Normalized velocity 0–1. */
  velocity: number
  /** How many notes of the same track start together (1 = single note, 3+ = chord). */
  chordSize: number
}

export type BurstKind = 'peony' | 'willow' | 'crossette' | 'ring' | 'ground'

export interface Hsl {
  h: number
  s: number
  l: number
}

/** What a note should look like — output of mapping, input of simulation. */
export interface FireworkSpec {
  noteId: string
  burstAt: Seconds
  burst: BurstKind
  /** World units 0–1, y points up. */
  x: number
  height: number
  color: Hsl
  particleCount: number
  radius: number
  lifetime: Seconds
  /** Sparks glitter and strobe before they fade. */
  sparkle: boolean
  /** How strongly the burst lights up the whole sky (0 = not at all). */
  flash: number
  /** How strongly the burst shakes the screen (0 = not at all). */
  shake: number
  label: string
}

export interface RocketView {
  x: number
  y: number
  color: Hsl
}

export interface ParticleView {
  x: number
  y: number
  color: Hsl
  alpha: number
  size: number
}

export interface LabelView {
  x: number
  y: number
  text: string
  alpha: number
}

export interface FlashView {
  color: Hsl
  strength: number
}

/** Read-only snapshot of the simulation that a renderer draws. */
export interface FireworkScene {
  time: Seconds
  rockets: readonly RocketView[]
  particles: readonly ParticleView[]
  labels: readonly LabelView[]
  flash: FlashView
  shake: number
}
