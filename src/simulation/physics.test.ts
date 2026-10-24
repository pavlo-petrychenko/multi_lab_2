import { describe, expect, it } from 'vitest'
import { MIN_FLIGHT } from './config'
import { flightTime, launchVelocity, rocketHeight } from './physics'

describe('rocket physics', () => {
  it('reaches the target height exactly at the end of the flight', () => {
    for (const height of [0.35, 0.6, 0.9]) {
      for (const flight of [0.25, 1, 1.5]) {
        const v0 = launchVelocity(height, flight)
        expect(rocketHeight(v0, flight)).toBeCloseTo(height, 10)
      }
    }
  })

  it('starts on the ground', () => {
    expect(rocketHeight(launchVelocity(0.8, 1), 0)).toBe(0)
  })

  it('flies from launch until the note', () => {
    expect(flightTime(10, 11)).toBe(1)
  })

  it('never flies shorter than MIN_FLIGHT', () => {
    expect(flightTime(10, 10)).toBe(MIN_FLIGHT)
    expect(flightTime(10, 5)).toBe(MIN_FLIGHT)
  })
})
