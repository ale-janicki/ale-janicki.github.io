import type { MouseEvent, RefObject } from 'react'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/content/profile'
import styles from './styles.module.css'

interface HeaderProps {
  profile: Profile
  flight: boolean
  brandRef: RefObject<HTMLAnchorElement | null>
  dockRef: RefObject<HTMLSpanElement | null>
  onHome: () => void
  onOpenProjects: () => void
  onOpenContact: () => void
  projectsDisabled: boolean
}

export function Header({
  profile,
  flight,
  brandRef,
  dockRef,
  onHome,
  onOpenProjects,
  onOpenContact,
  projectsDisabled,
}: HeaderProps) {
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
              alt={`Portrait of ${profile.name}`}
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
