import { describe, expect, it } from 'vitest'
import { MAX_OCTAVE, MIN_OCTAVE } from './config'
import { keyToPitch, shiftOctave } from './keymap'

describe('keymap', () => {
  it('maps the home row to a piano octave', () => {
    expect(keyToPitch('a', 4)).toBe(60) // C4
    expect(keyToPitch('w', 4)).toBe(61) // C#4
    expect(keyToPitch('k', 4)).toBe(72) // C5
    expect(keyToPitch('A', 4)).toBe(60)
  })

  it('shifts by octave', () => {
    expect(keyToPitch('a', 5)).toBe(72)
  })

  it('ignores unmapped keys', () => {
    expect(keyToPitch('q', 4)).toBeNull()
  })

  it('keeps the octave within range', () => {
    expect(shiftOctave(MAX_OCTAVE, 1)).toBe(MAX_OCTAVE)
    expect(shiftOctave(MIN_OCTAVE, -1)).toBe(MIN_OCTAVE)
  })
})
