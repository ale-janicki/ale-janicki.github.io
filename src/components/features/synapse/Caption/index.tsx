import type { RefObject } from 'react'
import { Html } from '@react-three/drei'
import { FlightNav, type FlightNavConfig } from '@/components/layout/FlightNav'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface CaptionProps {
  position: [number, number, number]
  frameRef: RefObject<Frame>
  nav: FlightNavConfig
  navIndex: number
  children: string
}

export function Caption({ position, frameRef, nav, navIndex, children }: CaptionProps) {
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.caption)
  return (
    <Html position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={styles.caption}>
        <p>{children}</p>
        <FlightNav nav={nav} index={navIndex} className={styles.pair} />
      </div>
    </Html>
  )
}
