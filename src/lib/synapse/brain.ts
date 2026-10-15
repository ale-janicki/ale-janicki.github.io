import { MathUtils, Vector3 } from 'three'
import { gaussian, type Random } from './random'

const FRONT_YAW = 0.18
const TOP_PITCH = 0.12
const FOLD_FREQUENCY = 4.2
const FISSURE_HALF_WIDTH = 0.3
const SURFACE_DEPTH = 0.12
const GYRUS_RELIEF = 0.07
const REJECTION_LIMIT = 60

const X_AXIS = new Vector3(1, 0, 0)
const Y_AXIS = new Vector3(0, 1, 0)

type Part = 'hemisphere' | 'temporal' | 'cerebellum' | 'stem'

interface Lobe {
  part: Part
  center: Vector3
  radii: Vector3
  weight: number
}

const LOBES: Lobe[] = [
  {
    part: 'hemisphere',
    center: new Vector3(0, 0.12, -0.68),
    radii: new Vector3(2.15, 1.4, 0.95),
    weight: 0.34,
  },
  {
    part: 'hemisphere',
    center: new Vector3(0, 0.12, 0.68),
    radii: new Vector3(2.15, 1.4, 0.95),
    weight: 0.34,
  },
  {
    part: 'temporal',
    center: new Vector3(-0.35, -0.82, -1.0),
    radii: new Vector3(1.15, 0.45, 0.55),
    weight: 0.07,
  },
  {
    part: 'temporal',
    center: new Vector3(-0.35, -0.82, 1.0),
    radii: new Vector3(1.15, 0.45, 0.55),
    weight: 0.07,
  },
  {
    part: 'cerebellum',
    center: new Vector3(1.35, -1.02, 0),
    radii: new Vector3(0.9, 0.58, 0.95),
    weight: 0.12,
  },
]
const CEREBRUM = LOBES.filter((lobe) => lobe.part !== 'cerebellum')
const CEREBELLUM = LOBES[LOBES.length - 1]
const STEM_WEIGHT = 0.08
const STEM_TOP = new Vector3(0.45, -1.1, 0)
const STEM_BOTTOM = new Vector3(0.8, -2.3, 0)

function lattice(ix: number, iy: number, iz: number): number {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(iz, 1274126177)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1
}

function noise(x: number, y: number, z: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = MathUtils.smoothstep(x - ix, 0, 1)
  const fy = MathUtils.smoothstep(y - iy, 0, 1)
  const fz = MathUtils.smoothstep(z - iz, 0, 1)
  const corner = (dx: number, dy: number, dz: number) => lattice(ix + dx, iy + dy, iz + dz)
  const lerpX = (dy: number, dz: number) => MathUtils.lerp(corner(0, dy, dz), corner(1, dy, dz), fx)
  const lerpY = (dz: number) => MathUtils.lerp(lerpX(0, dz), lerpX(1, dz), fy)
  return MathUtils.lerp(lerpY(0), lerpY(1), fz)
}

function sulcus(p: Vector3): number {
  const f = FOLD_FREQUENCY
  const wx = noise(p.x * 0.9 + 11.3, p.y * 0.9, p.z * 0.9) * 0.9
  const wy = noise(p.x * 0.9, p.y * 0.9 + 4.7, p.z * 0.9) * 0.9
  const wz = noise(p.x * 0.9, p.y * 0.9, p.z * 0.9 + 8.1) * 0.9
  const n = noise(p.x * f + wx, p.y * f + wy, p.z * f + wz)
  return 1 - Math.min(Math.abs(n) * 3.2, 1)
}

function inside(lobe: Lobe, p: Vector3): number {
  const x = (p.x - lobe.center.x) / lobe.radii.x
  const y = (p.y - lobe.center.y) / lobe.radii.y
  const z = (p.z - lobe.center.z) / lobe.radii.z
  return x * x + y * y + z * z
}

function direction(random: Random, out: Vector3): Vector3 {
  const z = random() * 2 - 1
  const angle = random() * Math.PI * 2
  const ring = Math.sqrt(1 - z * z)
  return out.set(ring * Math.cos(angle), ring * Math.sin(angle), z)
}

function orient(p: Vector3): Vector3 {
  return p.applyAxisAngle(X_AXIS, TOP_PITCH).applyAxisAngle(Y_AXIS, FRONT_YAW)
}

function sampleLobe(lobe: Lobe, random: Random, out: Vector3): number | null {
  const unit = direction(random, out)
  const depth = 1 - SURFACE_DEPTH * random() * random()
  out.set(unit.x * lobe.radii.x, unit.y * lobe.radii.y, unit.z * lobe.radii.z)
  out.multiplyScalar(depth).add(lobe.center)

  const isCerebrum = lobe.part !== 'cerebellum'
  if (isCerebrum) {
    out.y *= out.y < 0 ? 0.82 : 1 - 0.1 * MathUtils.clamp((out.x + 0.2) / 2.3, 0, 1)
    for (const other of CEREBRUM) if (other !== lobe && inside(other, out) < 0.94) return null
  } else if (CEREBRUM.some((other) => inside(other, out) < 1.02)) {
    return null
  }

  if (lobe.part === 'cerebellum') {
    const stripes = 0.5 + 0.5 * Math.cos(out.y * 15 + noise(out.x * 2, 0, out.z * 2) * 2)
    return 0.15 + 0.85 * stripes * stripes * stripes
  }
  const fold = sulcus(out)
  out.addScaledVector(unit, -GYRUS_RELIEF * fold)
  const fissure = MathUtils.smoothstep(Math.abs(out.z), 0, FISSURE_HALF_WIDTH)
  return (0.4 + 0.6 * fold * fold) * (0.04 + 0.96 * fissure)
}

