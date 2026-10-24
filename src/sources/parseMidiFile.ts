import { Midi } from '@tonejs/midi'
import type { NoteEvent, Song, TrackInfo } from '@/core'
import { withChordSizes } from './chords'

/** Turns raw .mid bytes into a Song: track list + all notes sorted by time. */
export function parseMidiFile(buffer: ArrayBuffer, name: string): Song {
  const midi = new Midi(buffer)
  const tracks: TrackInfo[] = []
  const notes: NoteEvent[] = []

  midi.tracks
    .filter((track) => track.notes.length > 0)
    .forEach((track, index) => {
      const info: TrackInfo = {
        id: `track-${index}`,
        name: track.name || track.instrument.name || `Track ${index + 1}`,
        kind: track.instrument.percussion ? 'drums' : 'melodic',
        index,
        noteCount: track.notes.length,
      }
      tracks.push(info)

      const trackNotes = track.notes.map((note, noteIndex) => ({
        id: `${index}:${noteIndex}`,
        trackId: info.id,
        trackKind: info.kind,
        time: note.time,
        duration: note.duration,
        pitch: note.midi,
        velocity: note.velocity,
      }))
      notes.push(...withChordSizes(trackNotes))
    })

  if (notes.length === 0) throw new Error(`"${name}" contains no notes`)

  notes.sort((a, b) => a.time - b.time)
  return { name, duration: midi.duration, tracks, notes }
}
