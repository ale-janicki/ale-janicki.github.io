import { Color, CubicBezierCurve3, Vector2, Vector3 } from 'three'
import type { Project } from '@/types/project'
import {
  BRAIN_EXTENT,
  HERO_VIEW,
  keepInside,
  mePoint,
  pathwayRegion,
  sampleBrain,
  sampleInterior,
  type BrainNeuron,
} from './brain'
import { LINK_LAYER_STEP, MAX_BRANCHES, MAX_MILESTONES } from './length'
import { createRandom, gaussian, type Random } from './random'

export const TRAIL_TICKS = 4
export const RHYTHM_PERIOD = 1.6
export const RHYTHM_RUN = 0.9

const SEED = 20241015
const LAYER_CORE = 0
const LAYER_NETWORK = 1
const LAYER_LINK = 2
const LAYER_ME = 3
const LINK_RADIUS = 0.3
const LINKS_PER_NEURON = 3
const INTERIOR_LINK_RADIUS = 0.42
const INTERIOR_IMPULSES = 46
const ME_PERIOD = 2.6
const ME_DENDRITES = 9
const ME_AXON_LENGTH = 1.6
const ME_AXON_DIRECTION = new Vector3(-0.45, 0.1, -0.88).normalize()
const MILESTONE_REACH = new Vector2(0.6, 1.3)
const MILESTONE_REACH_MOBILE = new Vector2(0.35, 0.8)
const MILESTONE_FAN = 1.05
const MILESTONE_SIZE = 3.2
const MILESTONE_NEURON_SCALE = 2.2
const LINK_LABEL_ITEMS = 3
const LINK_FAINT_ALPHA = 0.16
const HERO_UP = new Vector3(0, 1, 0)
const PATH_HOPS = 3
const NODE_SCALE = 5
const TRUNK_SEGMENTS = 44
const TWIG_SEGMENTS = 12
const LINK_SEGMENTS = 44
const PATHWAY_START = 0.2
const PATHWAY_BEND = 0.5
const TWIG_REACH = 0.3
const TWIG_LENGTH = 0.35
const BEAD_SCALE = 0.55
const TWIG_POSITIONS = [0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.86, 0.93]
const RING_SIZE = 12
const CLUSTER_SIZE = 4
const CLUSTER_RADIUS = 0.42
const HERO_TRAIL_STEP = 0.016
const IMPULSE_TRAIL_STEP = 0.01
const WHITE = new Color('#ffffff')
const BRANCH_NEURON_LIGHTEN = 0.2
const CORE_COLOR = new Color('#cc5500')
const CORE_TINT = new Color('#ff9a55')
const CORE_IMPULSE_COLOR = new Color('#ffbf8f')
const ME_COLOR = new Color('#cc5500')
const ME_TIP_COLOR = new Color('#8a3a08')
const ME_HALO_COLOR = new Color('#a24408')
const ME_IMPULSE_COLOR = new Color('#ffc79a')

interface Detail {
  core: number
  interior: number
  maxLinks: number
  coreImpulses: number
  trunkNeurons: number
}

const DESKTOP_DETAIL: Detail = {
  core: 2400,
  interior: 520,
  maxLinks: 3200,
  coreImpulses: 110,
  trunkNeurons: 40,
}

const MOBILE_DETAIL: Detail = {
  core: 760,
  interior: 190,
  maxLinks: 1200,
  coreImpulses: 44,
  trunkNeurons: 22,
}

export interface NeuronBuffers {
  position: Float32Array
  color: Float32Array
  scale: Float32Array
  layer: Float32Array
  meta: Float32Array
}

export interface LineBuffers {
  position: Float32Array
  color: Float32Array
  layer: Float32Array
}

export interface ImpulseBuffers {
  p0: Float32Array
  p1: Float32Array
  p2: Float32Array
  p3: Float32Array
  color: Float32Array
  motion: Float32Array
  shape: Float32Array
}

export interface BranchGeometry {
  curve: CubicBezierCurve3
  node: Vector3
  tangent: Vector3
  project: Project
}

export interface LinkGeometry {
  from: number
  to: number
  shared: string[]
  midpoint: Vector3
}

