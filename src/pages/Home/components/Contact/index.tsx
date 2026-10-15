import type { CSSProperties } from 'react'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/content/profile'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface ContactProps {
  profile: Profile
  full: boolean
  klaus?: Project
  floating?: boolean
  onOpenKlaus?: (id: string) => void
}

export function Contact({ profile, full, klaus, floating = false, onOpenKlaus }: ContactProps) {
  return (
    <Section id="contact" label="Contact" full={full} align="right" mobileEnd reveal={full && !floating}>
      {klaus && (
        <div className={styles.klaus} style={{ '--branch': klaus.branch.color } as CSSProperties}>
          <p className={`mono ${styles.eyebrow}`}>the mind of the network</p>
          <h2 className={styles.heading}>{klaus.name}</h2>
          <p className={styles.tagline}>{klaus.tagline}</p>
          {klaus.highlight && <p className={`mono ${styles.highlight}`}>{klaus.highlight}</p>}
          <p className={styles.description}>{klaus.description}</p>
          {klaus.built && <p className={styles.description}>{klaus.built}</p>}
          {onOpenKlaus && (
            <Button
              variant="secondary"
              size="sm"
              className={styles.open}
              onClick={() => onOpenKlaus(klaus.id)}
            >
              Open {klaus.name}
            </Button>
          )}
        </div>
      )}
      {!klaus && (
        <>
          <p className={`mono ${styles.eyebrow}`}>03 / contact</p>
          <h2 className={styles.heading}>Let&apos;s talk</h2>
        </>
      )}
      <ul className={styles.links}>
        {profile.contacts.map((contact) => (
          <li key={contact.label}>
            <a
              className={styles.link}
              href={contact.href}
              {...(contact.href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              <span className={`mono ${styles.label}`}>{contact.label}</span>
              <span className={styles.value}>{contact.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
