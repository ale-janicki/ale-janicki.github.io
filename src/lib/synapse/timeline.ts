import { MathUtils, Vector2, Vector3 } from 'three'
import type { NetworkLayout } from './buildNetwork'
import { HERO_VIEW } from './brain'
import { HERO_SLOTS, LENGTHS, MAX_BRANCHES, MAX_LINKS, MAX_MILESTONES } from './length'

export const CAMERA_FOV = 55

const TAN_HALF = Math.tan(MathUtils.degToRad(CAMERA_FOV / 2))
const WIDE_MARGIN = 0.94
const UP = new Vector3(0, 1, 0)
const AXIS_X = new Vector3(1, 0, 0)
const HERO_DISTANCE = 3
const WIDE_DIRECTION = new Vector3(-0.08, 0.28, 1).normalize()
const LINK_DIRECTION = new Vector3(0.28, 0.4, 1).normalize()
export const KLAUS_DIRECTION = new Vector3(0.55, 0.32, 0.77).normalize()
const CHASE_BACK = 1.1
const CHASE_LEAD = 0.8
const CHASE_LIFT = 0.35
const CHASE_SIDE = 0.2
const HOLD_BACK = 1.5
const HOLD_SIDE = 1.6
const HOLD_LIFT = 0.6
const MILESTONE_FIRST = 0.1
const MILESTONE_GAP = 0.06
const MILESTONE_RUN = 0.1
const MILESTONE_LAND = 0.1
const MILESTONE_FADE: [number, number] = [0.6, 0.76]

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
  inside: number
  link: number
  klaus: number
  finale: number
  domains: number
  hero: Float32Array
  cards: Float32Array
  captions: Float32Array
  linkGlow: Float32Array
  milestones: Float32Array
  milestoneGlow: Float32Array
  cursor: Vector2
}

type PoseFn = (out: Pose, aspect: number) => void
type Window = [number, number, number, number]

interface Segment {
  start: number
  end: number
  from: PoseFn
  to: PoseFn
  follow: number
  arc: number
  zoom: boolean
}

export interface Timeline {
  length: number
  staticProgress: number
  sample: (progress: number, aspect: number, frame: Frame) => void
  focus: (branch: number, aspect: number, out: Pose) => void
}

export function createPose(): Pose {
  return { position: new Vector3(), look: new Vector3(), shiftX: 0, shiftY: 0 }
}

export function createFrame(): Frame {
  return {
    pose: createPose(),
    time: 0,
    open: 0,
    inside: 0,
    link: 0,
    klaus: 0,
    finale: 0,
    domains: 0,
    hero: new Float32Array(HERO_SLOTS).fill(-1),
    cards: new Float32Array(MAX_BRANCHES),
    captions: new Float32Array(2),
    linkGlow: new Float32Array(MAX_LINKS),
    milestones: new Float32Array(MAX_MILESTONES),
    milestoneGlow: new Float32Array(MAX_MILESTONES),
    cursor: new Vector2(10, 10),
  }
}