export interface NetworkLayout {
  neurons: NeuronBuffers
  lines: LineBuffers
  impulses: ImpulseBuffers
  branches: BranchGeometry[]
  links: LinkGeometry[]
  milestones: Vector3[]
  extent: Vector3
  me: Vector3
}

interface ImpulseOptions {
  size: number
  layer: number
  speed?: number
  phase?: number
  period?: number
  hero?: number
  trailStep?: number
}

interface Builder {
  addNeuron: (
    position: Vector3,
    color: Color,
    scale: number,
    layer: number,
    node?: number,
    pulse?: number,
  ) => void
  addEdge: (
    points: Vector3[],
    from: Color,
    to: Color,
    alpha: number,
    layer: number,
    segments: number,
  ) => void
  addImpulse: (points: Vector3[], color: Color, options: ImpulseOptions) => void
  finish: () => Pick<NetworkLayout, 'neurons' | 'lines' | 'impulses'>
}

function createBuilder(random: Random): Builder {
  const neuron = {
    position: [] as number[],
    color: [] as number[],
    scale: [] as number[],
    layer: [] as number[],
    meta: [] as number[],
  }
  const line = { position: [] as number[], color: [] as number[], layer: [] as number[] }
  const impulse = {
    p0: [] as number[],
    p1: [] as number[],
    p2: [] as number[],
    p3: [] as number[],
    color: [] as number[],
    motion: [] as number[],
    shape: [] as number[],
  }
  const from = new Vector3()
  const to = new Vector3()
  const tint = new Color()
  const curve = new CubicBezierCurve3()

  const addNeuron: Builder['addNeuron'] = (position, color, scale, layer, node = 0, pulse = 0) => {
    neuron.position.push(position.x, position.y, position.z)
    neuron.color.push(color.r, color.g, color.b)
    neuron.scale.push(scale)
    neuron.layer.push(layer)
    neuron.meta.push(random(), node, pulse)
  }

  const addEdge: Builder['addEdge'] = (points, colorFrom, colorTo, alpha, layer, segments) => {
    curve.v0.copy(points[0])
    curve.v1.copy(points[1])
    curve.v2.copy(points[2])
    curve.v3.copy(points[3])
    for (let i = 0; i < segments; i++) {
      curve.getPoint(i / segments, from)
      curve.getPoint((i + 1) / segments, to)
      tint.copy(colorFrom).lerp(colorTo, (i + 0.5) / segments)
      line.position.push(from.x, from.y, from.z, to.x, to.y, to.z)
      line.color.push(tint.r, tint.g, tint.b, alpha, tint.r, tint.g, tint.b, alpha)
      line.layer.push(layer, layer)
    }
  }

  const addImpulse: Builder['addImpulse'] = (points, color, options) => {
    const { size, layer, speed = 0, phase = 0, period = 0, hero = 0 } = options
    const trailStep = options.trailStep ?? IMPULSE_TRAIL_STEP
    for (let tick = 0; tick < TRAIL_TICKS; tick++) {
      impulse.p0.push(points[0].x, points[0].y, points[0].z)
      impulse.p1.push(points[1].x, points[1].y, points[1].z)
      impulse.p2.push(points[2].x, points[2].y, points[2].z)
      impulse.p3.push(points[3].x, points[3].y, points[3].z)
      impulse.color.push(color.r, color.g, color.b)
      impulse.motion.push(speed, phase, period, hero)
      impulse.shape.push(size, tick, trailStep, layer)
    }
  }

  const finish: Builder['finish'] = () => ({
    neurons: {
      position: Float32Array.from(neuron.position),
      color: Float32Array.from(neuron.color),
      scale: Float32Array.from(neuron.scale),
      layer: Float32Array.from(neuron.layer),
      meta: Float32Array.from(neuron.meta),
    },
    lines: {
      position: Float32Array.from(line.position),
      color: Float32Array.from(line.color),
      layer: Float32Array.from(line.layer),
    },
    impulses: {
      p0: Float32Array.from(impulse.p0),
      p1: Float32Array.from(impulse.p1),
      p2: Float32Array.from(impulse.p2),
      p3: Float32Array.from(impulse.p3),
      color: Float32Array.from(impulse.color),
      motion: Float32Array.from(impulse.motion),
      shape: Float32Array.from(impulse.shape),
    },
  })

  return { addNeuron, addEdge, addImpulse, finish }
}

