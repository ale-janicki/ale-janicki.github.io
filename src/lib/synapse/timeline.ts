import { MathUtils, Vector2, Vector3 } from 'three'
import type { NetworkLayout } from './buildNetwork'
import { HERO_VIEW, sideOf } from './brain'
import {
  HERO_SLOTS,
  LENGTHS,
  MAX_BRANCHES,
  MAX_TECHS,
  MILESTONE_REACH,
  MILESTONE_REACH_MOBILE,
} from './length'
import { arcOf, buildRoute, pointAt, type Route } from './route'

export const CAMERA_FOV = 55
export const CONTENT_MAX = 1280

const TAN_HALF = Math.tan(MathUtils.degToRad(CAMERA_FOV / 2))
const WIDE_MARGIN = 0.94
const UP = new Vector3(0, 1, 0)
const HERO_DISTANCE = 3
const HERO_COLUMN = 0.7
const HOLD_COLUMN = 0.27
const LANDING_COLUMN = 0.75
const TEXT_RIGHT = 592
const EDGE = 24
const LABEL_ROOM = 202
const LABEL_ROOM_MOBILE = 137
const FAN_LEFT = 0.9
const FAN_LEFT_MOBILE = 0.5
const WIDE_DIRECTION = new Vector3(-0.08, 0.28, 1).normalize()
const CHASE_BACK = 1.1
const CHASE_LEAD = 0.8
const CHASE_LIFT = 0.35
const CHASE_SIDE = 0.2
const PULSE_LEAD = 0.4
const TECH_GATE: [number, number] = [0.55, 1]
const TECH_REVEAL: [number, number] = [1.7, 0.9]
export const HOLD_BACK = 1.5
export const HOLD_SIDE = 1.6
export const HOLD_LIFT = 0.6

export interface View {
  aspect: number
  width: number
}

export interface Pose {
  position: Vector3
  look: Vector3
  shiftX: number
  shiftY: number
}

export interface Frame {
  pose: Pose
  time: number
  open: number
  paths: number
  inside: number
  domains: number
  tips: number
  caption: number
  hero: Float32Array
  cards: Float32Array
  techs: Float32Array
  cursor: Vector2
}

type PoseFn = (out: Pose, view: View) => void
type Window = [number, number, number, number]

interface Segment {
  start: number
  end: number
  from: PoseFn
  to: PoseFn
  zoom: boolean
  route: number
}

export interface Timeline {
  length: number
  sample: (progress: number, view: View, frame: Frame) => void
  focus: (branch: number, view: View, out: Pose) => void
}

export function createPose(): Pose {
  return { position: new Vector3(), look: new Vector3(), shiftX: 0, shiftY: 0 }
}

export function createView(): View {
  return { aspect: 1, width: 1 }
}

export function createFrame(): Frame {
  return {
    pose: createPose(),
    time: 0,
    open: 0,
    paths: 0,
    inside: 0,
    domains: 0,
    tips: 0,
    caption: 0,
    hero: new Float32Array(HERO_SLOTS).fill(-1),
    cards: new Float32Array(MAX_BRANCHES),
    techs: new Float32Array(MAX_BRANCHES * MAX_TECHS),
    cursor: new Vector2(10, 10),
  }
}

export function fitDistance(halfWidth: number, halfHeight: number, aspect: number): number {
  return Math.max(halfWidth / (TAN_HALF * aspect), halfHeight / TAN_HALF)
}

export function columnShift(view: View, fraction: number): number {
  const span = Math.min(view.width, CONTENT_MAX)
  return (2 * ((view.width - span) / 2 + span * fraction)) / view.width - 1
}

function smooth(value: number): number {
  const x = MathUtils.clamp(value, 0, 1)
  return x * x * (3 - 2 * x)
}

function ramp(value: number, from: number, to: number): number {
  return smooth((value - from) / (to - from))
}

function inWindow(value: number, [a, b, c, d]: Window): number {
  return ramp(value, a, b) * (1 - ramp(value, c, d))
}

