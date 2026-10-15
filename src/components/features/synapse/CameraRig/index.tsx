import { useEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import {
  CAMERA_FOV,
  blendPose,
  createPose,
  createView,
  type Frame,
  type Timeline,
} from '@/lib/synapse/timeline'

const PROGRESS_DAMPING = 8

interface CameraRigProps {
  timeline: Timeline
  frameRef: RefObject<Frame>
  progressRef: RefObject<number>
  focus: number | null
  animated: boolean
}

const TAN_HALF = Math.tan(MathUtils.degToRad(CAMERA_FOV / 2))
const PARALLAX = 0.022
const STATIC_TIME = 3.7

export function CameraRig({ timeline, frameRef, progressRef, focus, animated }: CameraRigProps) {
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

    if (animated) {
      s.progress = MathUtils.damp(s.progress, progressRef.current, PROGRESS_DAMPING, dt)
      frame.time += dt
      s.blend = MathUtils.damp(s.blend, s.focus !== null ? 1 : 0, 2.6, dt)
    } else {
      frame.time = STATIC_TIME
    }
    timeline.sample(animated ? s.progress : 0, s.view, frame)

    const lastFocus = s.lastFocus
    if (s.blend > 0.001 && lastFocus !== null) {
      const eased = s.blend * s.blend * (3 - 2 * s.blend)
      timeline.focus(lastFocus, s.view, s.focusPose)
      blendPose(frame.pose, s.focusPose, eased, frame.pose)
      frame.open = MathUtils.lerp(frame.open, 1, eased)
      frame.paths = MathUtils.lerp(frame.paths, 1, eased)
      frame.inside = MathUtils.lerp(frame.inside, 1, eased)
      frame.cards.forEach((value, index) => {
        frame.cards[index] = value * (1 - eased)
      })
      frame.hero.fill(-1)
      frame.techs.fill(0)
    }

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
    camera.translateX(-shiftX * halfHeight * aspect + s.smoothX * PARALLAX * distance)
    camera.translateY(-shiftY * halfHeight + s.smoothY * PARALLAX * distance * 0.6)
  })

  return null
}
