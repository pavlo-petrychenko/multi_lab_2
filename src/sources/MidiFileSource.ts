import type { NoteEvent, NoteSource, Seconds, Song, TimeWindow } from '@/core'
import { LAUNCH_LEAD } from './config'

export interface MidiFileSourceOptions {
  song: Song
  lead?: Seconds
}

/**
 * Hands out the song's notes `lead` seconds before they sound,
 * so rockets have time to fly up and burst exactly on the note.
 */
export class MidiFileSource implements NoteSource {
  private readonly notes: readonly NoteEvent[]
  private readonly lead: Seconds
  /** False right after creation or reset: the next window also covers the first `lead` seconds. */
  private primed = false

  constructor({ song, lead = LAUNCH_LEAD }: MidiFileSourceOptions) {
    this.notes = song.notes
    this.lead = lead
  }

  collect({ from, to }: TimeWindow): NoteEvent[] {
    // Normal frame: notes whose launch time (time − lead) falls in (from, to].
    // First frame after reset: everything from `from` on, so no note in the lead gap is lost.
    const start = this.primed
      ? indexAfter(this.notes, from + this.lead)
      : indexAtOrAfter(this.notes, from)
    const end = indexAfter(this.notes, to + this.lead)
    this.primed = true
    return this.notes.slice(start, end)
  }

  reset(): void {
    this.primed = false
  }
}

/** First index whose note time is > t (binary search over sorted notes). */
function indexAfter(notes: readonly NoteEvent[], t: Seconds): number {
  return search(notes, (time) => time > t)
}

/** First index whose note time is >= t. */
function indexAtOrAfter(notes: readonly NoteEvent[], t: Seconds): number {
  return search(notes, (time) => time >= t)
}

function search(notes: readonly NoteEvent[], isRight: (time: Seconds) => boolean): number {
  let lo = 0
  let hi = notes.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (isRight(notes[mid].time)) hi = mid
    else lo = mid + 1
  }
  return lo
}
