import { useEffect, useState, type RefObject } from 'react'
import type { Act } from '@/lib/synapse/length'

export function useFlightAct(
  progressRef: RefObject<number>,
  acts: Act[],
  length: number,
  enabled: boolean,
): number {
  const [act, setAct] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let current = -1
    const tick = () => {
      const scroll = progressRef.current * length
      let next = 0
      for (let i = 0; i < acts.length; i++) if (scroll >= acts[i].begin) next = i
      if (next !== current) {
        current = next
        setAct(next)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [progressRef, acts, length, enabled])

  return act
}
