# MIDI Fireworks

Lab 2, Variant 3 — **MIDI animation**. Every note of a MIDI file launches a firework over a night
city that bursts exactly on that note and is mirrored in the lake. Pitch, velocity, duration, chords
and track decide where, how big, how bright and what kind of burst it is; loud notes light up the
sky and kick drums shake the screen. You can also play along live on the computer keyboard.

Stack: Vite · React · TypeScript · Canvas 2D · Tone.js (sound + clock) · `@tonejs/midi` (parsing) · Vitest.

## Run

```bash
npm install        # Node ≥ 22 (see .node-version)
npm run dev        # open the printed URL and pick a song
npm test           # unit tests
npm run build      # type-check + production build
npm run demo:midi  # regenerate songs/demo.mid
```

## Controls

| Action | How |
|---|---|
| Load a song | Pick it from the song list (starts playing), **Open…** any `.mid`, or drag & drop one anywhere |
| Play / pause | **Play** button or <kbd>Space</kbd> |
| Seek | Drag the progress bar |
| Mute a track | Uncheck it in **Tracks** — removes its sound *and* its fireworks |
| Show which note made a burst | **Show note labels** (`C5 · v96`, `Kick · v80`) |
| Play live | <kbd>A</kbd>…<kbd>K</kbd> = white keys, <kbd>W</kbd> <kbd>E</kbd> <kbd>T</kbd> <kbd>Y</kbd> <kbd>U</kbd> = black keys, <kbd>Z</kbd>/<kbd>X</kbd> = octave, <kbd>Shift</kbd> = accent (works while playing) |

Pause freezes the whole scene — handy for pointing at a burst and its label.

## Adding songs

Every `.mid` / `.midi` file in the [`songs/`](songs) folder shows up in the song list; the file name
becomes the title (`gravity-falls-intro.mid` → *Gravity Falls Intro*). Fan-made MIDI covers of show
and anime intros work well — MuseScore and similar sites have plenty. Most of those themes are
copyrighted, so keep them for personal use and out of public repositories.

Files with one track per instrument work best: each track gets its own lane and color, and a
drum track on channel 10 turns into rooftop bursts. Single-track (type 0) files are split by channel
automatically.

## How MIDI drives the animation

All rules live in [`src/mapping/rules.ts`](src/mapping/rules.ts), one pure function per rule.

| MIDI data | Animation parameter | Rule |
|---|---|---|
| Note on (time) | **When** the burst happens | The rocket launches 1 s early and bursts exactly at the note time |
| Pitch | **Burst height** | pitch 36…96 → 35 %…90 % of the sky (linear, clamped) |
| Pitch | **Horizontal offset** inside the track's lane | low = left, high = right |
| Track | **Lane** on screen and **color** | n tracks → n equal lanes; one hue per track |
| Velocity | **Size** | particles `30 + 90·v`, radius `0.08 + 0.12·v` |
| Velocity | **Brightness** | lightness `50 % + 20 %·v` |
| Velocity | **Glitter** | v ≥ 0.85 → sparks strobe white-hot before fading |
| Velocity + chord | **Sky flash** | v > 0.7 lights up the sky (and the city walls); chords flash harder |
| Duration | **Spark lifetime** | `clamp(0.6 + 1.2·d, 0.6, 3)` s |
| Chord + duration | **Burst type** | 3+ notes together → *ring*; ≥ 0.8 s → *willow* (drooping trails); ≤ 0.25 s → *crossette* (stars split in four); otherwise *peony* (round) |
| Drum track (channel 10) | **Rooftop burst**, no rocket | kick in lane centre, snare left, hi-hats right |
| Kick drum | **Screen shake** | strength = velocity |
| Keyboard notes | Whole sky width by pitch, white-gold color | same rules otherwise |

The bundled `songs/demo.mid` (3 tracks — Lead, Bass, Drums) is built to show each rule: a wide lead
range, low bass, staccato (crossette) vs. held (willow) notes, a chord finale (rings), and velocity
rising from 0.4 to 1.0 so glitter and sky flashes kick in towards the end.

