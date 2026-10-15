import { Section } from '@/components/layout/Section'
import type { Profile } from '@/content/profile'
import styles from './styles.module.css'

interface HeroProps {
  profile: Profile
  full: boolean
}

export function Hero({ profile, full }: HeroProps) {
  return (
    <Section id="top" label="Introduction" full={full} mobileEnd>
      <p className={`mono ${styles.eyebrow}`}>{profile.location}</p>
      <h1 className={styles.name}>{profile.name}</h1>
      <p className={styles.title}>{profile.title}</p>
      <p className={styles.pitch}>{profile.pitch}</p>
      <p className={styles.about}>{profile.current}</p>
      {full && <p className={`mono ${styles.cue}`}>Scroll to follow the signal</p>}
    </Section>
  )
}
