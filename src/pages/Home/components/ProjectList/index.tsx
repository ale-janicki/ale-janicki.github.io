import { Button } from '@/components/ui/Button'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface ProjectListProps {
  projects: Project[]
  onSelect: (id: string) => void
}

export function ProjectList({ projects, onSelect }: ProjectListProps) {
  return (
    <ul className={styles.list}>
      {projects.map((project) => (
        <li key={project.id}>
          <Button variant="secondary" className={styles.item} onClick={() => onSelect(project.id)}>
            <span className={styles.text}>
              <span className={styles.name}>{project.name}</span>
              <span className={styles.tagline}>{project.tagline}</span>
            </span>
            <span aria-hidden="true">→</span>
          </Button>
        </li>
      ))}
    </ul>
  )
}