function bowedPoints(a: Vector3, b: Vector3, random: Random, bow: number): Vector3[] {
  const jitter = () =>
    new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(bow)
  return [
    a.clone(),
    a
      .clone()
      .lerp(b, 1 / 3)
      .add(jitter()),
    a
      .clone()
      .lerp(b, 2 / 3)
      .add(jitter()),
    b.clone(),
  ]
}

function reversed(points: Vector3[]): Vector3[] {
  return [points[3], points[2], points[1], points[0]]
}

interface WireOptions {
  radius: number
  maxLinks: number
  alpha: number
}

const GRID_OFFSET = 1024
const GRID_SPAN = 2048

function cellCoordinate(value: number, cell: number): number {
  return Math.floor(value / cell) + GRID_OFFSET
}

function cellKey(x: number, y: number, z: number): number {
  return (x * GRID_SPAN + y) * GRID_SPAN + z
}

function buildGrid(positions: Vector3[], cell: number): Map<number, number[]> {
  const grid = new Map<number, number[]>()
  positions.forEach((position, index) => {
    const key = cellKey(
      cellCoordinate(position.x, cell),
      cellCoordinate(position.y, cell),
      cellCoordinate(position.z, cell),
    )
    const bucket = grid.get(key)
    if (bucket) bucket.push(index)
    else grid.set(key, [index])
  })
  return grid
}

function nearestWithin(
  index: number,
  positions: Vector3[],
  grid: Map<number, number[]>,
  radius: number,
): { index: number; distance: number }[] {
  const origin = positions[index]
  const radiusSquared = radius * radius
  const cx = cellCoordinate(origin.x, radius)
  const cy = cellCoordinate(origin.y, radius)
  const cz = cellCoordinate(origin.z, radius)
  const found: { index: number; distance: number }[] = []
  for (let x = cx - 1; x <= cx + 1; x++) {
    for (let y = cy - 1; y <= cy + 1; y++) {
      for (let z = cz - 1; z <= cz + 1; z++) {
        for (const other of grid.get(cellKey(x, y, z)) ?? []) {
          if (other === index) continue
          const distance = origin.distanceToSquared(positions[other])
          if (distance <= radiusSquared) found.push({ index: other, distance })
        }
      }
    }
  }
  found.sort((a, b) => a.distance - b.distance || a.index - b.index)
  return found.slice(0, LINKS_PER_NEURON)
}

function wire(
  builder: Builder,
  positions: Vector3[],
  { radius, maxLinks, alpha }: WireOptions,
  random: Random,
): number[][] {
  const neighbors: number[][] = positions.map(() => [])
  const linked = new Set<number>()
  const grid = buildGrid(positions, radius)
  let edges = 0
  for (let i = 0; i < positions.length && edges < maxLinks; i++) {
    for (const { index } of nearestWithin(i, positions, grid, radius)) {
      const key = Math.min(i, index) * positions.length + Math.max(i, index)
      if (linked.has(key)) continue
      linked.add(key)
      edges++
      neighbors[i].push(index)
      neighbors[index].push(i)
      const points = bowedPoints(positions[i], positions[index], random, 0.05)
      builder.addEdge(points, CORE_COLOR, CORE_COLOR, alpha, LAYER_CORE, 2)
    }
  }
  return neighbors
}

function addWalkers(
  builder: Builder,
  positions: Vector3[],
  neighbors: number[][],
  count: number,
  random: Random,
): void {
  for (let i = 0; i < count; i++) {
    const path = [Math.floor(random() * positions.length)]
    for (let hop = 0; hop < PATH_HOPS; hop++) {
      const options = neighbors[path[hop]].filter((index) => index !== path[hop - 1])
      if (options.length === 0) break
      path.push(options[Math.floor(random() * options.length)])
    }
    if (path.length <= PATH_HOPS) continue
    builder.addImpulse(
      path.map((index) => positions[index]),
      CORE_IMPULSE_COLOR,
      { size: 1, layer: LAYER_CORE, speed: 0.22 + random() * 0.3, phase: random() },
    )
  }
}

