import type { FireworkSpec, NoteEvent, NoteMapper, TrackInfo } from '@/core'
import { trackColor } from './palettes'
import {
  burstFlash,
  burstHeight,
  burstKind,
  burstShake,
  durationToLifetime,
  laneX,
  noteColor,
  noteLabel,
  velocityToParticleCount,
  velocityToRadius,
  velocityToSparkle,
} from './rules'

export interface FireworkMapperOptions {
  /** The song's tracks; their order defines the lanes. */
  tracks: readonly TrackInfo[]
}

/** Combines the rules into one FireworkSpec per note. */
export class FireworkMapper implements NoteMapper<FireworkSpec> {
  private readonly tracks: ReadonlyMap<string, TrackInfo>
  private readonly laneCount: number

  constructor({ tracks }: FireworkMapperOptions) {
    this.tracks = new Map(tracks.map((track) => [track.id, track]))
    this.laneCount = Math.max(1, tracks.length)
  }

  map(note: NoteEvent): FireworkSpec {
    const track = this.trackOf(note)
    return {
      noteId: note.id,
      burstAt: note.time,
      burst: burstKind(note),
      x: laneX(note, { index: track.index, count: this.laneCount }),
      height: burstHeight(note),
      color: noteColor(trackColor(track), note.velocity),
      particleCount: velocityToParticleCount(note.velocity),
      radius: velocityToRadius(note.velocity),
      lifetime: durationToLifetime(note.duration),
      sparkle: velocityToSparkle(note.velocity),
      flash: burstFlash(note),
      shake: burstShake(note),
      label: noteLabel(note),
    }
  }

  private trackOf(note: NoteEvent): TrackInfo {
    return (
      this.tracks.get(note.trackId) ?? {
        id: note.trackId,
        name: note.trackId,
        kind: note.trackKind,
        index: 0,
        noteCount: 0,
      }
    )
  }
}
