import type { Seconds, Song } from '@/core'
import { FrameClock } from './FrameClock'
import { startFrameLoop } from './frameLoop'
import type { EngineDeps, EngineStatus, PlayState, Screen, SongParts } from './types'

const STATUS_INTERVAL_MS = 100

const EMPTY_SONG: Song = { name: '', duration: 0, tracks: [], notes: [] }

type Listener = (status: EngineStatus) => void

/**
 * Wires the pipeline together and drives it frame by frame:
 *   sources → mapper → simulation → renderer, with sound alongside.
 * It only knows the role contracts; concrete classes come from createEngine.
 */
export class Engine {
  private readonly deps: EngineDeps
  private readonly clock = new FrameClock()
  private readonly listeners = new Set<Listener>()
  private readonly muted = new Set<string>()
  private song: Song = EMPTY_SONG
  private parts: SongParts
  private screen?: Screen
  private stopLoop?: () => void
  private state: PlayState = 'idle'
  private warning?: string
  private error?: string
  private lastPublish = 0

  constructor(deps: EngineDeps) {
    this.deps = deps
    this.parts = deps.createSongParts(EMPTY_SONG)
    deps.keyboard.enabled = false
  }

  /** One frame: move the world to "now", add the notes that became due, draw. */
  update(): void {
    const window = this.clock.advance(this.deps.transport.now())
    this.deps.simulation.step(window)

    for (const source of [this.parts.source, this.deps.keyboard]) {
      for (const note of source.collect(window)) {
        if (this.muted.has(note.trackId)) continue
        this.parts.sound.play(note)
        this.deps.simulation.spawn(this.parts.mapper.map(note))
      }
    }

    this.screen?.render(this.deps.simulation.state())
    this.publish()
  }

  attach(canvas: HTMLCanvasElement): void {
    this.stopLoop?.()
    this.screen = this.deps.createScreen(canvas)
    this.stopLoop = startFrameLoop(() => this.update())
  }

  resize(cssWidth: number, cssHeight: number, dpr: number): void {
    if (!this.screen || cssWidth === 0 || cssHeight === 0) return
    this.deps.simulation.setAspect(this.screen.resize(cssWidth, cssHeight, dpr))
  }

  load(buffer: ArrayBuffer, name: string): void {
    let song: Song
    try {
      song = this.deps.parseSong(buffer, name)
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error)
      this.publish(true)
      return
    }

    this.stop()
    this.parts.sound.dispose()
    this.song = song
    this.parts = this.deps.createSongParts(song)
    this.muted.clear()
    this.error = undefined
    this.warning = song.tracks.length < 2 ? `"${name}" has only ${song.tracks.length} track — the lab asks for at least 2.` : undefined
    this.publish(true)
  }

  async play(): Promise<void> {
    await this.deps.transport.play()
    this.setState('playing')
  }

  pause(): void {
    this.deps.transport.pause()
    this.setState('paused')
  }

  stop(): void {
    this.deps.transport.pause()
    this.seek(0)
    this.setState('idle')
  }

  /** Jumps to a song time: every stateful part starts over from there. */
  seek(time: Seconds): void {
    this.deps.transport.seek(time)
    this.clock.reset(time)
    this.parts.source.reset()
    this.parts.sound.reset()
    this.deps.keyboard.reset()
    this.deps.simulation.reset()
    this.screen?.clear()
    this.publish(true)
  }

  toggleMute(trackId: string): void {
    if (this.muted.has(trackId)) this.muted.delete(trackId)
    else this.muted.add(trackId)
    this.publish(true)
  }

  setShowLabels(show: boolean): void {
    if (this.screen) this.screen.showLabels = show
    this.publish(true)
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener(this.status())
    return () => this.listeners.delete(listener)
  }

  status(): EngineStatus {
    const { deps, song } = this
    const now = deps.transport.now()
    return {
      state: this.state,
      time: song.duration > 0 ? Math.min(now, song.duration) : now,
      duration: song.duration,
      songName: song.name,
      tracks: [...song.tracks, deps.liveTrack].map((track) => ({
        ...track,
        color: deps.trackColor(track),
        muted: this.muted.has(track.id),
      })),
      octave: deps.keyboard.octave,
      showLabels: this.screen?.showLabels ?? false,
      warning: this.warning,
      error: this.error,
    }
  }

  dispose(): void {
    this.stopLoop?.()
    this.deps.transport.pause()
    this.deps.keyboard.dispose()
    this.parts.sound.dispose()
    this.listeners.clear()
  }

  private setState(state: PlayState): void {
    this.state = state
    this.deps.keyboard.enabled = state === 'playing'
    this.publish(true)
  }

  /** Sends status to the UI: immediately on changes, otherwise at most every 100 ms. */
  private publish(force = false): void {
    const now = performance.now()
    if (!force && now - this.lastPublish < STATUS_INTERVAL_MS) return
    this.lastPublish = now
    const status = this.status()
    this.listeners.forEach((listener) => listener(status))
  }
}
