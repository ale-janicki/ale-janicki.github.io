import { useEffect, useState, type CSSProperties, type RefObject } from 'react'
import { LocalizedHtml } from '@/components/features/synapse/LocalizedHtml'
import { FlightNav, type FlightNavConfig } from '@/components/layout/FlightNav'
import { Button } from '@/components/ui/Button'
import { useFadeRef } from '@/hooks/useFadeRef'
import { useLocale } from '@/i18n/useLocale'
import type { BranchGeometry } from '@/lib/synapse/buildNetwork'
import { screenCenter } from '@/lib/synapse/html'
import type { Fold } from '@/lib/synapse/region'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface BranchCardProps {
  branch: BranchGeometry
  index: number
  frameRef: RefObject<Frame>
  fold: Fold | null
  hidden: boolean
  nav: FlightNavConfig
  navIndex: number
  onSelect: (id: string) => void
}

function demoText(hint: string): string {
  const text = hint.replace(/^Demo:\s*/, '')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function BranchCard({
  branch,
  index,
  frameRef,
  fold,
  hidden,
  nav,
  navIndex,
  onSelect,
}: BranchCardProps) {
  const { project, node } = branch
  const { messages } = useLocale()
  const [hovered, setHovered] = useState(false)
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => (hidden ? 0 : frame.cards[index]))

  const pointing = hovered && !hidden
  const clickable = () => !hidden && frameRef.current.tips < 0.02

  useEffect(() => {
    if (!pointing) return
    document.body.style.cursor = 'pointer'
    return () => {
      document.body.style.cursor = ''
    }
  }, [pointing])

  return (
    <group position={node}>
      <mesh
        onPointerOver={(event) => {
          if (!clickable()) return
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => {
          setHovered(false)
        }}
        onClick={(event) => {
          if (!clickable()) return
          event.stopPropagation()
          onSelect(project.id)
        }}
      >
        <sphereGeometry args={[pointing ? 0.42 : 0.35, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <LocalizedHtml
        fullscreen={fold !== null}
        calculatePosition={fold ? screenCenter : undefined}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          ref={ref}
          className={styles.wrap}
          style={{ '--branch': project.branch.color } as CSSProperties}
        >
          <div className={styles.card}>
            <div className={styles.top}>
              <p className={`mono ${styles.eyebrow}`}>{messages.branchCard.branch(index + 1)}</p>
              {project.highlight && (
                <p className={`mono ${styles.highlight}`}>{project.highlight}</p>
              )}
            </div>
            <h3 className={styles.name}>{project.name}</h3>
            <p className={styles.tagline}>{project.tagline}</p>
            <p className={styles.description}>{project.description}</p>
            <dl className={styles.facts}>
              {project.built && (
                <div className={styles.fact}>
                  <dt className="mono">{messages.branchCard.built}</dt>
                  <dd>{project.built}</dd>
                </div>
              )}
              {project.demoHint && (
                <div className={styles.fact}>
                  <dt className="mono">{messages.branchCard.demo}</dt>
                  <dd>{demoText(project.demoHint)}</dd>
                </div>
              )}
            </dl>
            <Button
              variant="secondary"
              size="sm"
              className={styles.open}
              onClick={() => onSelect(project.id)}
            >
              {messages.branchCard.open(project.name)}
            </Button>
          </div>
          <FlightNav nav={nav} index={navIndex} className={styles.pair} />
        </div>
      </LocalizedHtml>
    </group>
  )
}
