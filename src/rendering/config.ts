/** Night sky gradient, top to bottom. */
export const SKY_TOP = '5, 6, 20'
export const SKY_BOTTOM = '18, 16, 40'

/** Opacity of the sky painted over each frame: lower = longer motion trails. */
export const TRAIL_FADE = 0.22

export const ROCKET_SIZE = 2.4
export const LABEL_FONT_SIZE = 12
export const LABEL_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, monospace'
export const LABEL_COLOR = '255, 255, 255'

/** Lake below the horizon (CSS px) — also keeps the skyline above the bottom controls. */
export const WATER_HEIGHT_PX = 150
/** How much sky one row of water mirrors (> 1 squashes the reflection like perspective). */
export const REFLECTION_STRETCH = 2.5
export const REFLECTION_SLICE_PX = 2
export const WATER_TOP = '6, 8, 28'
export const WATER_BOTTOM = '2, 3, 12'

export const SKYLINE_SEED = 7
/** Building heights as a share of the sky height. */
export const SKYLINE_MIN_HEIGHT = 0.02
export const SKYLINE_MAX_HEIGHT = 0.085
export const SKYLINE_COLOR = '#05061a'
export const WINDOW_COLOR = 'rgba(255, 205, 130, 0.75)'
export const WINDOW_LIT_SHARE = 0.22

export const STAR_SEED = 3
/** One star per this many square CSS px of sky. */
export const STAR_DENSITY = 2600

/** Opacity of a full-strength sky flash, per frame (it adds up with the trail fade). */
export const FLASH_ALPHA = 0.12
