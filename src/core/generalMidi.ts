/** General MIDI percussion note numbers (channel 10) — a shared domain standard, not logic. */
export const GM_DRUMS = {
  kick: [35, 36],
  snare: [38, 40],
  hiHat: [42, 44, 46],
  crash: [49, 57],
} as const

export type DrumName = keyof typeof GM_DRUMS | 'percussion'

/** Which drum a percussion pitch plays. */
export function drumOf(pitch: number): DrumName {
  for (const [name, pitches] of Object.entries(GM_DRUMS)) {
    if ((pitches as readonly number[]).includes(pitch)) return name as DrumName
  }
  return 'percussion'
}
