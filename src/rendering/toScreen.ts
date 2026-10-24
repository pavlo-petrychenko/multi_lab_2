/** Converts world coordinates (y up, 1 = sky height) to canvas pixels (y down). */
export type ToScreen = (x: number, y: number) => [number, number]

export function createToScreen(skyHeightPx: number): ToScreen {
  return (x, y) => [x * skyHeightPx, (1 - y) * skyHeightPx]
}

export function hsla({ h, s, l }: { h: number; s: number; l: number }, alpha: number): string {
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}
