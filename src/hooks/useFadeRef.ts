import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Frame } from '@/lib/synapse/timeline'

const OPACITY_STEPS = 1000

export function useFadeRef<T extends HTMLElement>(
  frameRef: RefObject<Frame>,
  read: (frame: Frame) => number,
): RefObject<T | null> {
  const ref = useRef<T>(null)
  const last = useRef<{ step: number; hidden: boolean | null; interactive: boolean | null }>({
    step: -1,
    hidden: null,
    interactive: null,
  })
  useFrame(() => {
    const element = ref.current
    if (!element) return
    const visibility = read(frameRef.current)
    const cache = last.current
    const step = Math.round(visibility * OPACITY_STEPS)
    if (step !== cache.step) {
      cache.step = step
      element.style.opacity = String(step / OPACITY_STEPS)
    }
    const hidden = visibility < 0.02
    if (hidden !== cache.hidden) {
      cache.hidden = hidden
      element.style.visibility = hidden ? 'hidden' : 'visible'
    }
    const interactive = visibility > 0.6
    if (interactive !== cache.interactive) {
      cache.interactive = interactive
      element.style.pointerEvents = interactive ? 'auto' : 'none'
    }
  })
  return ref
}
