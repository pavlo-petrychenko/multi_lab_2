import { describe, expect, it } from 'vitest'
import type { NoteEvent, Song } from '@/core'
import { MidiFileSource } from './MidiFileSource'

const song = (times: number[]): Song => ({
  name: 'test',
  duration: 10,
  tracks: [],
  notes: times.map<NoteEvent>((time, i) => ({
    id: String(i),
    trackId: 't',
    trackKind: 'melodic',
    time,
    duration: 0.5,
    pitch: 60,
    velocity: 1,
    chordSize: 1,
  })),
})

const times = (notes: NoteEvent[]) => notes.map((n) => n.time)

describe('MidiFileSource', () => {
  it('hands notes out `lead` seconds early', () => {
    const source = new MidiFileSource({ song: song([0, 2, 3, 5]), lead: 1 })
    source.collect({ from: 0, to: 0.5 }) // first frame primes
    expect(times(source.collect({ from: 0.5, to: 1.5 }))).toEqual([2])
    expect(times(source.collect({ from: 1.5, to: 2.5 }))).toEqual([3])
    expect(times(source.collect({ from: 2.5, to: 3.5 }))).toEqual([])
    expect(times(source.collect({ from: 3.5, to: 4.5 }))).toEqual([5])
  })

  it('on the first frame also returns notes inside the lead gap', () => {
    const source = new MidiFileSource({ song: song([0, 0.4, 0.9, 2]), lead: 1 })
    expect(times(source.collect({ from: 0, to: 0.016 }))).toEqual([0, 0.4, 0.9])
  })

  it('primes again after reset (e.g. a seek)', () => {
    const source = new MidiFileSource({ song: song([1, 5, 5.5, 8]), lead: 1 })
    source.collect({ from: 0, to: 0.1 })
    source.reset()
    expect(times(source.collect({ from: 5, to: 5.1 }))).toEqual([5, 5.5])
  })

  it('never returns a note twice across consecutive frames', () => {
    const all = Array.from({ length: 100 }, (_, i) => i * 0.1)
    const source = new MidiFileSource({ song: song(all), lead: 1 })
    const seen: number[] = []
    for (let t = 0; t < 11; t += 1 / 60) seen.push(...times(source.collect({ from: t, to: t + 1 / 60 })))
    expect(seen).toEqual(all)
  })
})
