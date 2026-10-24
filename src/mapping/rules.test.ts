import { describe, expect, it } from 'vitest'
import type { NoteEvent } from '@/core'
import { HEIGHT_HIGH, HEIGHT_LOW, WILLOW_MIN_DURATION } from './config'
import { burstFlash, burstKind, burstShake, durationToLifetime, laneX, noteLabel, noteName, pitchToHeight, velocityToRadius } from './rules'

const note = (patch: Partial<NoteEvent>): NoteEvent => ({
  id: 'n',
  trackId: 't',
  trackKind: 'melodic',
  time: 0,
  duration: 0.25,
  pitch: 60,
  velocity: 0.5,
  chordSize: 1,
  ...patch,
})

describe('mapping rules', () => {
  it('pitchToHeight grows with pitch and is clamped', () => {
    expect(pitchToHeight(48)).toBeLessThan(pitchToHeight(72))
    expect(pitchToHeight(0)).toBe(HEIGHT_LOW)
    expect(pitchToHeight(127)).toBe(HEIGHT_HIGH)
  })

  it('velocity makes bursts bigger', () => {
    expect(velocityToRadius(1)).toBeGreaterThan(velocityToRadius(0.2))
  })

  it('duration makes sparks live longer, within limits', () => {
    expect(durationToLifetime(1)).toBeGreaterThan(durationToLifetime(0.1))
    expect(durationToLifetime(100)).toBe(3)
  })

  it('picks the burst type from track kind, chord and duration', () => {
    expect(burstKind(note({ duration: 0.5 }))).toBe('peony')
    expect(burstKind(note({ duration: 0.1 }))).toBe('crossette')
    expect(burstKind(note({ duration: WILLOW_MIN_DURATION }))).toBe('willow')
    expect(burstKind(note({ chordSize: 3, duration: 2 }))).toBe('ring')
    expect(burstKind(note({ trackKind: 'drums', duration: 2 }))).toBe('ground')
  })

  it('flashes the sky only for loud notes, more for chords', () => {
    expect(burstFlash(note({ velocity: 0.5 }))).toBe(0)
    expect(burstFlash(note({ velocity: 1 }))).toBeGreaterThan(burstFlash(note({ velocity: 0.8 })))
    expect(burstFlash(note({ velocity: 0.9, chordSize: 3 }))).toBeGreaterThan(burstFlash(note({ velocity: 0.9 })))
  })

  it('shakes the screen on kicks only', () => {
    expect(burstShake(note({ trackKind: 'drums', pitch: 36, velocity: 1 }))).toBeGreaterThan(0)
    expect(burstShake(note({ trackKind: 'drums', pitch: 38, velocity: 1 }))).toBe(0)
    expect(burstShake(note({ pitch: 36, velocity: 1 }))).toBe(0)
  })

  it('puts each track in its own lane', () => {
    const lanes = { count: 3 }
    const x0 = laneX(note({}), { ...lanes, index: 0 })
    const x2 = laneX(note({}), { ...lanes, index: 2 })
    expect(x0).toBeLessThan(1 / 3)
    expect(x2).toBeGreaterThan(2 / 3)
  })

  it('names notes', () => {
    expect(noteName(60)).toBe('C4')
    expect(noteName(69)).toBe('A4')
    expect(noteName(61)).toBe('C#4')
  })
})

describe('note labels', () => {
  it('uses note names for melodies and drum names for drums', () => {
    expect(noteLabel(note({ pitch: 72, velocity: 1 }))).toBe('C5 · v127')
    expect(noteLabel(note({ trackKind: 'drums', pitch: 36, velocity: 1 }))).toBe('Kick · v127')
    expect(noteLabel(note({ trackKind: 'drums', pitch: 38, velocity: 1 }))).toBe('Snare · v127')
  })
})
