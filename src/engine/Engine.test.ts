import { describe, expect, it, vi } from 'vitest'
import type { FireworkSpec, NoteEvent, Song, TrackInfo } from '@/core'
import { Engine } from './Engine'
import type { EngineDeps, LiveInput, SongParts } from './types'

const track = (id: string, index: number): TrackInfo => ({ id, name: id, kind: 'melodic', index, noteCount: 1 })

const note = (id: string, trackId: string, time: number): NoteEvent => ({
  id,
  trackId,
  trackKind: 'melodic',
  time,
  duration: 0.5,
  pitch: 60,
  velocity: 1,
  chordSize: 1,
})

/** Builds an engine where every role is a fake, so we can watch how the pipeline is wired. */
function setup() {
  let now = 0
  const songNotes = [note('a', 'lead', 1), note('b', 'bass', 1)]
  const song: Song = { name: 'demo', duration: 10, tracks: [track('lead', 0), track('bass', 1)], notes: songNotes }

  const source = { collect: vi.fn(() => songNotes), reset: vi.fn() }
  const sound = { play: vi.fn(), reset: vi.fn(), dispose: vi.fn() }
  const mapper = { map: (n: NoteEvent) => ({ noteId: n.id }) as FireworkSpec }
  const simulation = { spawn: vi.fn(), step: vi.fn(), state: vi.fn(), reset: vi.fn(), setAspect: vi.fn() }
  const keyboard: LiveInput = { collect: () => [], reset: vi.fn(), dispose: vi.fn(), octave: 4, enabled: false }
  const transport = { now: () => now, play: vi.fn(async () => {}), pause: vi.fn(), seek: vi.fn((t: number) => (now = t)) }

  const deps: EngineDeps = {
    transport,
    keyboard,
    simulation,
    liveTrack: track('live', -1),
    createScreen: vi.fn(),
    parseSong: () => song,
    createSongParts: (s): SongParts =>
      s.notes.length ? { source, mapper, sound } : { source: { collect: () => [], reset: () => {} }, mapper, sound },
    trackColor: () => ({ h: 0, s: 0, l: 0 }),
  }

  const engine = new Engine(deps)
  engine.load(new ArrayBuffer(0), 'demo.mid')
  return { engine, source, sound, simulation, transport, keyboard, setNow: (t: number) => (now = t) }
}

describe('Engine', () => {
  it('sends every collected note to the sound and, mapped, to the simulation', () => {
    const { engine, sound, simulation, setNow } = setup()
    setNow(0.5)
    engine.update()

    expect(sound.play).toHaveBeenCalledTimes(2)
    expect(simulation.spawn).toHaveBeenCalledWith({ noteId: 'a' })
    expect(simulation.spawn).toHaveBeenCalledWith({ noteId: 'b' })
  })

  it('steps the simulation over the frame window', () => {
    const { engine, simulation, setNow } = setup()
    setNow(0.5)
    engine.update()
    expect(simulation.step).toHaveBeenCalledWith({ from: 0, to: 0.5 })
  })

  it('drops notes of muted tracks from both sound and picture', () => {
    const { engine, sound, simulation } = setup()
    engine.toggleMute('bass')
    engine.update()

    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(simulation.spawn).toHaveBeenCalledTimes(1)
    expect(simulation.spawn).toHaveBeenCalledWith({ noteId: 'a' })
  })

  it('resets every stateful part on seek', () => {
    const { engine, source, sound, simulation, transport, keyboard } = setup()
    engine.seek(5)

    expect(transport.seek).toHaveBeenCalledWith(5)
    for (const part of [source, sound, simulation, keyboard]) expect(part.reset).toHaveBeenCalled()
  })

  it('accepts live keys only while playing', async () => {
    const { engine, keyboard } = setup()
    expect(keyboard.enabled).toBe(false)
    await engine.play()
    expect(keyboard.enabled).toBe(true)
    engine.pause()
    expect(keyboard.enabled).toBe(false)
  })
})
