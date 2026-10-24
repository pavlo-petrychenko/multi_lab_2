import type { NoteEvent, Seconds, TimeWindow } from './types'

/**
 * The six roles of the app. Every role folder implements exactly one of them,
 * and the engine talks to the folders only through these interfaces.
 */

/** What happens: produces the notes that are due within a time window. */
export interface NoteSource {
  collect(window: TimeWindow): NoteEvent[]
  reset(): void
}

/** How it should look: pure translation of a note into a visual spec. */
export interface NoteMapper<T> {
  map(note: NoteEvent): T
}

/** How it moves: a stateful, time-driven world. */
export interface Simulation<TSpec, TState> {
  spawn(spec: TSpec): void
  step(window: TimeWindow): void
  state(): TState
  reset(): void
}

/** How it is drawn. */
export interface Renderer<TState> {
  render(state: TState): void
}

/** How it sounds. */
export interface Sound {
  play(note: NoteEvent): void
  reset(): void
}

/** When: the single source of time for the whole app. */
export interface Transport {
  now(): Seconds
  /** Async because audio may only start after a user gesture. */
  play(): Promise<void>
  pause(): void
  seek(time: Seconds): void
}

export interface Disposable {
  dispose(): void
}
