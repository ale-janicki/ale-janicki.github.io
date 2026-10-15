import type { ContactLink } from '@/content/profile'
import styles from './styles.module.css'

interface ContactListProps {
  contacts: ContactLink[]
}

export function ContactList({ contacts }: ContactListProps) {
  return (
    <ul className={styles.list}>
      {contacts.map((contact) => (
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
  )
}
