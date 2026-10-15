import { useEffect, useState, type CSSProperties, type RefObject } from 'react'
import { Html } from '@react-three/drei'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { BranchGeometry } from '@/lib/synapse/buildNetwork'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface BranchCardProps {
  branch: BranchGeometry
  index: number
  frameRef: RefObject<Frame>
  hidden: boolean
  onSelect: (id: string) => void
}

function demoText(hint: string): string {
  const text = hint.replace(/^Demo:\s*/, '')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function BranchCard({ branch, index, frameRef, hidden, onSelect }: BranchCardProps) {
  const { project, node } = branch
  const [hovered, setHovered] = useState(false)
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => (hidden ? 0 : frame.cards[index]))

  const pointing = hovered && !hidden

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
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => {
          setHovered(false)
        }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(project.id)
        }}
      >
        <sphereGeometry args={[pointing ? 0.42 : 0.35, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          ref={ref}
          className={styles.card}
          style={{ '--branch': project.branch.color } as CSSProperties}
        >
          <div className={styles.top}>
            <p className={`mono ${styles.eyebrow}`}>{`branch 0${index + 1}`}</p>
            {project.highlight && <p className={`mono ${styles.highlight}`}>{project.highlight}</p>}
          </div>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.tagline}>{project.tagline}</p>
          <p className={styles.description}>{project.description}</p>
          <dl className={styles.facts}>
            {project.built && (
              <div className={styles.fact}>
                <dt className="mono">Built</dt>
                <dd>{project.built}</dd>
              </div>
            )}
            {project.demoHint && (
              <div className={styles.fact}>
                <dt className="mono">Demo</dt>
                <dd>{demoText(project.demoHint)}</dd>
              </div>
            )}
          </dl>
          <ul className={styles.stack} aria-label={`${project.name} stack`}>
            {project.stack.map((tech) => (
              <li key={tech}>
                <Chip>{tech}</Chip>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            size="sm"
            className={styles.open}
            onClick={() => onSelect(project.id)}
          >
            Open {project.name}
          </Button>
        </div>
      </Html>
    </group>
  )
}