### The timing trick

The source hands each note to the pipeline `LAUNCH_LEAD` = 1 s early. The simulation then launches the
rocket with exactly the speed needed to reach the burst height `h` in the remaining time `T`:

```
y(T) = v0·T − ½·g·T² = h   ⇒   v0 = h/T + g·T/2
```

([`src/simulation/physics.ts`](src/simulation/physics.ts)). So the burst happens at the note time,
which is also when Tone.js plays the note — both read the same clock.

## Architecture

```
 .mid ─▶ MidiFileSource ─┐
                         ├─ NoteEvent ─▶ FireworkMapper ─ FireworkSpec ─▶ FireworkSimulation ─ FireworkScene ─▶ CanvasRenderer
 keys ─▶ KeyboardSource ─┘      └──────▶ ToneSound
                ToneTransport.now() is the single clock · Engine.update() runs this once per frame
```

### Six roles, one contract each

Every folder implements exactly one role from [`src/core/contracts.ts`](src/core/contracts.ts):

| Role | Interface | Methods | Implementation | Folder |
|---|---|---|---|---|
| Source | `NoteSource` | `collect(window)`, `reset()` | `MidiFileSource`, `KeyboardSource` | `sources/` |
| Mapper | `NoteMapper<T>` | `map(note)` | `FireworkMapper` | `mapping/` |
| Simulation | `Simulation<TSpec, TState>` | `spawn`, `step`, `state`, `reset` | `FireworkSimulation` | `simulation/` |
| Renderer | `Renderer<TState>` | `render(state)` | `CanvasRenderer` | `rendering/` |
| Sound | `Sound` | `play(note)`, `reset()` | `ToneSound` | `audio/` |
| Transport | `Transport` | `now`, `play`, `pause`, `seek` | `ToneTransport` | `audio/` |

The whole program, from [`src/engine/Engine.ts`](src/engine/Engine.ts):

```ts
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
}
```

### Conventions

- Implementations are named `<Technology or feature><Role>`. A class file is named after its class.
- Helper files are camelCase and contain pure functions only (`rules.ts`, `physics.ts`, `keymap.ts`).
- Each folder has `config.ts` (tunable `UPPER_SNAKE` constants) and `index.ts` (its public API, nothing else).
- `reset()` clears state, `dispose()` releases resources.
- Each library is used in one folder only: Tone.js in `audio/`, `@tonejs/midi` in `sources/`, Canvas in `rendering/`, React in `ui/`.
- Scenery (stars, skyline, lake) is pure decoration and lives only in `rendering/`; the simulation knows nothing about it.

### Import rules

- Role folders import only from `core/`, never from each other.
- Only `engine/createEngine.ts` picks the concrete classes. `Engine` itself sees only interfaces, so the tests can swap every role for a fake ([`Engine.test.ts`](src/engine/Engine.test.ts)).
- `ui/` talks only to `Engine`. React renders the controls; the canvas loop runs outside React.

### Folder map

```
src/
  core/        types.ts · contracts.ts · generalMidi.ts      shared language, no dependencies
  sources/     MidiFileSource · KeyboardSource · parseMidiFile · chords · keymap
  mapping/     FireworkMapper · rules · palettes             MIDI → visual rules
  simulation/  FireworkSimulation · physics · bursts         rockets, particles, flash, shake
  rendering/   CanvasRenderer · sky · stars · skyline · water · flash · rockets · particles · labels
  audio/       ToneTransport · ToneSound · instruments
  engine/      Engine · createEngine · FrameClock · frameLoop
  ui/          App · songLibrary · components/* · hooks/useEngine
songs/                     the song list (drop .mid files here)
scripts/make-demo-midi.ts → songs/demo.mid
```

Suggested order for reading or presenting the code:
`core → sources → mapping → simulation → rendering → audio → engine → ui`.
