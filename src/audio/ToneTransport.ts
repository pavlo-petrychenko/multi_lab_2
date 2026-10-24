import * as Tone from 'tone'
import type { Seconds, Transport } from '@/core'
import { LOOK_AHEAD } from './config'

/** Tone.js transport as the app's only clock: song time in seconds. */
export class ToneTransport implements Transport {
  private readonly transport = Tone.getTransport()

  constructor() {
    Tone.getContext().lookAhead = LOOK_AHEAD
  }

  now(): Seconds {
    return this.transport.seconds
  }

  async play(): Promise<void> {
    await Tone.start() // browsers only allow audio after a user gesture
    this.transport.start()
  }

  pause(): void {
    this.transport.pause()
  }

  seek(time: Seconds): void {
    this.transport.seconds = time
  }
}
