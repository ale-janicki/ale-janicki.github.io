import { Section } from '@/components/layout/Section'
import { useLocale } from '@/i18n/useLocale'
import { ProjectList } from '@/pages/Home/components/ProjectList'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface ProjectsSectionProps {
  projects: Project[]
  onSelect: (id: string) => void
}

export function ProjectsSection({ projects, onSelect }: ProjectsSectionProps) {
  const { messages } = useLocale()
  return (
    <Section id="projects" label={messages.projects.heading} full={false}>
      <p className={`mono ${styles.eyebrow}`}>{messages.projects.eyebrow}</p>
      <h2 className={styles.heading}>{messages.projects.heading}</h2>
      <div className={styles.list}>
        <ProjectList projects={projects} onSelect={onSelect} />
      </div>
    </Section>
  )
}
