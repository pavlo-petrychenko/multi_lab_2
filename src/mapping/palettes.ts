import type { Hsl, TrackInfo } from '@/core'

/** Well-separated hues, one per track (cycled when a song has more tracks). */
export const TRACK_HUES = [200, 330, 45, 140, 270, 15] as const

/** Live keyboard notes are white-gold so they stand apart from any song. */
export const LIVE_COLOR: Hsl = { h: 50, s: 40, l: 75 }

export const TRACK_SATURATION = 90
export const TRACK_LIGHTNESS = 60

/** Base color of a track — shared by the fireworks and the UI legend. */
export function trackColor(track: TrackInfo): Hsl {
  if (track.kind === 'live') return LIVE_COLOR
  const h = TRACK_HUES[track.index % TRACK_HUES.length]
  return { h, s: TRACK_SATURATION, l: TRACK_LIGHTNESS }
}
