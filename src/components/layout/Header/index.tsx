import { Button } from '@/components/ui/Button'
import styles from './styles.module.css'

interface HeaderProps {
  name: string
  onOpenProjects: () => void
  onOpenContact: () => void
  projectsDisabled: boolean
}

export function Header({ name, onOpenProjects, onOpenContact, projectsDisabled }: HeaderProps) {
  return (
    <header className={styles.header}>
      <a href="#top" className={styles.brand}>
        {name}
      </a>
      <nav className={styles.actions} aria-label="Quick access">
        <Button
          variant="secondary"
          size="sm"
          aria-haspopup="dialog"
          disabled={projectsDisabled}
          onClick={onOpenProjects}
        >
          Projects
        </Button>
        <Button
          variant="secondary"
          size="sm"
          aria-haspopup="dialog"
          disabled={projectsDisabled}
          onClick={onOpenContact}
        >
          Contact
        </Button>
      </nav>
    </header>
  )
}