function addMesh(
  builder: Builder,
  neurons: BrainNeuron[],
  wiring: WireOptions,
  impulses: number,
  random: Random,
): Vector3[] {
  const positions = neurons.map((neuron) => neuron.position)
  const tint = new Color()
  neurons.forEach(({ position, glow }) => {
    tint.copy(CORE_COLOR).lerp(CORE_TINT, Math.min(1, glow * 0.7 + random() * 0.25))
    builder.addNeuron(position, tint, 0.5 + glow * 0.5 + random() * 0.5, LAYER_CORE)
  })
  const neighbors = wire(builder, positions, wiring, random)
  addWalkers(builder, positions, neighbors, impulses, random)
  return positions
}

function addCore(builder: Builder, detail: Detail, random: Random): void {
  addMesh(
    builder,
    sampleBrain(detail.core, random),
    { radius: LINK_RADIUS, maxLinks: detail.maxLinks, alpha: 0.2 },
    detail.coreImpulses,
    random,
  )
}

function addInterior(builder: Builder, detail: Detail, random: Random): Vector3[] {
  return addMesh(
    builder,
    sampleInterior(detail.interior, random),
    { radius: INTERIOR_LINK_RADIUS, maxLinks: detail.interior * LINKS_PER_NEURON, alpha: 0.3 },
    INTERIOR_IMPULSES,
    random,
  )
}

function nearestTo(points: Vector3[], position: Vector3): Vector3 {
  let best = points[0]
  for (const point of points) {
    if (point.distanceToSquared(position) < best.distanceToSquared(position)) best = point
  }
  return best
}

function randomDirection(random: Random): Vector3 {
  return new Vector3(gaussian(random), gaussian(random), gaussian(random)).normalize()
}

function addMe(builder: Builder, me: Vector3, mesh: Vector3[], random: Random): void {
  const pulse = { period: ME_PERIOD, layer: LAYER_ME, trailStep: 0.05 }
  builder.addNeuron(me, ME_HALO_COLOR, 24, LAYER_ME, 0, ME_PERIOD)
  builder.addNeuron(me, ME_COLOR, 7, LAYER_ME, 0, ME_PERIOD)

  const addStrand = (points: Vector3[], from: Color, to: Color, segments: number): void => {
    builder.addEdge(points, from, to, 0.95, LAYER_ME, segments)
    for (let k = 0; k < 2; k++) {
      builder.addEdge(
        bowedPoints(points[0], points[3], random, 0.07),
        from,
        to,
        0.45,
        LAYER_ME,
        segments,
      )
    }
  }

  const tips: Vector3[] = []
  for (let i = 0; i < ME_DENDRITES; i++) {
    const direction = randomDirection(random)
    const tip = me.clone().addScaledVector(direction, 0.4 + random() * 0.3)
    const primary = bowedPoints(me, tip, random, 0.18)
    addStrand(primary, ME_COLOR, ME_COLOR, 14)
    for (const u of [0.35, 0.65]) {
      builder.addNeuron(new Vector3().lerpVectors(me, tip, u), ME_COLOR, 0.8, LAYER_ME)
    }
    builder.addImpulse(reversed(primary), ME_IMPULSE_COLOR, {
      ...pulse,
      size: 1.7,
      phase: -i * 0.05,
    })
    for (let k = 0; k < 2; k++) {
      const end = tip
        .clone()
        .addScaledVector(
          direction.clone().add(randomDirection(random)).normalize(),
          0.2 + random() * 0.2,
        )
      const twig = bowedPoints(tip, end, random, 0.12)
      builder.addEdge(twig, ME_COLOR, ME_TIP_COLOR, 0.8, LAYER_ME, 8)
      builder.addNeuron(end, ME_COLOR, 0.9, LAYER_ME)
      builder.addImpulse(reversed(twig), ME_IMPULSE_COLOR, {
        ...pulse,
        size: 1.2,
        phase: -i * 0.05,
      })
      tips.push(end)
    }
  }
  for (const tip of tips) {
    const target = nearestTo(mesh, tip)
    builder.addEdge(
      bowedPoints(tip, target, random, 0.06),
      ME_TIP_COLOR,
      ME_TIP_COLOR,
      0.5,
      LAYER_ME,
      4,
    )
  }

  const reach = me.clone().addScaledVector(ME_AXON_DIRECTION, ME_AXON_LENGTH)
  const axon = bowedPoints(me, reach, random, 0.5)
  addStrand(axon, ME_COLOR, ME_COLOR, 40)
  builder.addImpulse(axon, ME_IMPULSE_COLOR, { ...pulse, size: 2, phase: -RHYTHM_RUN })
  for (let k = 0; k < 3; k++) {
    const end = reach.clone().addScaledVector(randomDirection(random), 0.3 + random() * 0.25)
    const terminal = bowedPoints(reach, end, random, 0.12)
    builder.addEdge(terminal, ME_COLOR, ME_TIP_COLOR, 0.8, LAYER_ME, 8)
    builder.addNeuron(end, ME_COLOR, 1.1, LAYER_ME)
    builder.addImpulse(terminal, ME_IMPULSE_COLOR, { ...pulse, size: 1.3, phase: -2 * RHYTHM_RUN })
  }
}

