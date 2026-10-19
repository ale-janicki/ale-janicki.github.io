import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { useContent } from '@/i18n/useContent'
import { useLocale } from '@/i18n/useLocale'
import { BRAIN_ACT, FIRST_BRANCH_ACT, PRESENTATION_ACT, type Act } from '@/lib/synapse/length'
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
  const { messages } = useLocale()
  const { profile } = useContent()
  const { acts, length, hidden, onJump, onTop } = nav
  const prev = index > 0 ? acts[index - 1] : null
  const next = index < acts.length - 1 ? acts[index + 1] : null
  const onBranch = index >= FIRST_BRANCH_ACT && index < acts.length - 1
  const nextIsContact = index + 1 === acts.length - 1
  const backText =
    index === BRAIN_ACT
      ? profile.name.split(' ')[0]
      : index === FIRST_BRANCH_ACT
        ? messages.nav.stack
        : onBranch
          ? messages.nav.previous
          : index === PRESENTATION_ACT
            ? messages.nav.start
            : index === acts.length - 1
              ? messages.header.projects
              : prev?.label
  const nextText =
    index === PRESENTATION_ACT
      ? messages.nav.stack
      : index === BRAIN_ACT
        ? messages.header.projects
        : onBranch && !nextIsContact
          ? messages.nav.nextShort
          : next?.label
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
      aria-label={messages.nav.story}
      aria-hidden={hidden}
      inert={hidden}
    >
      {prev && (
        <Button
          variant="secondary"
          size="lg"
          className={styles.button}
          aria-label={messages.nav.backTo(prev.label)}
          onClick={handleBack}
        >
          <Arrow back />
          <span className={styles.label}>
            <span className={styles.verb}>{messages.nav.back}</span>
            {backText}
          </span>
        </Button>
      )}
      {next && (
        <Button
          size="lg"
          className={styles.button}
          aria-label={messages.nav.nextTo(next.label)}
          onClick={handleNext}
        >
          <span className={styles.label}>
            <span className={styles.verb}>{messages.nav.next}</span>
            {nextText}
          </span>
          <Arrow />
        </Button>
      )}
      {!next && onTop && (
        <Button size="lg" className={styles.button} onClick={onTop}>
          <span className={styles.label}>{messages.nav.backToTop}</span>
          <Arrow up />
        </Button>
      )}
    </nav>
  )
}
