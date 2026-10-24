import type { Seconds, TimeWindow } from '@/core'

/** Turns successive clock readings into frame windows (from, to]. */
export class FrameClock {
  private last: Seconds

  constructor(start: Seconds = 0) {
    this.last = start
  }

  advance(now: Seconds): TimeWindow {
    const from = Math.min(this.last, now) // time never runs backwards inside a frame
    this.last = now
    return { from, to: now }
  }

  reset(time: Seconds): void {
    this.last = time
  }
}
