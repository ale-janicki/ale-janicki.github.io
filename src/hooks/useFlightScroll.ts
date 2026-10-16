import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'
import { easeInOutCubic } from '@/lib/synapse/flight'

gsap.registerPlugin(ScrollTrigger)

const GSAP_DEFAULT_LAG_THRESHOLD = 500
const GSAP_DEFAULT_LAG_ADJUSTED = 33
const SECONDS_PER_SVH = 1.2
const MIN_TRAVEL_S = 1.2
const MAX_TRAVEL_S = 4.5
const TRAVEL_MARGIN_MS = 150
const STILL_EDGE = 0.02

const RESPONSIVE_BLEND = 0.5
const SNAP = { immediate: true, force: true }

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const travelEase = (t: number) =>
  RESPONSIVE_BLEND * easeOutCubic(t) + (1 - RESPONSIVE_BLEND) * easeInOutCubic(t)

interface FlightScroll {
  scrollTo: (progress: number, still?: [number, number]) => void
  glideTo: (progress: number, seconds: number) => void
  settleAt: (progress: number) => void
}

export function useFlightScroll(
  progressRef: RefObject<number>,
  enabled: boolean,
  locked: boolean,
): FlightScroll {
  const lenisRef = useRef<Lenis | null>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const glideRef = useRef<gsap.core.Tween | null>(null)
  const lockedRef = useRef(locked)
  const flyingRef = useRef(false)
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
      glideRef.current?.kill()
      glideRef.current = null
      trigger.kill()
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(GSAP_DEFAULT_LAG_THRESHOLD, GSAP_DEFAULT_LAG_ADJUSTED)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled, progressRef])

  useEffect(() => {
    lockedRef.current = locked
    if (locked || flyingRef.current) lenisRef.current?.stop()
    else lenisRef.current?.start()
  }, [locked, enabled])

  const scrollTo = useCallback((progress: number, still?: [number, number]) => {
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
        lenis.scrollTo(edge + inset, SNAP)
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

  const glideTo = useCallback((progress: number, seconds: number) => {
    const trigger = triggerRef.current
    const lenis = lenisRef.current
    if (!trigger || !lenis) return
    glideRef.current?.kill()
    glideRef.current = null
    busyUntil.current = 0
    flyingRef.current = true
    lenis.stop()
    if (seconds <= 0) return
    const position = { value: lenis.scroll }
    const target = trigger.start + progress * (trigger.end - trigger.start)
    glideRef.current = gsap.to(position, {
      value: target,
      duration: seconds,
      ease: easeInOutCubic,
      onUpdate: () => lenis.scrollTo(position.value, SNAP),
    })
  }, [])

  const settleAt = useCallback(
    (progress: number) => {
      const trigger = triggerRef.current
      const lenis = lenisRef.current
      glideRef.current?.kill()
      glideRef.current = null
      flyingRef.current = false
      if (!trigger || !lenis) return
      lenis.scrollTo(trigger.start + progress * (trigger.end - trigger.start), SNAP)
      progressRef.current = progress
      if (!lockedRef.current) lenis.start()
    },
    [progressRef],
  )

  return useMemo(() => ({ scrollTo, glideTo, settleAt }), [scrollTo, glideTo, settleAt])
}
