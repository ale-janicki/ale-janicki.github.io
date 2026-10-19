import { useEffect, useRef, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FlightNav, type FlightNavConfig } from '@/components/layout/FlightNav'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/content/profile'
import { useContent } from '@/i18n/useContent'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useLocale } from '@/i18n/useLocale'
import { LENGTHS, PRESENTATION_ACT } from '@/lib/synapse/length'
import styles from './styles.module.css'

gsap.registerPlugin(ScrollTrigger)

const PRESENT_STEPS = 200
const LIFT_END = 0.7
const DOCK_PHOTO = 38
const PAIR_ON = 0.9
const PAIR_OFF = 0.3
const COVER_MS = 300

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number) => value * value * (3 - 2 * value)

interface HeroProps {
  profile: Profile
  full: boolean
  brandRef: RefObject<HTMLAnchorElement | null>
  dockRef: RefObject<HTMLSpanElement | null>
  nav: FlightNavConfig
  brandExit: [number, number]
  covered: boolean
  onMeet: () => void
}

function Identity({ profile }: { profile: Profile }) {
  const { messages } = useLocale()
  return (
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
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.title}>{profile.title}</p>
      </div>
    </div>
  )
}

function Details({ profile }: { profile: Profile }) {
  const { messages } = useLocale()
  return (
    <>
      <p className={styles.pitch}>{profile.pitch}</p>
      <p className={styles.now}>
        <span className={`mono ${styles.nowLabel}`}>{messages.hero.now}</span>
        {profile.current}
      </p>
      <dl className={styles.facts}>
        {profile.facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt className="mono">{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function FlightHero({
  profile,
  brandRef,
  dockRef,
  nav,
  brandExit,
  covered,
  onMeet,
}: Omit<HeroProps, 'full'>) {
  const { messages } = useLocale()
  const reducedMotion = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const restRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const slot = slotRef.current
    const rest = restRef.current
    const card = brandRef.current
    const dock = dockRef.current
    const photo = card?.querySelector('img')
    const name = card?.querySelector('h1')
    if (!stage || !slot || !rest || !card || !dock || !photo || !name) return
    let lifted = -1
    let left = -1
    let away = false
    let paired = false
    let exited = -1
    let hidden = false
    const measure = () => {
      card.style.width = `${slot.offsetWidth}px`
      const height = card.offsetHeight
      const scale = DOCK_PHOTO / photo.offsetWidth
      const docked = (name.offsetLeft + Math.max(name.offsetWidth, name.scrollWidth)) * scale
      stage.style.setProperty('--card-h', `${height}px`)
      dock.style.width = `${docked}px`
      const origin = stage.getBoundingClientRect()
      const from = slot.getBoundingClientRect()
      const mid = rest.getBoundingClientRect()
      const to = dock.getBoundingClientRect()
      card.style.setProperty('--x0', `${from.left - origin.left}px`)
      card.style.setProperty('--y0', `${from.top - origin.top}px`)
      card.style.setProperty('--x1', `${mid.left - origin.left}px`)
      card.style.setProperty('--y1', `${mid.top - origin.top}px`)
      card.style.setProperty('--x2', `${to.left}px`)
      card.style.setProperty('--y2', `${to.top + (to.height - height * scale) / 2}px`)
      card.style.setProperty('--s2', String(scale))
      card.style.setProperty('--ready', '1')
    }
    const apply = (scroll: number, progress: number) => {
      const svh = scroll / stage.clientHeight
      const present = Math.round(clamp01((svh - LENGTHS.landing) / LENGTHS.intro) * PRESENT_STEPS)
      const leave = Math.round(
        clamp01((svh - LENGTHS.landing - LENGTHS.intro - LENGTHS.presentation) / LENGTHS.toWide) *
          PRESENT_STEPS,
      )
      if (present !== lifted || leave !== left) {
        lifted = present
        left = leave
        stage.style.setProperty('--present', String(present / PRESENT_STEPS))
        stage.style.setProperty('--leave', String(leave / PRESENT_STEPS))
        card.style.setProperty(
          '--lift',
          String(smooth(clamp01(present / (PRESENT_STEPS * LIFT_END)))),
        )
        card.style.setProperty('--dock', String(smooth(leave / PRESENT_STEPS)))
      }
      const gone = present > PRESENT_STEPS * 0.4
      if (gone !== away) {
        away = gone
        stage.dataset.stage = gone ? 'presenting' : 'landing'
      }
      const exit = Math.round(
        clamp01((progress - brandExit[0]) / (brandExit[1] - brandExit[0])) * PRESENT_STEPS,
      )
      if (exit !== exited) {
        exited = exit
        card.style.setProperty('--exit', String(smooth(exit / PRESENT_STEPS)))
        const exitDone = exit >= PRESENT_STEPS
        if (exitDone !== hidden) {
          hidden = exitDone
          card.dataset.exit = exitDone ? 'on' : 'off'
        }
      }
      const pairing = present >= PRESENT_STEPS * PAIR_ON && leave <= PRESENT_STEPS * PAIR_OFF
      if (pairing !== paired) {
        paired = pairing
        stage.dataset.pair = pairing ? 'on' : 'off'
      }
    }
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onRefresh: (self) => {
        measure()
        apply(self.scroll(), self.progress)
      },
      onUpdate: (self) => apply(self.scroll(), self.progress),
    })
    let disposed = false
    void document.fonts.ready.then(() => {
      if (!disposed) trigger.refresh()
    })
    return () => {
      disposed = true
      trigger.kill()
    }
  }, [brandRef, dockRef, brandExit])

  useEffect(() => {
    const card = brandRef.current
    if (!card) return
    const fade = reducedMotion ? 0 : COVER_MS
    card.style.transition = `opacity ${fade}ms ease, visibility 0s linear ${covered ? fade : 0}ms`
    card.style.opacity = covered ? '0' : ''
    card.style.visibility = covered ? 'hidden' : ''
    card.inert = covered
    const settle = window.setTimeout(() => {
      card.style.transition = ''
    }, fade)
    return () => window.clearTimeout(settle)
  }, [brandRef, covered, reducedMotion])

  return (
    <div className={styles.pin}>
      <div
        ref={stageRef}
        className={styles.sticky}
        data-stage="landing"
        data-pair="off"
        data-covered={covered}
        inert={covered}
      >
        <Section id="top" label={messages.hero.introduction} full mobileEnd reveal={false}>
          <div className={styles.cell}>
            <div className={styles.landing}>
              <div ref={slotRef} className={styles.slot} />
              <Button size="lg" className={styles.meet} onClick={onMeet}>
                {messages.hero.meet(profile.name.split(' ')[0])}
              </Button>
              <p className={`mono ${styles.cue}`}>{messages.hero.cue}</p>
            </div>
            <div className={styles.details}>
              <div ref={restRef} className={styles.slot} />
              <Details profile={profile} />
              <FlightNav nav={nav} index={PRESENTATION_ACT} className={styles.pair} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

export function Hero({
  profile,
  full,
  brandRef,
  dockRef,
  nav,
  brandExit,
  covered,
  onMeet,
}: HeroProps) {
  const { messages } = useLocale()
  const { experience } = useContent()
  if (!full) {
    return (
      <Section id="top" label={messages.hero.introduction} full={false} mobileEnd>
        <Identity profile={profile} />
        <Details profile={profile} />
        <ol className={styles.career} aria-label={messages.hero.experience}>
          {experience.map((entry) => (
            <li key={entry.id}>
              <span className={`mono ${styles.period}`}>{entry.period}</span>
              <span className={styles.org}>
                {entry.org}, {entry.role}
              </span>
            </li>
          ))}
        </ol>
      </Section>
    )
  }
  return (
    <FlightHero
      profile={profile}
      brandRef={brandRef}
      dockRef={dockRef}
      nav={nav}
      brandExit={brandExit}
      covered={covered}
      onMeet={onMeet}
    />
  )
}
