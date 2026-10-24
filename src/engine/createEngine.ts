import { ToneSound, ToneTransport } from '@/audio'
import { FireworkMapper, trackColor } from '@/mapping'
import { CanvasRenderer } from '@/rendering'
import { FireworkSimulation } from '@/simulation'
import { KeyboardSource, LIVE_TRACK, MidiFileSource, parseMidiFile } from '@/sources'
import { Engine } from './Engine'

/** Composition root — the only place that picks the concrete class for every role. */
export function createEngine(): Engine {
  return new Engine({
    transport: new ToneTransport(),
    keyboard: new KeyboardSource(),
    simulation: new FireworkSimulation(),
    liveTrack: LIVE_TRACK,
    createScreen: (canvas) => new CanvasRenderer({ canvas }),
    parseSong: parseMidiFile,
    createSongParts: (song) => ({
      source: new MidiFileSource({ song }),
      mapper: new FireworkMapper({ tracks: song.tracks }),
      sound: new ToneSound({ tracks: [...song.tracks, LIVE_TRACK] }),
    }),
    trackColor,
  })
}
