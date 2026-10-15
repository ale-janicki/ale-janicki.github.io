import { Section } from '@/components/layout/Section'
import type { Profile } from '@/content/profile'
import styles from './styles.module.css'

interface ContactProps {
  profile: Profile
}

export function Contact({ profile }: ContactProps) {
  return (
    <Section id="contact" label="Contact" full={false} align="right" mobileEnd>
      <p className={`mono ${styles.eyebrow}`}>03 / contact</p>
      <h2 className={styles.heading}>Let&apos;s talk</h2>
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
