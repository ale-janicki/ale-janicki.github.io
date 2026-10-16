import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { ProjectPanel } from '@/components/features/ProjectPanel'
import { CssNetwork } from '@/components/layout/CssNetwork'
import type { FlightNavConfig } from '@/components/layout/FlightNav'
import { Header } from '@/components/layout/Header'
import { ProgressRail } from '@/components/layout/ProgressRail'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { useFlightAct } from '@/hooks/useFlightAct'
import { useFlightScroll } from '@/hooks/useFlightScroll'
import { useFoldLayout } from '@/hooks/useFoldLayout'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRenderMode } from '@/hooks/useRenderMode'
import { FLIGHT_SECONDS, type FlightRequest } from '@/lib/synapse/flight'
import {
  FIRST_BRANCH_ACT,
  LENGTHS,
  MAX_BRANCHES,
  PRELUDE,
  PRESENTATION_ACT,
  flightActs,
  timelineLength,
} from '@/lib/synapse/length'
import { Contact } from './components/Contact'
import { Hero } from './components/Hero'
import { ProjectsSection } from './components/ProjectsSection'
import styles from './styles.module.css'

const Scene = lazy(() => import('@/components/features/synapse/Scene'))

const LANDING_EPSILON = 0.001
const branches = projects.slice(0, MAX_BRANCHES)
const flightLength = timelineLength(branches.length)
const acts = flightActs(branches.map((project) => project.name))
const meetStop = acts[PRESENTATION_ACT].stop / flightLength
const contactStop = acts[acts.length - 1].stop / flightLength
const contactStart = acts[acts.length - 1].still[0]
const brandExit: [number, number] = [
  (contactStart - LENGTHS.toContact * 0.45) / flightLength,
  (contactStart + 0.1) / flightLength,
]
const meetStill: [number, number] = [
  acts[0].still[0] / flightLength,
  acts[0].still[1] / flightLength,
]
const trackHeight = `calc(${flightLength - PRELUDE + 1} * 100svh)`

export function HomePage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sceneFailed, setSceneFailed] = useState(false)
  const mode = useRenderMode(sceneFailed)
  const isMobile = useIsMobile()
  const fold = useFoldLayout()
  const reducedMotion = useReducedMotion()
  const progressRef = useRef(0)
  const flightRef = useRef<FlightRequest | null>(null)
  const flyingRef = useRef(false)
  const brandRef = useRef<HTMLAnchorElement>(null)
  const dockRef = useRef<HTMLSpanElement>(null)
  const flight = mode === 'flight'

  const { scrollTo, glideTo, settleAt } = useFlightScroll(
    progressRef,
    flight,
    activeId !== null,
    reducedMotion,
  )
  const act = useFlightAct(progressRef, acts, flightLength, flight)

  const returnRef = useRef<number | null>(null)
  const handleSelect = useCallback((id: string) => {
    returnRef.current = null
    setActiveId(id)
  }, [])
  const handleCloseProject = useCallback(() => setActiveId(null), [])

  const flyTo = useCallback(
    (progress: number, onArrive?: () => void) => {
      if (flyingRef.current) return
      flyingRef.current = true
      const seconds = reducedMotion ? 0 : FLIGHT_SECONDS
      glideTo(progress, seconds)
      flightRef.current = {
        progress,
        seconds,
        onArrive: () => {
          settleAt(progress)
          flyingRef.current = false
          onArrive?.()
        },
      }
    },
    [glideTo, settleAt, reducedMotion],
  )

  const handleOpenContact = useCallback(() => {
    setActiveId(null)
    if (!flight) {
      document
        .getElementById('contact')
        ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
      return
    }
    flyTo(contactStop)
  }, [flight, flyTo, reducedMotion])

  const handleSelectProject = useCallback(
    (id: string) => {
      const index = branches.findIndex((project) => project.id === id)
      if (!flight || index < 0) {
        setActiveId(id)
        return
      }
      const { stop, still } = acts[index + FIRST_BRANCH_ACT]
      const scroll = progressRef.current * flightLength
      if (scroll >= still[0] && scroll <= still[1]) {
        if (activeId === null) returnRef.current = null
        setActiveId(id)
        return
      }
      if (activeId === null) returnRef.current = progressRef.current
      setActiveId(null)
      flyTo(stop / flightLength, () => setActiveId(id))
    },
    [activeId, flight, flyTo],
  )
  const handleSceneError = useCallback(() => setSceneFailed(true), [])
  const handleHome = useCallback(() => {
    setActiveId(null)
    if (progressRef.current < LANDING_EPSILON) return
    flyTo(0)
  }, [flyTo])

  const handleBack = useCallback(() => {
    setActiveId(null)
    const origin = returnRef.current
    returnRef.current = null
    if (flight && origin !== null) flyTo(origin)
  }, [flight, flyTo])
  const handleMeet = useCallback(() => scrollTo(meetStop, meetStill), [scrollTo])

  const navHidden = activeId !== null
  const nav = useMemo<FlightNavConfig>(
    () => ({ acts, length: flightLength, hidden: navHidden, onJump: scrollTo, onTop: handleHome }),
    [navHidden, scrollTo, handleHome],
  )

  const activeProject = projects.find((project) => project.id === activeId) ?? null

  return (
    <>
      {mode === 'fallback' ? (
        <CssNetwork />
      ) : (
        <ErrorBoundary fallback={<CssNetwork />} onError={handleSceneError}>
          <Suspense fallback={<CssNetwork />}>
            <Scene
              reducedMotion={reducedMotion}
              isMobile={isMobile || fold !== null}
              fold={fold}
              branches={branches}
              progressRef={progressRef}
              flightRef={flightRef}
              activeId={activeId}
              nav={nav}
              onSelect={handleSelect}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <Header
        profile={profile}
        projects={projects}
        activeId={activeId}
        flight={flight}
        brandRef={brandRef}
        dockRef={dockRef}
        onHome={handleHome}
        onSelectProject={handleSelectProject}
        onOpenContact={handleOpenContact}
      />

      {flight && <ProgressRail acts={acts} active={act} length={flightLength} onJump={scrollTo} />}

      <main className={styles.main}>
        <Hero
          profile={profile}
          full={flight}
          brandRef={brandRef}
          dockRef={dockRef}
          nav={nav}
          brandExit={brandExit}
          onMeet={handleMeet}
        />
        {flight ? (
          <div className={styles.track} style={{ height: trackHeight }} aria-hidden="true" />
        ) : (
          <>
            <ProjectsSection projects={projects} onSelect={handleSelect} />
            <Contact profile={profile} />
          </>
        )}
      </main>

      {activeProject && (
        <ProjectPanel project={activeProject} onClose={handleCloseProject} onBack={handleBack} />
      )}
    </>
  )
}

export default HomePage
