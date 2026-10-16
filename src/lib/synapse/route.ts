import { MathUtils, Vector3, type CubicBezierCurve3 } from 'three'

const DENSITY = 28
const PASSES = 150
const CORNER_RADIUS = 1
const STEP = 0.02

interface Leg {
  curve: CubicBezierCurve3
  from: number
  to: number
}

export interface Route {
  length: number
  step: number
  count: number
  points: Float32Array
}

function sampleLegs(legs: Leg[]): { points: Vector3[]; corner: number } {
  const points: Vector3[] = []
  let corner = -1
  legs.forEach((leg, index) => {
    const length = leg.curve.getLength() * Math.abs(leg.to - leg.from)
    const count = Math.max(2, Math.ceil(length * DENSITY))
    for (let k = index === 0 ? 0 : 1; k <= count; k++) {
      points.push(leg.curve.getPointAt(MathUtils.lerp(leg.from, leg.to, k / count)))
    }
    if (index === 0 && legs.length > 1) corner = points.length - 1
  })
  return { points, corner }
}

function roundCorner(points: Vector3[], corner: number): void {
  if (corner < 0) return
  const radius = CORNER_RADIUS * DENSITY
  const weights = points.map((_, k) => 1 - MathUtils.smoothstep(Math.abs(k - corner), 0, radius))
  const previous = points.map((point) => point.clone())
  for (let pass = 0; pass < PASSES; pass++) {
    for (let k = 1; k < points.length - 1; k++) {
      if (weights[k] <= 0) continue
      previous[k].copy(points[k])
    }
    for (let k = 1; k < points.length - 1; k++) {
      if (weights[k] <= 0) continue
      const blurred = previous[k - 1]
        .clone()
        .add(previous[k + 1])
        .add(previous[k])
        .add(previous[k])
      points[k].lerp(blurred.multiplyScalar(0.25), weights[k])
    }
  }
}

export function buildRoute(legs: Leg[]): Route {
  const { points, corner } = sampleLegs(legs)
  roundCorner(points, corner)
  const cumulative = [0]
  for (let k = 1; k < points.length; k++) {
    cumulative.push(cumulative[k - 1] + points[k].distanceTo(points[k - 1]))
  }
  const length = cumulative[cumulative.length - 1]
  const count = Math.max(2, Math.ceil(length / STEP) + 1)
  const step = length / (count - 1)
  const resampled = new Float32Array(count * 3)
  const at = new Vector3()
  let segment = 0
  for (let k = 0; k < count; k++) {
    const arc = k * step
    while (segment < points.length - 2 && cumulative[segment + 1] < arc) segment++
    const span = cumulative[segment + 1] - cumulative[segment]
    const t = span > 0 ? MathUtils.clamp((arc - cumulative[segment]) / span, 0, 1) : 0
    at.lerpVectors(points[segment], points[segment + 1], t)
    at.toArray(resampled, k * 3)
  }
  return { length, step, count, points: resampled }
}

export function pointAt(route: Route, arc: number, out: Vector3): Vector3 {
  const f = MathUtils.clamp(arc, 0, route.length) / route.step
  const i = Math.min(Math.floor(f), route.count - 2)
  const t = f - i
  const p = route.points
  const o = i * 3
  return out.set(
    p[o] + (p[o + 3] - p[o]) * t,
    p[o + 1] + (p[o + 4] - p[o + 1]) * t,
    p[o + 2] + (p[o + 5] - p[o + 2]) * t,
  )
}

export function arcOf(route: Route, point: Vector3): number {
  const p = route.points
  let best = 0
  let bestDistance = Infinity
  for (let k = 0; k < route.count; k++) {
    const dx = p[k * 3] - point.x
    const dy = p[k * 3 + 1] - point.y
    const dz = p[k * 3 + 2] - point.z
    const distance = dx * dx + dy * dy + dz * dz
    if (distance < bestDistance) {
      bestDistance = distance
      best = k
    }
  }
  return best * route.step
}
