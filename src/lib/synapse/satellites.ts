import { Vector3 } from 'three'
import { keepInside } from './brain'
import { createRandom } from './random'

export const SATELLITE_COUNT = 12
export const ATTACK = 0.05
export const DECAY_START = 0.35
export const DECAY_END = 0.95
export const TRAVEL = 0.1

const SEED = 7741
const MIN_RADIUS = 0.5
const RADIUS_SPAN = 0.5
const MIN_CYCLE = 4
const CYCLE_SPAN = 4
const OFFSET_SPAN = 8

interface SatelliteSlot {
  position: Vector3
  cycle: number
  offset: number
}

export function buildSatellites(center: Vector3): SatelliteSlot[] {
  const random = createRandom(SEED)
  return Array.from({ length: SATELLITE_COUNT }, () => {
    const direction = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize()
    const placed = keepInside(
      center.clone().addScaledVector(direction, MIN_RADIUS + random() * RADIUS_SPAN),
    )
    return {
      position: placed.sub(center),
      cycle: MIN_CYCLE + random() * CYCLE_SPAN,
      offset: random() * OFFSET_SPAN,
    }
  })
}
