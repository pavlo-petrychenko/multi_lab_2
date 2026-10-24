/** How far ahead Tone.js schedules audio. Small, so the visual clock matches what is heard. */
export const LOOK_AHEAD = 0.05

export const MASTER_VOLUME_DB = -8

/** Notes due sooner than this are played immediately instead of being scheduled. */
export const SCHEDULE_EPSILON = 0.01

/** Oscillator per melodic track, cycled by track index. */
export const MELODIC_WAVES = ['triangle', 'sawtooth', 'square', 'sine'] as const
