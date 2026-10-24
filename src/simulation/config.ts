/** Gravity in world units (sky heights) per second². */
export const GRAVITY = 1.0

/** Shortest possible rocket flight — used for live notes and notes right after a seek. */
export const MIN_FLIGHT = 0.25

/** Longest simulated step, so a frame after a background tab does not explode. */
export const MAX_STEP = 0.1

export const MAX_PARTICLES = 4000
export const LABEL_LIFETIME = 1.2

/** Burst particle speed per unit of burst radius. */
export const BURST_SPEED = 1.8

export const TRAIL_LIFETIME = 0.35
export const TRAIL_SIZE = 1.2

/** Sky flash fades by this much strength per second. */
export const FLASH_FADE = 1.2
/** Share of screen shake left after one second (it dies out fast). */
export const SHAKE_DECAY = 0.0005
/** Speed (sky heights / s) of the stars a crossette splits into. */
export const SPLIT_SPEED = 0.22
