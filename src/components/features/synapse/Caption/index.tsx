import type { RefObject } from 'react'
import { Html } from '@react-three/drei'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface CaptionProps {
  position: [number, number, number]
  index: number
  frameRef: RefObject<Frame>
  children: string
}

export function Caption({ position, index, frameRef, children }: CaptionProps) {
  const ref = useFadeRef<HTMLParagraphElement>(frameRef, (frame) => frame.captions[index])
  return (
    <Html position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <p ref={ref} className={styles.caption}>
        {children}
      </p>
    </Html>
  )
}
