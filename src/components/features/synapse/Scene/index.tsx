import { useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { BranchCard } from '@/components/features/synapse/BranchCard'
import { CameraRig } from '@/components/features/synapse/CameraRig'
import { Caption } from '@/components/features/synapse/Caption'
import { ContactPanel } from '@/components/features/synapse/ContactPanel'
import { DomainLabel } from '@/components/features/synapse/DomainLabel'
import { Milestone } from '@/components/features/synapse/Milestone'
import { Network } from '@/components/features/synapse/Network'
import { Satellites } from '@/components/features/synapse/Satellites'
import { TechLabel } from '@/components/features/synapse/TechLabel'
import type { FlightNavConfig } from '@/components/layout/FlightNav'
import { domains } from '@/content/domains'
import { experience } from '@/content/experience'
import { buildNetwork } from '@/lib/synapse/buildNetwork'
import { domainRegion } from '@/lib/synapse/brain'
import type { FlightRequest } from '@/lib/synapse/flight'
import { BRAIN_ACT, FIRST_BRANCH_ACT, MAX_DOMAINS, MAX_MILESTONES } from '@/lib/synapse/length'
import { CAMERA_FOV, createFrame, createTimeline } from '@/lib/synapse/timeline'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface SceneProps {
  animated: boolean
  isMobile: boolean
  branches: Project[]
  progressRef: RefObject<number>
  flightRef: RefObject<FlightRequest | null>
  activeId: string | null
  nav: FlightNavConfig
  onSelect: (id: string) => void
}

function focusIndexOf(activeId: string | null, branches: Project[]): number | null {
  if (activeId === null) return null
  const index = branches.findIndex((branch) => branch.id === activeId)
  return index >= 0 ? index : null
}

export default function Scene({
  animated,
  isMobile,
  branches,
  progressRef,
  flightRef,
  activeId,
  nav,
  onSelect,
}: SceneProps) {
  const network = useMemo(
    () => buildNetwork(branches, isMobile, Math.min(experience.length, MAX_MILESTONES)),
    [branches, isMobile],
  )
  const domainAnchors = useMemo(
    () => domains.slice(0, MAX_DOMAINS).map((_, index) => domainRegion(index)),
    [],
  )
  const timeline = useMemo(() => createTimeline(network), [network])
  const frameRef = useRef(createFrame())
  const [ready, setReady] = useState(false)
  const [activeTip, setActiveTip] = useState<number | null>(null)
  const [pinnedTip, setPinnedTip] = useState<number | null>(null)
  const focusedTip = pinnedTip ?? activeTip
  const focus = animated ? focusIndexOf(activeId, branches) : null
  const core = network.branches.findIndex((branch) => branch.project.branch.visual === 'core')

  return (
    <div className={styles.scene}>
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 1.75]}
        frameloop={animated ? 'always' : 'demand'}
        camera={{ fov: CAMERA_FOV, near: 0.1, far: 300, position: [0, 0, 8] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={() => setReady(true)}
      >
        <color attach="background" args={['#05060d']} />
        <CameraRig
          timeline={timeline}
          frameRef={frameRef}
          progressRef={progressRef}
          flightRef={flightRef}
          focus={focus}
          animated={animated}
        />
        <Network network={network} frameRef={frameRef} isMobile={isMobile} />
        {animated && ready && (
          <>
            {core >= 0 && (
              <Satellites
                frameRef={frameRef}
                center={network.branches[core].node}
                index={core}
                color={network.branches[core].project.branch.color}
                isMobile={isMobile}
              />
            )}
            {network.branches.map((branch, index) => (
              <BranchCard
                key={branch.project.id}
                branch={branch}
                index={index}
                frameRef={frameRef}
                hidden={activeId !== null}
                nav={nav}
                navIndex={index + FIRST_BRANCH_ACT}
                onSelect={onSelect}
              />
            ))}
            {network.milestones.map((anchor, index) => (
              <Milestone
                key={experience[index].id}
                position={anchor}
                entry={experience[index]}
                index={index}
                dimmed={focusedTip !== null && focusedTip !== index}
                pinned={pinnedTip === index}
                isMobile={isMobile}
                frameRef={frameRef}
                onActivate={setActiveTip}
                onPin={setPinnedTip}
              />
            ))}
            {domainAnchors.map((anchor, index) => (
              <DomainLabel
                key={domains[index].id}
                position={anchor}
                name={domains[index].name}
                items={domains[index].items}
                frameRef={frameRef}
              />
            ))}
            {network.branches.map((branch, index) =>
              branch.techs.map((tech, slot) => (
                <TechLabel
                  key={`${branch.project.id}-${tech.label}`}
                  position={tech.position}
                  side={tech.side}
                  branch={index}
                  slot={slot}
                  color={branch.project.branch.color}
                  frameRef={frameRef}
                >
                  {tech.label}
                </TechLabel>
              )),
            )}
            <Caption
              position={[0, -network.extent.y * 1.02, 0]}
              frameRef={frameRef}
              nav={nav}
              navIndex={BRAIN_ACT}
            >
              Everything I build connects.
            </Caption>
            <ContactPanel frameRef={frameRef} nav={nav} navIndex={nav.acts.length - 1} />
          </>
        )}
      </Canvas>
    </div>
  )
}
