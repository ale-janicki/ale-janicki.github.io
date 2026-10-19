import type { MouseEvent, RefObject } from 'react'
import { HeaderMenu } from '@/components/layout/HeaderMenu'
import { LanguageMenu } from '@/components/layout/LanguageMenu'
import { ProjectsMenu } from '@/components/layout/ProjectsMenu'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/content/profile'
import { useLocale } from '@/i18n/useLocale'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface HeaderProps {
  profile: Profile
  projects: Project[]
  activeId: string | null
  flight: boolean
  atContact: boolean
  brandRef: RefObject<HTMLAnchorElement | null>
  dockRef: RefObject<HTMLSpanElement | null>
  onHome: () => void
  onSelectProject: (id: string) => void
  onOpenContact: () => void
}

export function Header({
  profile,
  projects,
  activeId,
  flight,
  atContact,
  brandRef,
  dockRef,
  onHome,
  onSelectProject,
  onOpenContact,
}: HeaderProps) {
  const { messages } = useLocale()
  const handleHome = (event: MouseEvent) => {
    event.preventDefault()
    onHome()
  }

  return (
    <header className={styles.header}>
      {flight ? (
        <>
          <a ref={brandRef} href="#top" className={styles.card} onClick={handleHome}>
            <img
              className={styles.cardPhoto}
              src={profile.photo}
              alt={messages.header.portrait(profile.name)}
              width={460}
              height={460}
              decoding="async"
            />
            <span className={styles.meta}>
              <h1 className={styles.cardName}>{profile.name}</h1>
              <p className={styles.cardTitle}>
                {profile.title.split(' · ').map((part, index) => (
                  <span key={part} className={styles.titlePart}>
                    {index > 0 && <span className={styles.titleDot}> · </span>}
                    {part}
                  </span>
                ))}
              </p>
            </span>
          </a>
          <span ref={dockRef} className={styles.dock} aria-hidden="true" />
        </>
      ) : (
        <a href="#top" className={styles.brand}>
          <img
            className={styles.brandPhoto}
            src={profile.photo}
            alt=""
            width={64}
            height={64}
            decoding="async"
          />
          {profile.name}
        </a>
      )}
      <nav className={styles.actions} aria-label={messages.header.quickAccess}>
        <ProjectsMenu projects={projects} activeId={activeId} onSelect={onSelectProject} />
        <span className={styles.contactSlot} data-hidden={atContact} inert={atContact}>
          <Button variant="secondary" size="sm" onClick={onOpenContact}>
            {messages.header.contact}
          </Button>
        </span>
        <LanguageMenu />
      </nav>
      <div className={styles.compact}>
        <span className={styles.contactSlot} data-hidden={atContact} inert={atContact}>
          <Button variant="secondary" size="sm" onClick={onOpenContact}>
            {messages.header.contact}
          </Button>
        </span>
        <HeaderMenu projects={projects} activeId={activeId} onSelectProject={onSelectProject} />
      </div>
    </header>
  )
}
