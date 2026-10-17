import type { RefObject } from 'react'
import { LocalizedHtml } from '@/components/features/synapse/LocalizedHtml'
import { FlightNav, type FlightNavConfig } from '@/components/layout/FlightNav'
import { useFadeRef } from '@/hooks/useFadeRef'
import { useContent } from '@/i18n/useContent'
import { useLocale } from '@/i18n/useLocale'
import { externalLinkProps } from '@/lib/externalLink'
import { screenCenter } from '@/lib/synapse/html'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface ContactPanelProps {
  frameRef: RefObject<Frame>
  nav: FlightNavConfig
  navIndex: number
}

export function ContactPanel({ frameRef, nav, navIndex }: ContactPanelProps) {
  const { messages } = useLocale()
  const { profile } = useContent()
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.contact)
  return (
    <LocalizedHtml
      fullscreen
      calculatePosition={screenCenter}
      zIndexRange={[10, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div ref={ref} className={styles.layer}>
        <section className={styles.panel} aria-label={messages.header.contact}>
          <div className={styles.identity}>
            <img
              className={styles.photo}
              src={profile.photo}
              alt={messages.header.portrait(profile.name)}
              width={460}
              height={460}
              decoding="async"
            />
            <div className={styles.meta}>
              <h2 className={styles.name}>{profile.name}</h2>
              <p className={styles.title}>{profile.title}</p>
            </div>
          </div>
          <p className={`mono ${styles.eyebrow}`}>{messages.contact.heading}</p>
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
          <FlightNav nav={nav} index={navIndex} className={styles.pair} />
        </section>
      </div>
    </LocalizedHtml>
  )
}
