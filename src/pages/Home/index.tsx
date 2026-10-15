import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { ProjectPanel } from '@/components/features/ProjectPanel'
import { CssNetwork } from '@/components/layout/CssNetwork'
import type { FlightNavConfig } from '@/components/layout/FlightNav'
import { Header } from '@/components/layout/Header'
import { ProgressRail } from '@/components/layout/ProgressRail'
import { Modal } from '@/components/ui/Modal'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { useFlightAct } from '@/hooks/useFlightAct'
import { useFlightScroll } from '@/hooks/useFlightScroll'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useRenderMode } from '@/hooks/useRenderMode'
import { MAX_BRANCHES, PRELUDE, flightActs, timelineLength } from '@/lib/synapse/length'
import { Contact } from './components/Contact'
import { ContactList } from './components/ContactList'
import { Hero } from './components/Hero'
import { ProjectList } from './components/ProjectList'
import { ProjectsSection } from './components/ProjectsSection'
import styles from './styles.module.css'

const Scene = lazy(() => import('@/components/features/synapse/Scene'))

const branches = projects.slice(0, MAX_BRANCHES)
const flightLength = timelineLength(branches.length)
const acts = flightActs(branches.map((project) => project.name))
const meetStop = acts[1].stop / flightLength
const meetStill: [number, number] = [
  acts[0].still[0] / flightLength,
  acts[0].still[1] / flightLength,
]
const trackHeight = `calc(${flightLength - PRELUDE + 1} * 100svh)`

export function HomePage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const mode = useRenderMode(sceneFailed)
  const isMobile = useIsMobile()
  const progressRef = useRef(0)
  const brandRef = useRef<HTMLAnchorElement>(null)
  const dockRef = useRef<HTMLSpanElement>(null)
  const flight = mode === 'flight'

  const scrollTo = useFlightScroll(
    progressRef,
    flight,
    activeId !== null || projectsOpen || contactOpen,
  )
  const act = useFlightAct(progressRef, acts, flightLength, flight)

  const handleSelect = useCallback((id: string) => {
    setProjectsOpen(false)
    setContactOpen(false)
    setActiveId(id)
  }, [])
  const handleCloseProject = useCallback(() => setActiveId(null), [])
  const handleCloseProjects = useCallback(() => setProjectsOpen(false), [])
  const handleOpenProjects = useCallback(() => setProjectsOpen(true), [])
  const handleCloseContact = useCallback(() => setContactOpen(false), [])
  const handleOpenContact = useCallback(() => setContactOpen(true), [])
  const handleSceneError = useCallback(() => setSceneFailed(true), [])
  const handleMeet = useCallback(() => scrollTo(meetStop, meetStill), [scrollTo])
  const handleHome = useCallback(() => scrollTo(0), [scrollTo])

  const navHidden = activeId !== null || projectsOpen || contactOpen
  const nav = useMemo<FlightNavConfig>(
    () => ({ acts, length: flightLength, hidden: navHidden, onJump: scrollTo }),
    [navHidden, scrollTo],
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
              animated={flight}
              isMobile={isMobile}
              branches={branches}
              progressRef={progressRef}
              activeId={activeId}
              nav={nav}
              onSelect={handleSelect}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <Header
        profile={profile}
        flight={flight}
        brandRef={brandRef}
        dockRef={dockRef}
        onHome={handleHome}
        onOpenProjects={handleOpenProjects}
        onOpenContact={handleOpenContact}
        projectsDisabled={activeId !== null}
      />

      {flight && <ProgressRail acts={acts} active={act} length={flightLength} onJump={scrollTo} />}

      <main className={styles.main}>
        <Hero
          profile={profile}
          full={flight}
          brandRef={brandRef}
          dockRef={dockRef}
          nav={nav}
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

      {activeProject && <ProjectPanel project={activeProject} onClose={handleCloseProject} />}

      <Modal isOpen={contactOpen} onClose={handleCloseContact} title="Contact">
        <ContactList contacts={profile.contacts} />
      </Modal>

      <Modal isOpen={projectsOpen} onClose={handleCloseProjects} title="Projects">
        <ProjectList projects={projects} onSelect={handleSelect} />
      </Modal>
    </>
  )
}

export default HomePage
