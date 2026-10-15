import type { RefObject } from 'react'
import { Html } from '@react-three/drei'
import type { Vector3 } from 'three'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { Milestone as MilestoneEntry } from '@/content/experience'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface MilestoneProps {
  position: Vector3
  entry: MilestoneEntry
  index: number
  frameRef: RefObject<Frame>
}

export function Milestone({ position, entry, index, frameRef }: MilestoneProps) {
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.milestones[index])
  return (
    <Html position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={styles.milestone}>
        <p className={`mono ${styles.period}`}>{entry.period}</p>
        <p className={styles.title}>
          {entry.org}
          <span className={styles.role}>{entry.role}</span>
        </p>
        <p className={styles.line}>{entry.line}</p>
      </div>
    </Html>
  )
}
