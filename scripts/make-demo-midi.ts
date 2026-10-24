/**
 * Generates songs/demo.mid — a 3-track song built to show off every mapping rule:
 *   Lead  — wide pitch range (height), staccato vs. held notes (peony vs. willow)
 *   Bass  — low notes, so its bursts stay low
 *   Drums — kick / snare / hi-hat on channel 10 (ground bursts)
 * Velocity rises through the song, so bursts visibly grow and brighten.
 *
 * Run: npm run demo:midi
 */
import { writeFileSync } from 'node:fs'
import tonejsMidi from '@tonejs/midi'

const { Midi } = tonejsMidi // CommonJS package: no named ESM exports under Node

const BPM = 110
const BEAT = 60 / BPM
const BAR = 4 * BEAT
const LEAD_IN_BARS = 1 // silence first, so the first rockets get a full launch lead
const BARS = 16

/** Am – F – C – G: chord tones across several octaves, plus the bass root. */
const CHORDS = [
  { tones: [57, 60, 64, 69, 72, 76, 81, 84, 88], root: 33 }, // Am
  { tones: [53, 57, 60, 65, 69, 72, 77, 81, 84], root: 41 }, // F
  { tones: [55, 60, 64, 67, 72, 76, 79, 84, 88], root: 36 }, // C
  { tones: [55, 59, 62, 67, 71, 74, 79, 83, 86], root: 43 }, // G
]

const KICK = 36
const SNARE = 38
const HAT = 42
const CRASH = 49

const midi = new Midi()
midi.header.setTempo(BPM)
midi.header.name = 'MIDI Fireworks demo'

const lead = midi.addTrack()
lead.name = 'Lead'
lead.channel = 0
lead.instrument.number = 80 // square lead

const bass = midi.addTrack()
bass.name = 'Bass'
bass.channel = 1
bass.instrument.number = 33 // finger bass

const drums = midi.addTrack()
drums.name = 'Drums'
drums.channel = 9 // General MIDI percussion

/** 0.4 at the start → 1.0 at the end, plus an accent on downbeats. */
const velocityAt = (bar: number, accent = false) => Math.min(1, 0.4 + (0.6 * bar) / BARS + (accent ? 0.1 : 0))

for (let bar = 0; bar < BARS; bar++) {
  const start = (LEAD_IN_BARS + bar) * BAR
  const chord = CHORDS[bar % CHORDS.length]
  const phrase = Math.floor(bar / 4)
  const v = velocityAt(bar)

  // Lead: phrases alternate staccato arpeggios (peony) and held notes (willow).
  if (phrase % 2 === 0) {
    const shift = phrase === 2 ? 3 : 0 // third phrase climbs higher
    for (let step = 0; step < 8; step++) {
      const tone = chord.tones[Math.min(chord.tones.length - 1, shift + [0, 2, 4, 3, 5, 4, 2, 1][step])]
      lead.addNote({ midi: tone, time: start + (step * BEAT) / 2, duration: BEAT * 0.4, velocity: velocityAt(bar, step === 0) })
    }
  } else {
    lead.addNote({ midi: chord.tones[6], time: start, duration: BEAT * 2, velocity: v })
    lead.addNote({ midi: chord.tones[8], time: start + 2 * BEAT, duration: BEAT * 2, velocity: v })
  }

  // Bass: root on every beat.
  for (let beat = 0; beat < 4; beat++) {
    bass.addNote({ midi: chord.root + (beat === 2 ? 12 : 0), time: start + beat * BEAT, duration: BEAT * 0.9, velocity: velocityAt(bar, beat === 0) })
  }

  // Drums: kick on 1 and 3, snare on 2 and 4, hi-hats join in the second phrase.
  for (let beat = 0; beat < 4; beat++) {
    drums.addNote({ midi: beat % 2 === 0 ? KICK : SNARE, time: start + beat * BEAT, duration: BEAT / 4, velocity: v })
  }
  if (phrase >= 1) {
    for (let step = 0; step < 8; step++) {
      drums.addNote({ midi: HAT, time: start + (step * BEAT) / 2, duration: BEAT / 8, velocity: v * 0.7 })
    }
  }
}

// Finale: two bars of dense chords, ending on one long Am chord with a crash.
const finale = (LEAD_IN_BARS + BARS) * BAR
for (let beat = 0; beat < 4; beat++) {
  const chord = CHORDS[beat % CHORDS.length]
  for (const tone of [chord.tones[3], chord.tones[5], chord.tones[7]]) {
    lead.addNote({ midi: tone, time: finale + beat * BEAT, duration: BEAT * 0.5, velocity: 1 })
  }
  bass.addNote({ midi: chord.root, time: finale + beat * BEAT, duration: BEAT * 0.9, velocity: 1 })
  drums.addNote({ midi: KICK, time: finale + beat * BEAT, duration: BEAT / 4, velocity: 1 })
}
const last = finale + BAR
for (const tone of [CHORDS[0].tones[4], CHORDS[0].tones[6], CHORDS[0].tones[8]]) {
  lead.addNote({ midi: tone, time: last, duration: BAR, velocity: 1 })
}
bass.addNote({ midi: CHORDS[0].root, time: last, duration: BAR, velocity: 1 })
drums.addNote({ midi: KICK, time: last, duration: BEAT, velocity: 1 })
drums.addNote({ midi: CRASH, time: last, duration: BEAT, velocity: 1 })

const out = new URL('../songs/demo.mid', import.meta.url)
writeFileSync(out, new Uint8Array(midi.toArray()))
console.log(`Wrote ${out.pathname} — ${midi.tracks.length} tracks, ${midi.duration.toFixed(1)} s`)