export function fitDistance(halfWidth: number, halfHeight: number, aspect: number): number {
  return Math.max(halfWidth / (TAN_HALF * aspect), halfHeight / TAN_HALF)
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
  const { branches, extent, me, links, milestones } = network
  const segments: Segment[] = []
  const from = createPose()
  const to = createPose()
  const hold = createPose()
  const point = new Vector3()
  const tangent = new Vector3()
  const side = new Vector3()
  const zoomFrom = new Vector3()
  const zoomTo = new Vector3()
  const cardWindows: Window[] = []
  const captionWindows: Window[] = []
  const linkWindows: Window[] = []
  const milestoneStarts: number[] = []
  const milestoneWindows: Window[] = []
  const milestoneGlowWindows: Window[] = []
  let domainWindow: Window = [0, 0, 0, 0]
  let finaleWindow: Window = [0, 0, 0, 0]
  const effects = { open: [0, 0], inside: [0, 0], outside: [0, 0], link: [0, 0], klaus: [0, 0] }
  let cursor = 0

  const sideOf = (direction: Vector3): Vector3 =>
    side.crossVectors(direction, Math.abs(direction.y) > 0.8 ? AXIS_X : UP).normalize()

  const heroPose: PoseFn = (out, aspect) => {
    const landscape = aspect >= 1
    out.look.copy(me)
    out.position
      .copy(me)
      .addScaledVector(HERO_VIEW, Math.max(HERO_DISTANCE, fitDistance(1.15, 1, aspect)))
    out.shiftX = landscape ? 0.42 : 0
    out.shiftY = landscape ? 0 : 0.5
  }

  const widePose =
    (direction: Vector3, margin: number): PoseFn =>
    (out, aspect) => {
      out.look.set(0, 0, 0)
      out.position
        .copy(direction)
        .multiplyScalar(fitDistance(extent.x * margin, extent.y * margin, aspect) + extent.z)
      out.shiftX = 0
      out.shiftY = 0
    }

  const klausPose: PoseFn = (out, aspect) => {
    const landscape = aspect >= 1
    out.look.set(0, 0, 0)
    out.position.copy(KLAUS_DIRECTION).multiplyScalar(Math.max(5.4, fitDistance(2.6, 2.6, aspect)))
    out.shiftX = landscape ? -0.34 : 0
    out.shiftY = landscape ? 0 : 0.32
  }

  const holdPose = (index: number, out: Pose, aspect: number): void => {
    const branch = branches[index]
    const landscape = aspect >= 1
    const zoom = landscape ? 1 : Math.min(2.2, 0.9 / aspect)
    branch.curve.getTangent(1, tangent)
    sideOf(tangent)
    out.look.copy(branch.node)
    out.position
      .copy(branch.node)
      .addScaledVector(tangent, -HOLD_BACK * zoom)
      .addScaledVector(side, HOLD_SIDE * zoom)
      .addScaledVector(UP, HOLD_LIFT * zoom)
    out.shiftX = landscape ? -0.5 : 0
    out.shiftY = landscape ? 0 : 0.3
  }

  const chase = (index: number, u: number, out: Pose, aspect: number): void => {
    const branch = branches[index]
    branch.curve.getPoint(u, point)
    branch.curve.getTangent(u, tangent)
    sideOf(tangent)
    out.position
      .copy(point)
      .addScaledVector(tangent, -CHASE_BACK)
      .addScaledVector(UP, CHASE_LIFT)
      .addScaledVector(side, CHASE_SIDE)
    out.look.copy(point).addScaledVector(tangent, CHASE_LEAD)
    out.shiftX = 0
    out.shiftY = 0
    holdPose(index, hold, aspect)
    blendPose(out, hold, ramp(u, 0.72, 1), out)
  }

  const push = (
    length: number,
    a: PoseFn,
    b: PoseFn,
    follow = -1,
    arc = 0,
    zoom = false,
  ): Segment => {
    const segment = { start: cursor, end: cursor + length, from: a, to: b, follow, arc, zoom }
    segments.push(segment)
    cursor += length
    return segment
  }

  push(LENGTHS.hero, heroPose, heroPose)
  const wide = widePose(WIDE_DIRECTION, WIDE_MARGIN)
  const link = widePose(LINK_DIRECTION, WIDE_MARGIN)
  const toWide = push(LENGTHS.toWide, heroPose, wide, -1, 0, true)
  const wideHold = push(LENGTHS.wideHold, wide, wide)
  effects.open = [toWide.start + 0.05, toWide.end - 0.15]
  captionWindows[0] = [
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
  milestones.forEach((_, index) => {
    const begin = toWide.start + MILESTONE_FIRST + index * MILESTONE_GAP
    const land = begin + MILESTONE_RUN
    const fade: [number, number] = [
      toWide.start + MILESTONE_FADE[0],
      toWide.start + MILESTONE_FADE[1],
    ]
    milestoneStarts[index] = begin
    milestoneGlowWindows[index] = [begin, land, fade[0], fade[1]]
    milestoneWindows[index] = [land, land + MILESTONE_LAND, fade[0], fade[1]]
  })
  let previous: PoseFn = wide
  const holds: Segment[] = []
  const follows: Segment[] = []
  branches.forEach((_, index) => {
    const start: PoseFn = (out, aspect) => chase(index, 0, out, aspect)
    const end: PoseFn = (out, aspect) => holdPose(index, out, aspect)
    const transit = push(LENGTHS.transit, previous, start, -1, index === 0 ? 0 : 0.25, index === 0)
    if (index === 0) effects.inside = [transit.start + 0.1, transit.end - 0.1]
    const joined = links.findIndex((link) => link.from === index - 1 && link.to === index)
    if (joined >= 0) {
      const span = transit.end - transit.start
      linkWindows[joined] = [
        transit.start + 0.12 * span,
        transit.start + 0.32 * span,
        transit.start + 0.62 * span,
        transit.start + 0.92 * span,
      ]
    }
    follows.push(push(LENGTHS.follow, start, end, index))
    holds.push(push(LENGTHS.hold, end, end))
    previous = end
  })
  const toLink = push(LENGTHS.toLink, previous, link, -1, 0.1, true)
  const linkHold = push(LENGTHS.linkHold, link, link)
  const toKlaus = push(LENGTHS.toKlaus, link, klausPose)
  const klausHold = push(LENGTHS.klausHold, klausPose, klausPose)
  effects.outside = [toLink.start + 0.05, toLink.start + 0.6 * (toLink.end - toLink.start)]
  effects.link = [toLink.start + 0.2, toLink.end - 0.1]
  captionWindows[1] = [
    toLink.start + 0.4,
    toLink.end - 0.05,
    linkHold.end + 0.05,
    linkHold.end + 0.35,
  ]
  effects.klaus = [toKlaus.start + 0.3, toKlaus.end]
  finaleWindow = [toKlaus.start + 0.75, toKlaus.end, klausHold.end, klausHold.end]
  follows.forEach((follow, index) => {
    const next = segments[segments.indexOf(holds[index]) + 1]
    cardWindows[index] = [
      follow.start + 0.72 * (follow.end - follow.start),
      follow.end,
      holds[index].end,
      holds[index].end + 0.35 * (next.end - next.start),
    ]
  })

  const length = cursor
  const staticProgress = 0

  const sample: Timeline['sample'] = (progress, aspect, frame) => {
    const scroll = MathUtils.clamp(progress, 0, 1) * length
    const segment =
      segments.find((candidate) => scroll <= candidate.end) ?? segments[segments.length - 1]
    const local = MathUtils.clamp((scroll - segment.start) / (segment.end - segment.start), 0, 1)

    frame.hero.fill(-1)
    if (segment.follow >= 0) {
      const u = MathUtils.lerp(local, smooth(local), 0.35)
      chase(segment.follow, u, frame.pose, aspect)
      frame.hero[segment.follow] = u
    } else if (segment.from === segment.to) {
      segment.from(frame.pose, aspect)
    } else {
      segment.from(from, aspect)
      segment.to(to, aspect)
      const eased = smooth(local)
      blendPose(from, to, eased, frame.pose)
      if (segment.zoom) {
        const near = from.position.distanceTo(from.look)
        const far = to.position.distanceTo(to.look)
        zoomFrom.copy(from.position).sub(from.look).normalize()
        zoomTo.copy(to.position).sub(to.look).normalize()
        frame.pose.position
          .copy(zoomFrom.lerp(zoomTo, eased).normalize())
          .multiplyScalar(near * Math.pow(far / near, eased))
          .add(frame.pose.look)
      }
      if (segment.arc > 0) {
        frame.pose.position
          .sub(frame.pose.look)
          .multiplyScalar(1 + segment.arc * Math.sin(Math.PI * eased))
          .add(frame.pose.look)
      }
    }

    frame.open = ramp(scroll, effects.open[0], effects.open[1])
    frame.inside =
      ramp(scroll, effects.inside[0], effects.inside[1]) *
      (1 - ramp(scroll, effects.outside[0], effects.outside[1]))
    frame.link = ramp(scroll, effects.link[0], effects.link[1])
    frame.klaus = ramp(scroll, effects.klaus[0], effects.klaus[1])
    frame.finale = inWindow(scroll, finaleWindow)
    frame.cards.fill(0)
    cardWindows.forEach((window, index) => {
      frame.cards[index] = inWindow(scroll, window)
    })
    frame.domains = inWindow(scroll, domainWindow)
    frame.linkGlow.fill(0)
    linkWindows.forEach((window, index) => {
      frame.linkGlow[index] = inWindow(scroll, window)
    })
    milestones.forEach((_, index) => {
      const run = (scroll - milestoneStarts[index]) / MILESTONE_RUN
      frame.hero[MAX_BRANCHES + index] = run >= 0 && run <= 1.3 ? run : -1
      frame.milestones[index] = inWindow(scroll, milestoneWindows[index])
      frame.milestoneGlow[index] = inWindow(scroll, milestoneGlowWindows[index])
    })
    frame.captions[0] = inWindow(scroll, captionWindows[0])
    frame.captions[1] = inWindow(scroll, captionWindows[1])
  }

  const focus: Timeline['focus'] = (branch, aspect, out) => {
    if (branch < 0) klausPose(out, aspect)
    else holdPose(branch, out, aspect)
  }

  return { length, staticProgress, sample, focus }
}
