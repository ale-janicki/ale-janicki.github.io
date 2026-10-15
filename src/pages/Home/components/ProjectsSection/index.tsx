import { Section } from '@/components/layout/Section'
import { ProjectList } from '@/pages/Home/components/ProjectList'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface ProjectsSectionProps {
  projects: Project[]
  onSelect: (id: string) => void
}

export function ProjectsSection({ projects, onSelect }: ProjectsSectionProps) {
  return (
    <Section id="projects" label="Projects" full={false}>
      <p className={`mono ${styles.eyebrow}`}>02 / projects</p>
      <h2 className={styles.heading}>Projects</h2>
      <div className={styles.list}>
        <ProjectList projects={projects} onSelect={onSelect} />
      </div>
    </Section>
  )
}