function sampleStem(random: Random, out: Vector3): number | null {
  const t = random()
  const angle = random() * Math.PI * 2
  const radius = 0.3 - 0.11 * t
  out.lerpVectors(STEM_TOP, STEM_BOTTOM, t)
  out.x += Math.cos(angle) * radius
  out.z += Math.sin(angle) * radius * 1.1
  if ([...CEREBRUM, CEREBELLUM].some((lobe) => inside(lobe, out) < 1.02)) return null
  return 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(t * 26 + angle))
}

export interface BrainNeuron {
  position: Vector3
  glow: number
}

export function sampleBrain(count: number, random: Random): BrainNeuron[] {
  const neurons: BrainNeuron[] = []
  const scratch = new Vector3()
  const parts: { lobe: Lobe | null; weight: number }[] = [
    ...LOBES.map((lobe) => ({ lobe, weight: lobe.weight })),
    { lobe: null, weight: STEM_WEIGHT },
  ]
  for (const { lobe, weight } of parts) {
    const target = Math.round(count * weight)
    let placed = 0
    for (let attempt = 0; placed < target && attempt < target * REJECTION_LIMIT; attempt++) {
      const density = lobe ? sampleLobe(lobe, random, scratch) : sampleStem(random, scratch)
      if (density === null || random() > density) continue
      neurons.push({ position: orient(scratch.clone()), glow: density })
      placed++
    }
  }
  return neurons
}

const ME_LOCAL = new Vector3(-0.9, 0.25, 0.7)
const INTERIOR_SPREAD = new Vector3(1.5, 0.8, 1.0)
const INTERIOR_CLEARANCE = 0.45
const INTERIOR_MARGIN = 0.8

export function mePoint(): Vector3 {
  return orient(ME_LOCAL.clone())
}

export function sampleInterior(count: number, random: Random): BrainNeuron[] {
  const neurons: BrainNeuron[] = []
  const scratch = new Vector3()
  const limit = count * REJECTION_LIMIT
  for (let attempt = 0; neurons.length < count && attempt < limit; attempt++) {
    scratch.set(gaussian(random), gaussian(random), gaussian(random))
    scratch.multiply(INTERIOR_SPREAD).add(ME_LOCAL)
    if (scratch.distanceTo(ME_LOCAL) < INTERIOR_CLEARANCE) continue
    if (CEREBRUM.every((lobe) => inside(lobe, scratch) > INTERIOR_MARGIN)) continue
    neurons.push({ position: orient(scratch.clone()), glow: random() })
  }
  return neurons
}

export const BRAIN_EXTENT = new Vector3(2.7, 2.4, 1.8)

const PATHWAY_REGIONS: Vector3[] = [
  new Vector3(1.1, 0.8, 0.5),
  new Vector3(-0.5, -0.7, 1.05),
  new Vector3(-0.8, 0.5, -0.7),
  new Vector3(1.3, -0.3, -0.9),
  new Vector3(-0.2, 0.85, 0.3),
  new Vector3(0.6, -0.6, -0.4),
]
const DEPTH_LIMIT = 0.7

const SIDE_UP = new Vector3(0, 1, 0)
const SIDE_FALLBACK_LIMIT = 0.8

export function sideOf(direction: Vector3, out: Vector3): Vector3 {
  return out
    .crossVectors(direction, Math.abs(direction.y) > SIDE_FALLBACK_LIMIT ? X_AXIS : SIDE_UP)
    .normalize()
}

export const HERO_VIEW = new Vector3(0.8, 0.2, 0.55).normalize()

const DOMAIN_REGIONS: Vector3[] = [
  new Vector3(-1.55, 0.75, 1.15),
  new Vector3(0.1, 1.2, 1.0),
  new Vector3(1.95, 0.3, 0.9),
  new Vector3(-0.55, -0.7, 1.35),
  new Vector3(1.4, -1.05, 1.0),
]

export function domainRegion(index: number): Vector3 {
  return orient(DOMAIN_REGIONS[index % DOMAIN_REGIONS.length].clone())
}

export function pathwayRegion(index: number): Vector3 {
  return orient(PATHWAY_REGIONS[index % PATHWAY_REGIONS.length].clone())
}

export function keepInside(p: Vector3): Vector3 {
  const local = p.clone().applyAxisAngle(Y_AXIS, -FRONT_YAW).applyAxisAngle(X_AXIS, -TOP_PITCH)
  let nearest = CEREBRUM[0]
  let depth = Infinity
  for (const lobe of CEREBRUM) {
    const value = inside(lobe, local)
    if (value < depth) {
      depth = value
      nearest = lobe
    }
  }
  if (depth <= DEPTH_LIMIT) return p
  local
    .sub(nearest.center)
    .multiplyScalar(Math.sqrt(DEPTH_LIMIT / depth))
    .add(nearest.center)
  return p.copy(orient(local))
}
