import { MAX_OCTAVE, MIN_OCTAVE } from './config'

/** Computer keyboard laid out like one piano octave: white keys on A-row, black keys above. */
export const KEYMAP: Readonly<Record<string, number>> = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12,
}

export const OCTAVE_DOWN_KEY = 'z'
export const OCTAVE_UP_KEY = 'x'

/** MIDI pitch for a key in the given octave (C4 = 60), or null for unmapped keys. */
export function keyToPitch(key: string, octave: number): number | null {
  const semitone = KEYMAP[key.toLowerCase()]
  return semitone === undefined ? null : (octave + 1) * 12 + semitone
}

export function shiftOctave(octave: number, delta: number): number {
  return Math.min(MAX_OCTAVE, Math.max(MIN_OCTAVE, octave + delta))
}
