import type {
  Disposable,
  FireworkScene,
  FireworkSpec,
  Hsl,
  NoteMapper,
  NoteSource,
  Renderer,
  Seconds,
  Simulation,
  Song,
  Sound,
  Transport,
  TrackInfo,
} from '@/core'

/** The per-song pipeline pieces, rebuilt every time a song is loaded. */
export interface SongParts {
  source: NoteSource
  mapper: NoteMapper<FireworkSpec>
  sound: Sound & Disposable
}

/** Live input on top of the NoteSource contract. */
export interface LiveInput extends NoteSource, Disposable {
  readonly octave: number
  enabled: boolean
}

/** A renderer that also owns a screen. */
export interface Screen extends Renderer<FireworkScene> {
  /** Returns the new aspect ratio (width / height). */
  resize(cssWidth: number, cssHeight: number, dpr: number): number
  showLabels: boolean
  clear(): void
}

export interface FireworkWorld extends Simulation<FireworkSpec, FireworkScene> {
  setAspect(aspect: number): void
}

/** Everything the engine needs, injected by createEngine (or by fakes in tests). */
export interface EngineDeps {
  transport: Transport
  keyboard: LiveInput
  simulation: FireworkWorld
  liveTrack: TrackInfo
  createScreen(canvas: HTMLCanvasElement): Screen
  parseSong(buffer: ArrayBuffer, name: string): Song
  createSongParts(song: Song): SongParts
  trackColor(track: TrackInfo): Hsl
}

export type PlayState = 'idle' | 'playing' | 'paused'

export interface TrackStatus extends TrackInfo {
  color: Hsl
  muted: boolean
}

/** What the UI shows. Published about 10 times a second and on every change. */
export interface EngineStatus {
  state: PlayState
  time: Seconds
  duration: Seconds
  songName: string
  tracks: TrackStatus[]
  octave: number
  showLabels: boolean
  warning?: string
  error?: string
}