function addMilestones(
  builder: Builder,
  me: Vector3,
  count: number,
  isMobile: boolean,
  random: Random,
): Vector3[] {
  const total = Math.min(count, MAX_MILESTONES)
  const forward = HERO_VIEW.clone().negate()
  const right = new Vector3().crossVectors(forward, HERO_UP).normalize()
  const up = new Vector3().crossVectors(right, forward).normalize()
  const reach = isMobile ? MILESTONE_REACH_MOBILE : MILESTONE_REACH
  const anchors: Vector3[] = []
  for (let index = 0; index < total; index++) {
    const spread = total > 1 ? 1 - (2 * index) / (total - 1) : 0
    const angle = spread * MILESTONE_FAN
    const tip = me
      .clone()
      .addScaledVector(right, Math.cos(angle) * reach.x)
      .addScaledVector(up, Math.sin(angle) * reach.y)
    const path = bowedPoints(me, tip, random, 0.1)
    builder.addEdge(path, ME_COLOR, ME_COLOR, 0.95, LAYER_ME, 14)
    builder.addEdge(bowedPoints(me, tip, random, 0.06), ME_COLOR, ME_COLOR, 0.45, LAYER_ME, 14)
    for (const u of [0.35, 0.65]) {
      builder.addNeuron(new Vector3().lerpVectors(me, tip, u), ME_COLOR, 0.8, LAYER_ME)
    }
    builder.addNeuron(tip, ME_COLOR, MILESTONE_NEURON_SCALE, LAYER_ME, MAX_BRANCHES + index + 1)
    builder.addImpulse(path, ME_IMPULSE_COLOR, {
      size: MILESTONE_SIZE,
      layer: LAYER_ME,
      hero: MAX_BRANCHES + index + 1,
      trailStep: HERO_TRAIL_STEP,
    })
    anchors.push(tip)
  }
  return anchors
}

function createTrunk(index: number, me: Vector3, random: Random): CubicBezierCurve3 {
  const end = pathwayRegion(index)
  const start = me.clone().lerp(end, PATHWAY_START)
  const direction = end.clone().sub(start).normalize()
  const perpendicular = new Vector3().crossVectors(direction, new Vector3(0, 1, 0)).normalize()
  const bend = (random() < 0.5 ? -1 : 1) * PATHWAY_BEND
  const first = keepInside(start.clone().lerp(end, 0.33).addScaledVector(perpendicular, bend))
  const second = keepInside(
    start
      .clone()
      .lerp(end, 0.68)
      .addScaledVector(perpendicular, -bend * 0.7),
  )
  return new CubicBezierCurve3(start, first, second, end)
}

