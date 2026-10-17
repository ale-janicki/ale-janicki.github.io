import { Section } from '@/components/layout/Section'
import type { Profile } from '@/content/profile'
import { useLocale } from '@/i18n/useLocale'
import { externalLinkProps } from '@/lib/externalLink'
import styles from './styles.module.css'

interface ContactProps {
  profile: Profile
}

export function Contact({ profile }: ContactProps) {
  const { messages } = useLocale()
  return (
    <Section id="contact" label={messages.header.contact} full={false} align="right" mobileEnd>
      <p className={`mono ${styles.eyebrow}`}>{messages.contact.eyebrow}</p>
      <h2 className={styles.heading}>{messages.contact.heading}</h2>
      <ul className={styles.links}>
        {profile.contacts.map((contact) => (
          <li key={contact.label}>
            <a className={styles.link} href={contact.href} {...externalLinkProps(contact.href)}>
              <span className={`mono ${styles.label}`}>{contact.label}</span>
              <span className={styles.value}>{contact.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
