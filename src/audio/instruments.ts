import * as Tone from 'tone'
import { drumOf, type NoteEvent, type TrackInfo } from '@/core'
import { MELODIC_WAVES } from './config'

/** Something that can sound a note at an audio-context time. */
export interface Instrument {
  trigger(note: NoteEvent, time: number): void
  releaseAll(): void
  dispose(): void
}

/** Picks a synth by track kind: melodic tracks, a drum kit, or the live keyboard bell. */
export function createInstrument(track: TrackInfo, output: Tone.ToneAudioNode): Instrument {
  if (track.kind === 'drums') return createDrumKit(output)
  if (track.kind === 'live') return createPolyInstrument(new Tone.PolySynth(Tone.FMSynth, { harmonicity: 3, modulationIndex: 8 }), output)

  const wave = MELODIC_WAVES[track.index % MELODIC_WAVES.length]
  return createPolyInstrument(
    new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: wave },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.4 },
      volume: wave === 'sawtooth' || wave === 'square' ? -10 : 0,
    }),
    output,
  )
}

function createPolyInstrument(synth: Tone.PolySynth, output: Tone.ToneAudioNode): Instrument {
  synth.connect(output)
  return {
    trigger: (note, time) =>
      synth.triggerAttackRelease(Tone.Frequency(note.pitch, 'midi').toFrequency(), note.duration, time, note.velocity),
    releaseAll: () => synth.releaseAll(),
    dispose: () => synth.dispose(),
  }
}

/** General MIDI drums: kick, snare and hi-hat synths; other percussion becomes a short noise hit. */
function createDrumKit(output: Tone.ToneAudioNode): Instrument {
  const kick = new Tone.MembraneSynth({ volume: -2 }).connect(output)
  const snare = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.15, sustain: 0 }, volume: -8 }).connect(output)
  const hat = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, volume: -22 }).connect(output)
  const perc = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.05, sustain: 0 }, volume: -14 }).connect(output)

  const hit = (play: () => void) => {
    try {
      play()
    } catch {
      // Monophonic drum synths reject two hits at the very same time — dropping one is inaudible.
    }
  }

  return {
    trigger: ({ pitch, velocity }, time) => {
      switch (drumOf(pitch)) {
        case 'kick':
          return hit(() => kick.triggerAttackRelease('C1', '8n', time, velocity))
        case 'snare':
          return hit(() => snare.triggerAttackRelease('16n', time, velocity))
        case 'hiHat':
          return hit(() => hat.triggerAttackRelease('C6', '32n', time, velocity))
        case 'crash':
          return hit(() => hat.triggerAttackRelease('C5', '2n', time, velocity))
        case 'percussion':
          return hit(() => perc.triggerAttackRelease('32n', time, velocity))
      }
    },
    releaseAll: () => {
      kick.triggerRelease()
      snare.triggerRelease()
      hat.triggerRelease()
      perc.triggerRelease()
    },
    dispose: () => [kick, snare, hat, perc].forEach((synth) => synth.dispose()),
  }
}
