import { Vector3 } from 'three'
import { createRandom } from './random'

export const SATELLITE_COUNT = 14
export const LABELED_SATELLITES = 3
export const ATTACK = 0.05
export const DECAY_START = 0.35
export const DECAY_END = 0.95
export const TRAVEL = 0.1

const SEED = 7741
const LABELED_CYCLE = 6
const LABELED_VIEW_OFFSETS: [number, number, number][] = [
  [-1.5, 1.7, 0.8],
  [1.9, 1.9, 0.8],
  [-0.2, 2.5, 0.8],
]

export interface SatelliteSlot {
  position: Vector3
  cycle: number
  offset: number
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1)
  return x * x * (3 - 2 * x)
}

export function buildSatellites(viewDirection: Vector3): SatelliteSlot[] {
  const random = createRandom(SEED)
  const forward = viewDirection.clone().negate()
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize()
  const up = new Vector3().crossVectors(right, forward).normalize()
  return Array.from({ length: SATELLITE_COUNT }, (_, index) => {
    if (index < LABELED_SATELLITES) {
      const [x, y, z] = LABELED_VIEW_OFFSETS[index]
      return {
        position: right
          .clone()
          .multiplyScalar(x)
          .addScaledVector(up, y)
          .addScaledVector(viewDirection, z),
        cycle: LABELED_CYCLE,
        offset: (index * LABELED_CYCLE) / LABELED_SATELLITES,
      }
    }
    const direction = new Vector3(
      random() - 0.5,
      (random() - 0.5) * 0.7,
      random() - 0.5,
    ).normalize()
    return {
      position: direction.multiplyScalar(3 + random() * 1.8),
      cycle: 4 + random() * 4,
      offset: random() * 8,
    }
  })
}

export function satelliteAlpha(time: number, slot: SatelliteSlot): number {
  const life = ((time + slot.offset) / slot.cycle) % 1
  return smoothstep(0, ATTACK, life) * (1 - smoothstep(DECAY_START, DECAY_END, life))
}
