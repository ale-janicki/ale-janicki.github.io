import type { RefObject } from 'react'
import { Html } from '@react-three/drei'
import { FlightNav, type FlightNavConfig } from '@/components/layout/FlightNav'
import { profile } from '@/content/profile'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface ContactPanelProps {
  frameRef: RefObject<Frame>
  nav: FlightNavConfig
  navIndex: number
}

const screenCenter = (_: unknown, __: unknown, size: { width: number; height: number }) =>
  [size.width / 2, size.height / 2] as [number, number]

export function ContactPanel({ frameRef, nav, navIndex }: ContactPanelProps) {
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.contact)
  return (
    <Html
      fullscreen
      calculatePosition={screenCenter}
      zIndexRange={[10, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div ref={ref} className={styles.layer}>
        <section className={styles.panel} aria-label="Contact">
          <div className={styles.identity}>
            <img
              className={styles.photo}
              src={profile.photo}
              alt={`Portrait of ${profile.name}`}
              width={460}
              height={460}
              decoding="async"
            />
            <div className={styles.meta}>
              <h2 className={styles.name}>{profile.name}</h2>
              <p className={styles.title}>{profile.title}</p>
            </div>
          </div>
          <p className={`mono ${styles.eyebrow}`}>Let&apos;s talk</p>
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
          <FlightNav nav={nav} index={navIndex} className={styles.pair} />
        </section>
      </div>
    </Html>
  )
}
