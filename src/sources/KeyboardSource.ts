import type { Disposable, NoteEvent, NoteSource, TimeWindow, TrackInfo } from '@/core'
import {
  DEFAULT_OCTAVE,
  LIVE_ACCENT_VELOCITY,
  LIVE_DURATION,
  LIVE_TRACK_ID,
  LIVE_VELOCITY,
} from './config'
import { keyToPitch, OCTAVE_DOWN_KEY, OCTAVE_UP_KEY, shiftOctave } from './keymap'

export interface KeyboardSourceOptions {
  target?: Window
}

/** The pseudo-track that all keyboard notes belong to. */
export const LIVE_TRACK: TrackInfo = {
  id: LIVE_TRACK_ID,
  name: 'Keyboard',
  kind: 'live',
  index: -1,
  noteCount: 0,
}

interface PendingKey {
  pitch: number
  velocity: number
}

/**
 * Live notes from the computer keyboard. Key presses are buffered and handed out
 * on the next frame, stamped with that frame's time — same contract as a file source.
 */
export class KeyboardSource implements NoteSource, Disposable {
  private readonly target: Window
  private pending: PendingKey[] = []
  private counter = 0
  private currentOctave = DEFAULT_OCTAVE
  /** While disabled (e.g. paused), key presses are ignored. */
  enabled = true

  constructor({ target = window }: KeyboardSourceOptions = {}) {
    this.target = target
    this.target.addEventListener('keydown', this.onKeyDown)
  }

  get octave(): number {
    return this.currentOctave
  }

  collect({ to }: TimeWindow): NoteEvent[] {
    const notes = this.pending.map(({ pitch, velocity }) => ({
      id: `live:${this.counter++}`,
      trackId: LIVE_TRACK_ID,
      trackKind: 'live' as const,
      time: to,
      duration: LIVE_DURATION,
      pitch,
      velocity,
      chordSize: 1,
    }))
    this.pending = []
    return notes
  }

  reset(): void {
    this.pending = []
  }

  dispose(): void {
    this.target.removeEventListener('keydown', this.onKeyDown)
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat || event.metaKey || event.ctrlKey || isTyping(event.target)) return
    const key = event.key.toLowerCase()

    if (key === OCTAVE_DOWN_KEY) this.currentOctave = shiftOctave(this.currentOctave, -1)
    if (key === OCTAVE_UP_KEY) this.currentOctave = shiftOctave(this.currentOctave, +1)

    const pitch = keyToPitch(key, this.currentOctave)
    if (pitch === null || !this.enabled) return
    this.pending.push({ pitch, velocity: event.shiftKey ? LIVE_ACCENT_VELOCITY : LIVE_VELOCITY })
  }
}

function isTyping(target: EventTarget | null): boolean {
  return (
    (target instanceof HTMLInputElement && target.type === 'text') ||
    target instanceof HTMLTextAreaElement
  )
}
