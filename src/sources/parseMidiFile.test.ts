import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseMidiFile } from './parseMidiFile'

describe('parseMidiFile', () => {
  const bytes = readFileSync(new URL('../../songs/demo.mid', import.meta.url))
  const song = parseMidiFile(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), 'demo.mid')

  it('reads the demo song with its three tracks', () => {
    expect(song.tracks.map((t) => [t.name, t.kind])).toEqual([
      ['Lead', 'melodic'],
      ['Bass', 'melodic'],
      ['Drums', 'drums'],
    ])
  })

  it('returns all notes sorted by time', () => {
    const times = song.notes.map((n) => n.time)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(song.notes.length).toBe(song.tracks.reduce((sum, t) => sum + t.noteCount, 0))
  })

  it('rejects files without notes', () => {
    expect(() => parseMidiFile(new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 0, 0, 96]).buffer, 'empty.mid')).toThrow()
  })
})
