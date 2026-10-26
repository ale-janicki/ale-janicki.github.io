import { useEffect, useRef } from 'react'
import { Arrow } from '@/components/layout/FlightNav'
import { Button } from '@/components/ui/Button'
import buttonStyles from '@/components/ui/Button/styles.module.css'
import { Chip } from '@/components/ui/Chip'
import { useLocale } from '@/i18n/useLocale'
import { trapTab } from '@/lib/trapTab'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface ProjectPanelProps {
  project: Project
  onClose: () => void
  onBack: () => void
}

export function ProjectPanel({ project, onClose, onBack }: ProjectPanelProps) {
  const { messages } = useLocale()
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus({ preventScroll: true })
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
      else if (panelRef.current) trapTab(event, panelRef.current)
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previous?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <aside
      ref={panelRef}
      className={styles.panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-panel-title"
      data-lenis-prevent
    >
      <p className={`mono ${styles.eyebrow}`}>{messages.panel.branch}</p>
      <h2 id="project-panel-title" className={styles.name}>
        {project.name}
      </h2>
      <p className={styles.tagline}>{project.tagline}</p>
      {project.highlight && <p className={`mono ${styles.highlight}`}>{project.highlight}</p>}
      <p className={styles.description}>{project.description}</p>
      {project.problem && (
        <>
          <h3 className={`mono ${styles.label}`}>{messages.panel.problem}</h3>
          <p className={styles.detail}>{project.problem}</p>
        </>
      )}
      {project.built && (
        <>
          <h3 className={`mono ${styles.label}`}>{messages.panel.built}</h3>
          <p className={styles.detail}>{project.built}</p>
        </>
      )}
      {project.demoHint && <p className={styles.demo}>{project.demoHint}</p>}
      <ul className={styles.stack} aria-label={messages.projects.stack}>
        {project.stack.map((tech) => (
          <li key={tech}>
            <Chip>{tech}</Chip>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        {project.demoUrl ? (
          <a
            className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.demoLink}`}
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.panel.launchDemo}
          </a>
        ) : (
          <Button disabled>{messages.panel.demoSoon}</Button>
        )}
        <Button ref={closeRef} variant="secondary" size="lg" onClick={onBack}>
          <Arrow back />
          {messages.panel.back}
        </Button>
      </div>
    </aside>
  )
}
