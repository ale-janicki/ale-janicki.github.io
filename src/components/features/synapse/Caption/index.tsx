import type { RefObject } from 'react'
import { LocalizedHtml } from '@/components/features/synapse/LocalizedHtml'
import { FlightNav, type FlightNavConfig } from '@/components/layout/FlightNav'
import { useFadeRef } from '@/hooks/useFadeRef'
import { screenCenter } from '@/lib/synapse/html'
import type { Fold } from '@/lib/synapse/region'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface CaptionProps {
  position: [number, number, number]
  frameRef: RefObject<Frame>
  fold: Fold | null
  nav: FlightNavConfig
  navIndex: number
  children: string
}

export function Caption({ position, frameRef, fold, nav, navIndex, children }: CaptionProps) {
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.caption)
  return (
    <LocalizedHtml
      position={position}
      fullscreen={fold !== null}
      calculatePosition={fold ? screenCenter : undefined}
      zIndexRange={[10, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div ref={ref} className={styles.caption}>
        <p>{children}</p>
        <FlightNav nav={nav} index={navIndex} className={styles.pair} />
      </div>
    </LocalizedHtml>
  )
}
