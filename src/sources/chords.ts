import type { NoteEvent } from '@/core'
import { CHORD_WINDOW } from './config'

/**
 * Fills in `chordSize` for the notes of ONE track: notes that start within
 * CHORD_WINDOW of the first note of a group belong to the same chord.
 */
export function withChordSizes(notes: Omit<NoteEvent, 'chordSize'>[]): NoteEvent[] {
  const sorted = [...notes].sort((a, b) => a.time - b.time)
  const result: NoteEvent[] = []

  let start = 0
  while (start < sorted.length) {
    let end = start + 1
    while (end < sorted.length && sorted[end].time - sorted[start].time <= CHORD_WINDOW) end++
    for (let i = start; i < end; i++) result.push({ ...sorted[i], chordSize: end - start })
    start = end
  }
  return result
}