export function blendPose(a: Pose, b: Pose, amount: number, out: Pose): void {
  out.position.lerpVectors(a.position, b.position, amount)
  out.look.lerpVectors(a.look, b.look, amount)
  out.shiftX = MathUtils.lerp(a.shiftX, b.shiftX, amount)
  out.shiftY = MathUtils.lerp(a.shiftY, b.shiftY, amount)
}

export function createTimeline(network: NetworkLayout): Timeline {
  const { branches, extent, me } = network
  const segments: Segment[] = []
  const from = createPose()
  const to = createPose()
  const routePose = createPose()
  const hold = createPose()
  const tangent = new Vector3()
  const side = new Vector3()
  const offset = new Vector3()
  const zoomFrom = new Vector3()
  const zoomTo = new Vector3()
  const cardWindows: Window[] = []
  const routes: Route[] = []
  const junctionArcs: number[] = []
  const techArcs: number[][] = []
  const endTangents = branches.map((branch) => branch.curve.getTangent(1))
  let captionWindow: Window = [0, 0, 0, 0]
  let domainWindow: Window = [0, 0, 0, 0]
  let tipsWindow: Window = [0, 0, 0, 0]
  const effects = {
    landing: [0, 0],
    open: [0, 0],
    inside: [0, 0],
  }
  let cursor = 0

  const blendZoom = (a: Pose, b: Pose, amount: number, out: Pose): void => {
    blendPose(a, b, amount, out)
    const near = a.position.distanceTo(a.look)
    const far = b.position.distanceTo(b.look)
    zoomFrom.copy(a.position).sub(a.look).normalize()
    zoomTo.copy(b.position).sub(b.look).normalize()
    out.position
      .copy(zoomFrom.lerp(zoomTo, amount).normalize())
      .multiplyScalar(near * Math.pow(far / near, amount))
      .add(out.look)
  }

  const landingPose: PoseFn = (out, view) => {
    const landscape = view.aspect >= 1
    const height = view.width / view.aspect
    const span = Math.min(view.width, CONTENT_MAX)
    const room = landscape ? span / 2 : view.width - 2 * EDGE
    const available = landscape ? height : height * 0.46
    const scale = Math.min(
      room / (2 * extent.x * WIDE_MARGIN),
      available / (2 * extent.y * WIDE_MARGIN),
    )
    out.look.set(0, 0, 0)
    out.position.copy(WIDE_DIRECTION).multiplyScalar(height / 2 / (scale * TAN_HALF) + extent.z)
    out.shiftX = landscape ? columnShift(view, LANDING_COLUMN) : 0
    out.shiftY = landscape ? 0 : 0.34
  }

  const presentationPose: PoseFn = (out, view) => {
    const landscape = view.aspect >= 1
    const height = view.width / view.aspect
    const span = Math.min(view.width, CONTENT_MAX)
    const reach = landscape ? MILESTONE_REACH : MILESTONE_REACH_MOBILE
    const margin = landscape ? FAN_LEFT : FAN_LEFT_MOBILE
    const labels = (landscape ? LABEL_ROOM : LABEL_ROOM_MOBILE) + EDGE
    const left = landscape ? (view.width - span) / 2 + TEXT_RIGHT : EDGE
    const wanted = height / 2 / (HERO_DISTANCE * TAN_HALF)
    const capacity = (view.width - labels - left) / (reach.x + margin)
    const scale = Math.min(wanted, capacity)
    const ideal = landscape ? (view.width - span) / 2 + span * HERO_COLUMN : view.width * 0.35
    const center = Math.min(ideal, view.width - labels - reach.x * scale)
    out.look.copy(me)
    out.position.copy(me).addScaledVector(HERO_VIEW, height / 2 / (scale * TAN_HALF))
    out.shiftX = (2 * Math.max(center, left + margin * scale)) / view.width - 1
    out.shiftY = landscape ? 0 : 0.4
  }

  const widePose: PoseFn = (out, view) => {
    out.look.set(0, 0, 0)
    out.position
      .copy(WIDE_DIRECTION)
      .multiplyScalar(
        fitDistance(extent.x * WIDE_MARGIN, extent.y * WIDE_MARGIN, view.aspect) + extent.z,
      )
    out.shiftX = 0
    out.shiftY = 0
  }

  const holdOffset = (index: number, view: View, out: Vector3): Vector3 => {
    const landscape = view.aspect >= 1
    const zoom = landscape ? 1 : Math.min(2.2, 0.9 / view.aspect)
    sideOf(endTangents[index], side)
    return out
      .copy(endTangents[index])
      .multiplyScalar(-HOLD_BACK * zoom)
      .addScaledVector(side, HOLD_SIDE * zoom)
      .addScaledVector(UP, HOLD_LIFT * zoom)
  }

  const holdPose = (index: number, out: Pose, view: View): void => {
    const landscape = view.aspect >= 1
    out.look.copy(branches[index].node)
    out.position.copy(branches[index].node).add(holdOffset(index, view, offset))
    out.shiftX = landscape ? columnShift(view, HOLD_COLUMN) : 0
    out.shiftY = landscape ? 0 : 0.2
  }

  const chase = (index: number, arc: number, out: Pose, view: View): void => {
    const route = routes[index]
    const zoom = view.aspect >= 1 ? 1 : Math.min(1.8, 0.9 / view.aspect)
    pointAt(route, arc - CHASE_BACK * zoom, out.position)
    pointAt(route, arc + CHASE_LEAD, out.look)
    tangent.subVectors(out.look, out.position).normalize()
    sideOf(tangent, side)
    out.position.addScaledVector(UP, CHASE_LIFT * zoom).addScaledVector(side, CHASE_SIDE)
    out.shiftX = 0
    out.shiftY = 0
  }

  const push = (length: number, a: PoseFn, b: PoseFn, zoom = false, route = -1): Segment => {
    const segment = { start: cursor, end: cursor + length, from: a, to: b, zoom, route }
    segments.push(segment)
    cursor += length
    return segment
  }

  push(LENGTHS.landing, landingPose, landingPose)
  const intro = push(LENGTHS.intro, landingPose, presentationPose, true)
  const presentation = push(LENGTHS.presentation, presentationPose, presentationPose)
  const toWide = push(LENGTHS.toWide, presentationPose, widePose, true)
  const wideHold = push(LENGTHS.wideHold, widePose, widePose)
  effects.landing = [intro.start + 0.05, intro.end - 0.05]
  effects.open = [toWide.start + 0.05, toWide.end - 0.15]
  tipsWindow = [
    intro.start + 0.5 * LENGTHS.intro,
    presentation.start + 0.1,
    presentation.end - 0.05,
    toWide.start + 0.35,
  ]
  captionWindow = [
    toWide.start + 0.6,
    wideHold.start + 0.1,
    wideHold.end - 0.05,
    wideHold.end + 0.3,
  ]
  domainWindow = [
    toWide.start + 0.75,
    wideHold.start + 0.1,
    wideHold.end - 0.1,
    wideHold.end + 0.15,
  ]

  const enters: Segment[] = []
  const holds: Segment[] = []
  branches.forEach((branch, index) => {
    const parent = branch.parent >= 0 ? branches[branch.parent] : null
    const route = buildRoute(
      parent
        ? [
            { curve: parent.curve, from: 1, to: branch.junction },
            { curve: branch.curve, from: 0, to: 1 },
          ]
        : [{ curve: branch.curve, from: 0, to: 1 }],
    )
    routes.push(route)
    junctionArcs.push(branch.joint ? arcOf(route, branch.joint) : 0)
    techArcs.push(branch.techs.map((tech) => arcOf(route, branch.curve.getPointAt(tech.at))))
    const before: PoseFn = parent ? (out, view) => holdPose(index - 1, out, view) : widePose
    const end: PoseFn = (out, view) => holdPose(index, out, view)
    enters.push(push(LENGTHS.enter, before, end, !parent, index))
    const pad = index === branches.length - 1 ? LENGTHS.endPad : 0
    holds.push(push(LENGTHS.hold + pad, end, end))
  })
  if (enters.length > 0) {
    effects.inside = [enters[0].start + 0.1 * LENGTHS.enter, enters[0].start + 0.5 * LENGTHS.enter]
  }
  enters.forEach((enter, index) => {
    const next = holds[index + 1] ? enters[index + 1] : null
    const finish = holds[index].end
    cardWindows[index] = [
      enter.start + 0.72 * (enter.end - enter.start),
      enter.end,
      next ? finish : finish + 0.01,
      next ? finish + 0.35 * (next.end - next.start) : finish + 1,
    ]
  })

  const length = cursor

  const sample: Timeline['sample'] = (progress, view, frame) => {
    const scroll = MathUtils.clamp(progress, 0, 1) * length
    let segment = segments[segments.length - 1]
    for (let i = 0; i < segments.length; i++) {
      if (scroll <= segments[i].end) {
        segment = segments[i]
        break
      }
    }
    const local = MathUtils.clamp((scroll - segment.start) / (segment.end - segment.start), 0, 1)

    frame.hero.fill(-1)
    frame.techs.fill(0)
    const inside = ramp(scroll, effects.inside[0], effects.inside[1])
    if (segment.route >= 0) {
      const index = segment.route
      const route = routes[index]
      const arc = smooth(local) * route.length
      chase(index, arc, routePose, view)
      segment.from(from, view)
      if (segment.zoom) blendZoom(from, routePose, ramp(local, 0, 0.5), frame.pose)
      else blendPose(from, routePose, ramp(local, 0, 0.25), frame.pose)
      holdPose(index, hold, view)
      blendPose(frame.pose, hold, ramp(local, 0.8, 1), frame.pose)

      const own = route.length - junctionArcs[index]
      const head = (arc + PULSE_LEAD - junctionArcs[index]) / own
      if (head >= 0) {
        frame.hero[index] = branches[index].curve.getUtoTmapping(MathUtils.clamp(head, 0, 1), 0)
      }
      const arcs = techArcs[index]
      for (let k = 0; k < arcs.length; k++) {
        frame.techs[index * MAX_TECHS + k] =
          ramp(inside, TECH_GATE[0], TECH_GATE[1]) *
          ramp(arc, arcs[k] - TECH_REVEAL[0], arcs[k] - TECH_REVEAL[1])
      }
    } else if (segment.from === segment.to) {
      segment.from(frame.pose, view)
    } else {
      segment.from(from, view)
      segment.to(to, view)
      const eased = smooth(local)
      if (segment.zoom) blendZoom(from, to, eased, frame.pose)
      else blendPose(from, to, eased, frame.pose)
    }

    const wideOpen = ramp(scroll, effects.open[0], effects.open[1])
    frame.paths = wideOpen
    frame.open = Math.max(1 - ramp(scroll, effects.landing[0], effects.landing[1]), wideOpen)
    frame.inside = inside
    frame.tips = inWindow(scroll, tipsWindow)
    frame.cards.fill(0)
    for (let index = 0; index < cardWindows.length; index++) {
      frame.cards[index] = inWindow(scroll, cardWindows[index])
    }
    for (let index = 0; index < branches.length; index++) {
      for (let k = 0; k < MAX_TECHS; k++) {
        frame.techs[index * MAX_TECHS + k] *= 1 - frame.cards[index]
      }
    }
    frame.domains = inWindow(scroll, domainWindow)
    frame.caption = inWindow(scroll, captionWindow)
  }

  const focus: Timeline['focus'] = (branch, view, out) => {
    holdPose(branch, out, view)
  }

  return { length, sample, focus }
}
