import { useEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Quaternion, Vector3 } from 'three'
import { easeInOutCubic, type FlightRequest } from '@/lib/synapse/flight'
import {
  TAN_HALF,
  blendPose,
  createPose,
  createFrame,
  createView,
  type Frame,
  type Timeline,
} from '@/lib/synapse/timeline'

const PROGRESS_DAMPING = 8
const QUIET_OUT_RATE = 14
const QUIET_IN_RATE = 4.5
const QUIET_EPSILON = 0.002
const MIN_RADIUS = 0.001

interface CameraRigProps {
  timeline: Timeline
  frameRef: RefObject<Frame>
  progressRef: RefObject<number>
  flightRef: RefObject<FlightRequest | null>
  focus: number | null
  reducedMotion: boolean
}

const PARALLAX = 0.022
const CALM_TIME_SCALE = 0.25

function scaleContent(frame: Frame, factor: number): void {
  frame.caption *= factor
  frame.domains *= factor
  frame.tips *= factor
  frame.contact *= factor
  for (let i = 0; i < frame.cards.length; i++) frame.cards[i] *= factor
  for (let i = 0; i < frame.techs.length; i++) frame.techs[i] *= factor
}

export function CameraRig({
  timeline,
  frameRef,
  progressRef,
  flightRef,
  focus,
  reducedMotion,
}: CameraRigProps) {
  const state = useRef({
    progress: 0,
    blend: 0,
    pointerX: 10,
    pointerY: 10,
    smoothX: 0,
    smoothY: 0,
    focus: null as number | null,
    lastFocus: null as number | null,
    focusPose: createPose(),
    view: createView(),
    quiet: 0,
    flying: false,
    elapsed: 0,
    request: null as FlightRequest | null,
    target: createFrame(),
    fromPosition: new Vector3(),
    fromLook: new Vector3(),
    toLook: new Vector3(),
    fromDirection: new Vector3(),
    direction: new Vector3(),
    swing: new Quaternion(),
    step: new Quaternion(),
    fromRadius: 1,
    toRadius: 1,
    fromShiftX: 0,
    fromShiftY: 0,
    fromOpen: 0,
    fromPaths: 0,
    fromInside: 0,
  })

  useEffect(() => {
    state.current.focus = focus
    if (focus !== null) state.current.lastFocus = focus
  }, [focus])

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      state.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      state.current.pointerY = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    const handleLeave = () => {
      state.current.pointerX = 10
      state.current.pointerY = 10
    }
    const root = document.documentElement
    window.addEventListener('pointermove', handleMove)
    root.addEventListener('pointerleave', handleLeave)
    root.addEventListener('mouseleave', handleLeave)
    window.addEventListener('blur', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      root.removeEventListener('pointerleave', handleLeave)
      root.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('blur', handleLeave)
    }
  }, [])

  useFrame(({ camera, size }, delta) => {
    const s = state.current
    const frame = frameRef.current
    const dt = Math.min(delta, 0.05)
    const aspect = size.width / size.height
    s.view.aspect = aspect
    s.view.width = size.width

    if (!s.flying && flightRef.current) {
      const request = flightRef.current
      flightRef.current = null
      timeline.sample(request.progress, s.view, s.target)
      s.request = request
      s.flying = true
      s.elapsed = 0
      s.blend = 0
      s.fromPosition.copy(frame.pose.position)
      s.fromLook.copy(frame.pose.look)
      s.toLook.copy(s.target.pose.look)
      s.fromDirection.copy(s.fromPosition)
      s.direction.copy(s.target.pose.position)
      s.fromRadius = Math.max(s.fromDirection.length(), MIN_RADIUS)
      s.toRadius = Math.max(s.direction.length(), MIN_RADIUS)
      s.fromDirection.divideScalar(s.fromRadius)
      s.direction.divideScalar(s.toRadius)
      s.swing.setFromUnitVectors(s.fromDirection, s.direction)
      s.fromShiftX = frame.pose.shiftX
      s.fromShiftY = frame.pose.shiftY
      s.fromOpen = frame.open
      s.fromPaths = frame.paths
      s.fromInside = frame.inside
    }
    if (s.flying && s.request && s.elapsed >= s.request.seconds) {
      const { progress, onArrive } = s.request
      s.flying = false
      s.request = null
      s.progress = progress
      onArrive()
    }

    const focusTarget = s.focus !== null ? 1 : 0
    if (s.flying) s.elapsed += dt
    else if (reducedMotion) s.progress = progressRef.current
    else s.progress = MathUtils.damp(s.progress, progressRef.current, PROGRESS_DAMPING, dt)
    frame.time += reducedMotion ? dt * CALM_TIME_SCALE : dt
    s.blend = reducedMotion ? focusTarget : MathUtils.damp(s.blend, focusTarget, 2.6, dt)
    timeline.sample(s.progress, s.view, frame)

    const lastFocus = s.lastFocus
    if (s.blend > 0.001 && lastFocus !== null) {
      const eased = s.blend * s.blend * (3 - 2 * s.blend)
      timeline.focus(lastFocus, s.view, s.focusPose)
      blendPose(frame.pose, s.focusPose, eased, frame.pose)
      frame.open = MathUtils.lerp(frame.open, 1, eased)
      frame.paths = MathUtils.lerp(frame.paths, 1, eased)
      frame.inside = MathUtils.lerp(frame.inside, 1, eased)
      for (let i = 0; i < frame.cards.length; i++) frame.cards[i] *= 1 - eased
      frame.hero.fill(-1)
      frame.techs.fill(0)
    }

    if (s.flying && s.request) {
      const eased = easeInOutCubic(Math.min(1, s.elapsed / s.request.seconds))
      const pose = frame.pose
      s.step.identity().slerp(s.swing, eased)
      pose.position
        .copy(s.fromDirection)
        .applyQuaternion(s.step)
        .multiplyScalar(s.fromRadius * Math.pow(s.toRadius / s.fromRadius, eased))
      pose.look.lerpVectors(s.fromLook, s.toLook, eased)
      pose.shiftX = MathUtils.lerp(s.fromShiftX, s.target.pose.shiftX, eased)
      pose.shiftY = MathUtils.lerp(s.fromShiftY, s.target.pose.shiftY, eased)
      frame.open = MathUtils.lerp(s.fromOpen, s.target.open, eased)
      frame.paths = MathUtils.lerp(s.fromPaths, s.target.paths, eased)
      frame.inside = MathUtils.lerp(s.fromInside, s.target.inside, eased)
      frame.hero.fill(-1)
    }
    s.quiet = MathUtils.damp(
      s.quiet,
      s.flying ? 1 : 0,
      s.flying ? QUIET_OUT_RATE : QUIET_IN_RATE,
      dt,
    )
    if (s.quiet > QUIET_EPSILON) scaleContent(frame, 1 - s.quiet)

    const onScreen = s.pointerX < 5
    const targetX = onScreen ? s.pointerX : 0
    const targetY = onScreen ? s.pointerY : 0
    s.smoothX = MathUtils.damp(s.smoothX, targetX, 2.2, dt)
    s.smoothY = MathUtils.damp(s.smoothY, targetY, 2.2, dt)
    if (onScreen) frame.cursor.set(s.pointerX, s.pointerY)
    else frame.cursor.set(10, 10)

    const { position, look, shiftX, shiftY } = frame.pose
    camera.position.copy(position)
    camera.lookAt(look)
    const distance = position.distanceTo(look)
    const halfHeight = distance * TAN_HALF
    const parallax = reducedMotion ? 0 : PARALLAX
    camera.translateX(-shiftX * halfHeight * aspect + s.smoothX * parallax * distance)
    camera.translateY(-shiftY * halfHeight + s.smoothY * parallax * distance * 0.6)
  })

  return null
}
