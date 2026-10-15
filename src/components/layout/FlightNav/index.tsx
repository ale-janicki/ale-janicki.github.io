import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import type { Act } from '@/lib/synapse/length'
import styles from './styles.module.css'

export interface FlightNavConfig {
  acts: Act[]
  length: number
  hidden: boolean
  onJump: (progress: number, still?: [number, number]) => void
  onTop?: () => void
}

interface FlightNavProps {
  nav: FlightNavConfig
  index: number
  className?: string
}

const ARROW_PATHS = {
  back: 'M10 3 5 8l5 5',
  next: 'M6 3l5 5-5 5',
  up: 'M3 10l5-5 5 5',
}

export function Arrow({ back, up }: { back?: boolean; up?: boolean }) {
  const path = up ? ARROW_PATHS.up : back ? ARROW_PATHS.back : ARROW_PATHS.next
  return (
    <svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

export function FlightNav({ nav, index, className }: FlightNavProps) {
  const { acts, length, hidden, onJump, onTop } = nav
  const prev = index > 0 ? acts[index - 1] : null
  const next = index < acts.length - 1 ? acts[index + 1] : null
  const [from, until] = acts[index].still
  const still = useMemo<[number, number]>(
    () => [from / length, until / length],
    [from, until, length],
  )

  const handleBack = useCallback(() => {
    if (prev) onJump(prev.stop / length, still)
  }, [prev, length, onJump, still])
  const handleNext = useCallback(() => {
    if (next) onJump(next.stop / length, still)
  }, [next, length, onJump, still])

  return (
    <nav
      className={[styles.nav, className].filter(Boolean).join(' ')}
      data-hidden={hidden}
      aria-label="Story navigation"
      aria-hidden={hidden}
      inert={hidden}
    >
      {prev && (
        <Button
          variant="secondary"
          size="lg"
          className={styles.button}
          aria-label={`Back to ${prev.label}`}
          onClick={handleBack}
        >
          <Arrow back />
          <span className={styles.label}>
            <span className={styles.verb}>Back: </span>
            {prev.label}
          </span>
        </Button>
      )}
      {next && (
        <Button
          size="lg"
          className={styles.button}
          aria-label={`Next: ${next.label}`}
          onClick={handleNext}
        >
          <span className={styles.label}>
            <span className={styles.verb}>Next: </span>
            {next.label}
          </span>
          <Arrow />
        </Button>
      )}
      {!next && onTop && (
        <Button size="lg" className={styles.button} onClick={onTop}>
          <span className={styles.label}>Back to top</span>
          <Arrow up />
        </Button>
      )}
    </nav>
  )
}