function addCluster(
  builder: Builder,
  node: Vector3,
  tangent: Vector3,
  color: Color,
  bright: Color,
  random: Random,
): void {
  const side = new Vector3().crossVectors(tangent, new Vector3(0, 1, 0)).normalize()
  const lift = new Vector3().crossVectors(side, tangent).normalize()
  const subs: Vector3[] = []
  for (let i = 0; i < CLUSTER_SIZE; i++) {
    const angle = (i / CLUSTER_SIZE) * Math.PI * 2 + 0.5
    const radius = CLUSTER_RADIUS * (0.85 + random() * 0.4)
    const sub = keepInside(
      node
        .clone()
        .addScaledVector(side, Math.cos(angle) * radius)
        .addScaledVector(lift, Math.sin(angle) * radius)
        .addScaledVector(tangent, (random() - 0.2) * 0.35),
    )
    subs.push(sub)
    builder.addNeuron(sub, color, 2.4, LAYER_NETWORK)
  }
  subs.forEach((sub, i) => {
    const spoke = bowedPoints(node, sub, random, 0.2)
    builder.addEdge(spoke, color, color, 0.45, LAYER_NETWORK, TWIG_SEGMENTS)
    builder.addImpulse(i % 2 === 0 ? spoke : reversed(spoke), bright, {
      size: 1.1,
      layer: LAYER_NETWORK,
      speed: 0.42,
      phase: i / CLUSTER_SIZE,
    })
    const ring = bowedPoints(sub, subs[(i + 1) % CLUSTER_SIZE], random, 0.25)
    builder.addEdge(ring, color, color, 0.4, LAYER_NETWORK, TWIG_SEGMENTS)
    builder.addImpulse(ring, bright, {
      size: 1.1,
      layer: LAYER_NETWORK,
      speed: 0.5,
      phase: (i + 0.5) / CLUSTER_SIZE,
    })
  })
}

function addRing(
  builder: Builder,
  node: Vector3,
  tangent: Vector3,
  color: Color,
  random: Random,
): void {
  const side = new Vector3().crossVectors(tangent, new Vector3(0, 1, 0)).normalize()
  const lift = new Vector3().crossVectors(side, tangent).normalize()
  for (let i = 0; i < RING_SIZE; i++) {
    const angle = (i / RING_SIZE) * Math.PI * 2
    const radius = 0.38 + random() * 0.17
    const p = keepInside(
      node
        .clone()
        .addScaledVector(side, Math.cos(angle) * radius)
        .addScaledVector(lift, Math.sin(angle) * radius),
    )
    builder.addNeuron(p, color, 1, LAYER_NETWORK, 0, RHYTHM_PERIOD)
  }
}

function addBranch(
  builder: Builder,
  project: Project,
  index: number,
  detail: Detail,
  random: Random,
  me: Vector3,
): BranchGeometry {
  const color = new Color(project.branch.color)
  const bright = color.clone().lerp(WHITE, 0.55)
  const glow = color.clone().lerp(WHITE, BRANCH_NEURON_LIGHTEN)
  const curve = createTrunk(index, me, random)
  const node = curve.v3.clone()
  const tangent = curve.getTangent(1)
  const trunk = [curve.v0, curve.v1, curve.v2, curve.v3]

  builder.addEdge(trunk, color, color, 0.55, LAYER_NETWORK, TRUNK_SEGMENTS)
  for (let i = 0; i < detail.trunkNeurons; i++) {
    const p = curve.getPoint(0.1 + random() * 0.82)
    p.add(new Vector3(gaussian(random), gaussian(random), gaussian(random)).multiplyScalar(0.08))
    builder.addNeuron(keepInside(p), glow, (0.8 + random() * 1.1) * BEAD_SCALE, LAYER_NETWORK)
  }

  const isRhythm = project.branch.visual === 'rhythm'
  builder.addNeuron(node, glow, NODE_SCALE, LAYER_NETWORK, index + 1, isRhythm ? RHYTHM_PERIOD : 0)

  for (const u of TWIG_POSITIONS) {
    const base = curve.getPoint(u)
    const away = new Vector3(gaussian(random), gaussian(random), gaussian(random)).normalize()
    const tip = keepInside(base.clone().addScaledVector(away, TWIG_REACH + random() * TWIG_LENGTH))
    builder.addEdge(
      bowedPoints(base, tip, random, 0.12),
      color,
      color,
      0.4,
      LAYER_NETWORK,
      TWIG_SEGMENTS,
    )
    builder.addNeuron(tip, glow, 1.1, LAYER_NETWORK)
    for (let i = 0; i < 2; i++) {
      const leaf = keepInside(
        tip
          .clone()
          .add(
            new Vector3(gaussian(random), gaussian(random), gaussian(random)).multiplyScalar(0.18),
          ),
      )
      builder.addEdge(bowedPoints(tip, leaf, random, 0.04), color, color, 0.3, LAYER_NETWORK, 4)
      builder.addNeuron(leaf, glow, 0.6, LAYER_NETWORK)
    }
  }

  if (project.branch.visual === 'cluster') addCluster(builder, node, tangent, glow, bright, random)
  if (isRhythm) addRing(builder, node, tangent, glow, random)

  if (isRhythm) {
    builder.addImpulse(trunk, bright, { size: 1.5, layer: LAYER_NETWORK, period: RHYTHM_PERIOD })
  } else {
    for (let i = 0; i < 3; i++) {
      builder.addImpulse(i === 2 ? reversed(trunk) : trunk, bright, {
        size: 1.3,
        layer: LAYER_NETWORK,
        speed: 0.1 + i * 0.03,
        phase: i / 3 + index * 0.17,
      })
    }
  }
  builder.addImpulse(trunk, bright, {
    size: 4.2,
    layer: LAYER_NETWORK,
    hero: index + 1,
    trailStep: HERO_TRAIL_STEP,
  })

  return { curve, node, tangent, project }
}

