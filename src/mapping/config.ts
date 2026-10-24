/** Pitch range that is spread over the sky; notes outside are clamped. */
export const PITCH_LOW = 36 // C2
export const PITCH_HIGH = 96 // C7

/** Burst heights (world units, 0 = ground, 1 = top of the sky). */
export const HEIGHT_LOW = 0.35
export const HEIGHT_HIGH = 0.9
/** Drums burst just above the skyline's rooftops. */
export const GROUND_HEIGHT = 0.1

/** Share of a lane's width that pitch may shift a burst sideways. */
export const LANE_SPREAD = 0.7
/** Live keyboard notes use the whole sky width minus this margin on each side. */
export const LIVE_MARGIN = 0.1

export const PARTICLES_BASE = 30
export const PARTICLES_PER_VELOCITY = 90

export const RADIUS_BASE = 0.08
export const RADIUS_PER_VELOCITY = 0.12

export const LIGHTNESS_BASE = 50
export const LIGHTNESS_PER_VELOCITY = 20

export const LIFETIME_BASE = 0.6
export const LIFETIME_PER_SECOND = 1.2
export const LIFETIME_MIN = 0.6
export const LIFETIME_MAX = 3.0

/** Notes at least this long burst as a drooping willow. */
export const WILLOW_MIN_DURATION = 0.8
/** Notes at most this long burst as a crossette (stars that split in two). */
export const CROSSETTE_MAX_DURATION = 0.25
/** Chords of at least this many notes burst as rings. */
export const RING_MIN_CHORD = 3

/** Notes at least this loud glitter and strobe. */
export const SPARKLE_MIN_VELOCITY = 0.85

/** Notes louder than this light up the sky; full flash at velocity 1. */
export const FLASH_MIN_VELOCITY = 0.7
export const FLASH_MAX = 0.3
/** Extra flash for every chord note, so chords hit harder. */
export const FLASH_CHORD_BONUS = 0.08

/** Screen shake (CSS px) of a kick drum at full velocity. */
export const KICK_SHAKE = 5
