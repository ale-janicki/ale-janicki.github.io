import type { RefObject } from 'react'
import { Html } from '@react-three/drei'
import type { Vector3 } from 'three'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface LinkLabelProps {
  position: Vector3
  index: number
  frameRef: RefObject<Frame>
  children: string
}

export function LinkLabel({ position, index, frameRef, children }: LinkLabelProps) {
  const ref = useFadeRef<HTMLParagraphElement>(frameRef, (frame) =>
    Math.max(frame.captions[1], frame.linkGlow[index]),
  )
  return (
    <Html position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <p ref={ref} className={`mono ${styles.label}`}>
        {children}
      </p>
    </Html>
  )
}
