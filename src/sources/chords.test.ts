import { describe, expect, it } from 'vitest'
import { withChordSizes } from './chords'

const at = (time: number, id = String(time)) => ({
  id,
  trackId: 't',
  trackKind: 'melodic' as const,
  time,
  duration: 0.5,
  pitch: 60,
  velocity: 1,
})

describe('withChordSizes', () => {
  it('marks single notes as size 1', () => {
    expect(withChordSizes([at(0), at(1)]).map((n) => n.chordSize)).toEqual([1, 1])
  })

  it('groups notes that start together into one chord', () => {
    const notes = withChordSizes([at(0, 'a'), at(0.01, 'b'), at(0.02, 'c'), at(1, 'd')])
    expect(notes.map((n) => [n.id, n.chordSize])).toEqual([
      ['a', 3],
      ['b', 3],
      ['c', 3],
      ['d', 1],
    ])
  })
})
