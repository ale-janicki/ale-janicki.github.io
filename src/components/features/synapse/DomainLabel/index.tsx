import type { RefObject } from 'react'
import { Html } from '@react-three/drei'
import type { Vector3 } from 'three'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface DomainLabelProps {
  position: Vector3
  name: string
  items: string[]
  frameRef: RefObject<Frame>
}

export function DomainLabel({ position, name, items, frameRef }: DomainLabelProps) {
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.domains)
  return (
    <Html position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={styles.domain}>
        <p className={`mono ${styles.name}`}>{name}</p>
        <ul className={styles.items} aria-label={`${name} stack`}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Html>
  )
}
