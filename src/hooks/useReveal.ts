import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useReveal(
  ref: RefObject<HTMLElement | null>,
  visibleClass: string,
  enabled: boolean,
): void {
  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      end: 'bottom 15%',
      toggleClass: { targets: element, className: visibleClass },
    })
    return () => trigger.kill()
  }, [ref, visibleClass, enabled])
}
