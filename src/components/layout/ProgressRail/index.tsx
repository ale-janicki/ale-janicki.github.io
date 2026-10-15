import { Button } from '@/components/ui/Button'
import type { Act } from '@/lib/synapse/length'
import styles from './styles.module.css'

interface ProgressRailProps {
  acts: Act[]
  active: number
  length: number
  onJump: (progress: number) => void
}

export function ProgressRail({ acts, active, length, onJump }: ProgressRailProps) {
  return (
    <nav className={styles.rail} aria-label="Story progress">
      <ol className={styles.list}>
        {acts.map((act, index) => (
          <li key={act.label}>
            <Button
              variant="ghost"
              size="sm"
              className={styles.item}
              aria-current={index === active ? 'step' : undefined}
              onClick={() => onJump(act.stop / length)}
            >
              <span className={`mono ${styles.label}`}>{act.label}</span>
              <span className={styles.dot} aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
