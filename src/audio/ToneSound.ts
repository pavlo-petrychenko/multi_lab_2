import * as Tone from 'tone'
import type { Disposable, NoteEvent, Sound, TrackInfo } from '@/core'
import { MASTER_VOLUME_DB, SCHEDULE_EPSILON } from './config'
import { createInstrument, type Instrument } from './instruments'

export interface ToneSoundOptions {
  /** One instrument is created per track (include the live track to hear the keyboard). */
  tracks: readonly TrackInfo[]
}

/**
 * Plays notes with Tone.js synths. Future notes are scheduled on the transport,
 * so they pause, resume and stay in sync with the song clock.
 */
export class ToneSound implements Sound, Disposable {
  private readonly transport = Tone.getTransport()
  private readonly output = new Tone.Volume(MASTER_VOLUME_DB).toDestination()
  private readonly instruments: ReadonlyMap<string, Instrument>

  constructor({ tracks }: ToneSoundOptions) {
    this.instruments = new Map(tracks.map((track) => [track.id, createInstrument(track, this.output)]))
  }

  play(note: NoteEvent): void {
    const instrument = this.instruments.get(note.trackId)
    if (!instrument) return

    if (note.time > this.transport.seconds + SCHEDULE_EPSILON) {
      this.transport.scheduleOnce((time) => instrument.trigger(note, time), note.time)
    } else {
      instrument.trigger(note, Tone.now())
    }
  }

  reset(): void {
    this.transport.cancel(0)
    this.instruments.forEach((instrument) => instrument.releaseAll())
  }

  dispose(): void {
    this.reset()
    this.instruments.forEach((instrument) => instrument.dispose())
    this.output.dispose()
  }
}
