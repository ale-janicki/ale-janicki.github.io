import { useCallback, useEffect, useRef, type RefObject } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

const GSAP_DEFAULT_LAG_THRESHOLD = 500
const GSAP_DEFAULT_LAG_ADJUSTED = 33

export function useFlightScroll(
  progressRef: RefObject<number>,
  enabled: boolean,
  locked: boolean,
): (progress: number) => void {
  const lenisRef = useRef<Lenis | null>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis()
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
    })
    triggerRef.current = trigger
    return () => {
      triggerRef.current = null
      trigger.kill()
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(GSAP_DEFAULT_LAG_THRESHOLD, GSAP_DEFAULT_LAG_ADJUSTED)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled, progressRef])

  useEffect(() => {
    if (locked) lenisRef.current?.stop()
    else lenisRef.current?.start()
  }, [locked, enabled])

  return useCallback((progress: number) => {
    const trigger = triggerRef.current
    if (!trigger) return
    lenisRef.current?.scrollTo(trigger.start + progress * (trigger.end - trigger.start), {
      duration: 1.6,
    })
  }, [])
}
