import type { CSSProperties, RefObject } from 'react'
import { LocalizedHtml } from '@/components/features/synapse/LocalizedHtml'
import type { Vector3 } from 'three'
import { useFadeRef } from '@/hooks/useFadeRef'
import { MAX_TECHS } from '@/lib/synapse/length'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface TechLabelProps {
  position: Vector3
  side: 1 | -1
  branch: number
  slot: number
  color: string
  frameRef: RefObject<Frame>
  children: string
}

export function TechLabel({
  position,
  side,
  branch,
  slot,
  color,
  frameRef,
  children,
}: TechLabelProps) {
  const ref = useFadeRef<HTMLParagraphElement>(
    frameRef,
    (frame) => frame.techs[branch * MAX_TECHS + slot],
  )
  return (
    <LocalizedHtml position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <p
        ref={ref}
        className={`mono ${styles.label}`}
        data-side={side > 0 ? 'right' : 'left'}
        style={{ '--branch': color } as CSSProperties}
      >
        {children}
      </p>
    </LocalizedHtml>
  )
}