function sharedStack(a: Project, b: Project): string[] {
  const other = new Set(b.stack.map((item) => item.toLowerCase()))
  const seen = new Set<string>()
  return a.stack.filter((item) => {
    const key = item.toLowerCase()
    if (!other.has(key) || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function addLinks(
  builder: Builder,
  branches: BranchGeometry[],
  me: Vector3,
  random: Random,
): LinkGeometry[] {
  const links: LinkGeometry[] = []
  const middle = new Vector3()
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i]
      const b = branches[j]
      const shared = sharedStack(a.project, b.project)
      const layer = LAYER_LINK + links.length * LINK_LAYER_STEP
      const colorA = new Color(a.project.branch.color)
      const colorB = new Color(b.project.branch.color)
      const mix = colorA.clone().lerp(colorB, 0.5).lerp(WHITE, 0.45)
      const startA = a.curve.getPoint(0.6)
      const startB = b.curve.getPoint(0.6)
      middle.copy(startA).add(startB).multiplyScalar(0.5)
      const arch = (start: Vector3, lift: number) =>
        keepInside(
          start
            .clone()
            .lerp(middle, 0.5)
            .add(new Vector3(0, lift, 0)),
        )
      const points =
        shared.length > 0
          ? [startA, arch(startA, 0.35), arch(startB, -0.35), startB]
          : [startA, me.clone(), me.clone(), startB]
      const curve = new CubicBezierCurve3(points[0], points[1], points[2], points[3])
      builder.addEdge(
        points,
        colorA,
        colorB,
        shared.length > 0 ? 0.55 : LINK_FAINT_ALPHA,
        layer,
        LINK_SEGMENTS,
      )
      const impulses = shared.length > 0 ? 3 : 1
      for (let k = 0; k < impulses; k++) {
        builder.addImpulse(k % 2 === 0 ? [...points] : reversed([...points]), mix, {
          size: shared.length > 0 ? 1.2 : 0.9,
          layer,
          speed: 0.14 + k * 0.03,
          phase: k / 3 + random() * 0.2,
        })
      }
      links.push({
        from: i,
        to: j,
        shared: shared.slice(0, LINK_LABEL_ITEMS),
        midpoint: curve.getPoint(0.5),
      })
    }
  }
  return links
}

export function buildNetwork(
  projects: Project[],
  isMobile: boolean,
  milestoneCount: number,
): NetworkLayout {
  const random = createRandom(SEED)
  const detail = isMobile ? MOBILE_DETAIL : DESKTOP_DETAIL
  const builder = createBuilder(random)
  const used = projects.slice(0, MAX_BRANCHES)

  addCore(builder, detail, random)
  const me = mePoint()
  addMe(builder, me, addInterior(builder, detail, random), random)
  const branches = used.map((project, index) =>
    addBranch(builder, project, index, detail, random, me),
  )
  const links = addLinks(builder, branches, me, random)
  const milestones = addMilestones(builder, me, milestoneCount, isMobile, random)

  return { ...builder.finish(), branches, links, milestones, extent: BRAIN_EXTENT.clone(), me }
}
