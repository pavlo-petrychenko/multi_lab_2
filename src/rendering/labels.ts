import type { LabelView } from '@/core'
import { LABEL_COLOR, LABEL_FONT_FAMILY, LABEL_FONT_SIZE } from './config'
import type { ToScreen } from './toScreen'

/** Note labels ("C5 · v96") above each burst — shows which MIDI event made it. */
export function drawLabels(ctx: CanvasRenderingContext2D, labels: readonly LabelView[], toScreen: ToScreen, scale: number): void {
  ctx.font = `600 ${LABEL_FONT_SIZE * scale}px ${LABEL_FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  for (const label of labels) {
    const [x, y] = toScreen(label.x, label.y)
    ctx.fillStyle = `rgba(${LABEL_COLOR}, ${label.alpha})`
    ctx.fillText(label.text, x, y)
  }
}
