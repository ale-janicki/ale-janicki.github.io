import { useCallback, useEffect, useRef, type RefObject } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

const GSAP_DEFAULT_LAG_THRESHOLD = 500
const GSAP_DEFAULT_LAG_ADJUSTED = 33
const SECONDS_PER_SVH = 1.2
const MIN_TRAVEL_S = 1.2
const MAX_TRAVEL_S = 4.5
const TRAVEL_MARGIN_MS = 150
const STILL_EDGE = 0.02

const RESPONSIVE_BLEND = 0.5

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const travelEase = (t: number) =>
  RESPONSIVE_BLEND * easeOutCubic(t) + (1 - RESPONSIVE_BLEND) * easeInOutCubic(t)

export function useFlightScroll(
  progressRef: RefObject<number>,
  enabled: boolean,
  locked: boolean,
): (progress: number, still?: [number, number]) => void {
  const lenisRef = useRef<Lenis | null>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const busyUntil = useRef(0)

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

  return useCallback((progress: number, still?: [number, number]) => {
    const trigger = triggerRef.current
    const lenis = lenisRef.current
    if (!trigger || !lenis || performance.now() < busyUntil.current) return
    const span = trigger.end - trigger.start
    const target = trigger.start + progress * span
    if (still) {
      const [from, until] = still.map((edge) => trigger.start + edge * span)
      if (lenis.scroll >= from && lenis.scroll <= until) {
        const edge = target > lenis.scroll ? until : from
        const inset = STILL_EDGE * window.innerHeight * Math.sign(lenis.scroll - edge)
        lenis.scrollTo(edge + inset, { immediate: true, force: true })
      }
    }
    const svh = Math.abs(target - lenis.scroll) / window.innerHeight
    const duration = Math.min(MAX_TRAVEL_S, Math.max(MIN_TRAVEL_S, svh * SECONDS_PER_SVH))
    busyUntil.current = performance.now() + duration * 1000 + TRAVEL_MARGIN_MS
    lenis.scrollTo(target, {
      duration,
      easing: travelEase,
      onComplete: () => {
        busyUntil.current = 0
      },
    })
  }, [])
}
