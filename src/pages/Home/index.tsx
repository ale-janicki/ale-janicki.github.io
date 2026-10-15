import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { ProjectPanel } from '@/components/features/ProjectPanel'
import { CssNetwork } from '@/components/layout/CssNetwork'
import { Header } from '@/components/layout/Header'
import { ProgressRail } from '@/components/layout/ProgressRail'
import { Modal } from '@/components/ui/Modal'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { useFlightAct } from '@/hooks/useFlightAct'
import { useFlightScroll } from '@/hooks/useFlightScroll'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useRenderMode } from '@/hooks/useRenderMode'
import { MAX_BRANCHES, flightActs, timelineLength } from '@/lib/synapse/length'
import { Contact } from './components/Contact'
import { ContactList } from './components/ContactList'
import { Hero } from './components/Hero'
import { ProjectList } from './components/ProjectList'
import { ProjectsSection } from './components/ProjectsSection'
import styles from './styles.module.css'

const Scene = lazy(() => import('@/components/features/synapse/Scene'))

const klaus = projects.find((project) => project.branch.visual === 'core')
const branches = projects
  .filter((project) => project.branch.visual !== 'core')
  .slice(0, MAX_BRANCHES)
const flightLength = timelineLength(branches.length)
const acts = flightActs(branches.length)
const trackHeight = `calc(${flightLength - 1} * 100svh)`

export function HomePage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const mode = useRenderMode(sceneFailed || !klaus)
  const isMobile = useIsMobile()
  const progressRef = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const flight = mode === 'flight'

  const scrollTo = useFlightScroll(
    progressRef,
    trackRef,
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

  const activeProject = projects.find((project) => project.id === activeId) ?? null

  return (
    <>
      {mode === 'fallback' || !klaus ? (
        <CssNetwork />
      ) : (
        <ErrorBoundary fallback={<CssNetwork />} onError={handleSceneError}>
          <Suspense fallback={<CssNetwork />}>
            <Scene
              animated={flight}
              isMobile={isMobile}
              branches={branches}
              klaus={klaus}
              progressRef={progressRef}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <Header
        name={profile.name}
        onOpenProjects={handleOpenProjects}
        onOpenContact={handleOpenContact}
        projectsDisabled={activeId !== null}
      />

      {flight && (
        <ProgressRail acts={acts} active={act} length={flightLength} onJump={scrollTo} />
      )}

      <main className={styles.main}>
        <Hero profile={profile} full={flight} />
        {flight ? (
          <div
            ref={trackRef}
            className={styles.track}
            style={{ height: trackHeight }}
            aria-hidden="true"
          />
        ) : (
          <ProjectsSection projects={projects} onSelect={handleSelect} />
        )}
        {flight ? (
          <>
            <div className={styles.spacer} aria-hidden="true" />
            <div className={styles.finale} data-shown={act === acts.length - 1}>
              <Contact profile={profile} full klaus={klaus} floating onOpenKlaus={handleSelect} />
            </div>
          </>
        ) : (
          <Contact profile={profile} full={false} onOpenKlaus={handleSelect} />
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
