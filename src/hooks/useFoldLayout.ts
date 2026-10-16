import { useLayoutEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Fold } from '@/lib/synapse/region'

const FOLD_BOUNDS = '(min-width: 600px) and (max-width: 1100px) and (pointer: coarse)'
const FOLD_COLUMNS = `${FOLD_BOUNDS} and (max-width: 767px) and (min-aspect-ratio: 4/5) and (aspect-ratio < 1), (horizontal-viewport-segments: 2)`
const FOLD_ROWS = `${FOLD_BOUNDS} and (aspect-ratio >= 1) and (max-aspect-ratio: 5/4), (vertical-viewport-segments: 2)`

export function useFoldLayout(): Fold | null {
  const columns = useMediaQuery(FOLD_COLUMNS)
  const rows = useMediaQuery(FOLD_ROWS)
  const fold = columns ? 'columns' : rows ? 'rows' : null

  const applied = useRef(false)

  useLayoutEffect(() => {
    const root = document.documentElement
    if (fold) root.dataset.fold = fold
    else delete root.dataset.fold
    if (applied.current) ScrollTrigger.refresh()
    applied.current = true
    return () => {
      delete root.dataset.fold
    }
  }, [fold])

  return fold
}
