import { useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { BranchCard } from '@/components/features/synapse/BranchCard'
import { CameraRig } from '@/components/features/synapse/CameraRig'
import { Caption } from '@/components/features/synapse/Caption'
import { DomainLabel } from '@/components/features/synapse/DomainLabel'
import { LinkLabel } from '@/components/features/synapse/LinkLabel'
import { Milestone } from '@/components/features/synapse/Milestone'
import { Network } from '@/components/features/synapse/Network'
import { Satellites } from '@/components/features/synapse/Satellites'
import { domains } from '@/content/domains'
import { experience } from '@/content/experience'
import { buildNetwork } from '@/lib/synapse/buildNetwork'
import { domainRegion } from '@/lib/synapse/brain'
import { MAX_DOMAINS, MAX_MILESTONES } from '@/lib/synapse/length'
import { CAMERA_FOV, createFrame, createTimeline } from '@/lib/synapse/timeline'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface SceneProps {
  animated: boolean
  isMobile: boolean
  branches: Project[]
  klaus: Project
  progressRef: RefObject<number>
  activeId: string | null
  onSelect: (id: string) => void
}

function focusIndexOf(activeId: string | null, branches: Project[], klaus: Project): number | null {
  if (activeId === null) return null
  if (activeId === klaus.id) return -1
  const index = branches.findIndex((branch) => branch.id === activeId)
  return index >= 0 ? index : null
}

export default function Scene({
  animated,
  isMobile,
  branches,
  klaus,
  progressRef,
  activeId,
  onSelect,
}: SceneProps) {
  const network = useMemo(
    () =>
      buildNetwork(branches, isMobile, Math.min(experience.length, isMobile ? 3 : MAX_MILESTONES)),
    [branches, isMobile],
  )
  const domainAnchors = useMemo(
    () => domains.slice(0, MAX_DOMAINS).map((_, index) => domainRegion(index)),
    [],
  )
  const timeline = useMemo(() => createTimeline(network), [network])
  const frameRef = useRef(createFrame())
  const [ready, setReady] = useState(false)
  const focus = animated ? focusIndexOf(activeId, branches, klaus) : null

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
          focus={focus}
          animated={animated}
        />
        <Network
          network={network}
          frameRef={frameRef}
          klausColor={klaus.branch.color}
          isMobile={isMobile}
        />
        {animated && ready && (
          <>
            <Satellites
              frameRef={frameRef}
              labels={klaus.stack}
              klausColor={klaus.branch.color}
              isMobile={isMobile}
            />
            {network.branches.map((branch, index) => (
              <BranchCard
                key={branch.project.id}
                branch={branch}
                index={index}
                frameRef={frameRef}
                hidden={activeId !== null}
                onSelect={onSelect}
              />
            ))}
            {network.milestones.map((anchor, index) => (
              <Milestone
                key={experience[index].id}
                position={anchor}
                entry={experience[index]}
                index={index}
                frameRef={frameRef}
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
            {network.links.map((link, index) =>
              link.shared.length > 0 ? (
                <LinkLabel
                  key={`${link.from}-${link.to}`}
                  position={link.midpoint}
                  index={index}
                  frameRef={frameRef}
                >
                  {`${branches[link.from].name} ↔ ${branches[link.to].name} · ${link.shared.join(', ')}`}
                </LinkLabel>
              ) : null,
            )}
            <Caption position={[0, -network.extent.y * 1.02, 0]} index={0} frameRef={frameRef}>
              Everything I build connects.
            </Caption>
            <Caption position={[0, -network.extent.y * 1.02, 0]} index={1} frameRef={frameRef}>
              An ecosystem, not a portfolio.
            </Caption>
          </>
        )}
      </Canvas>
    </div>
  )
}
