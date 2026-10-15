import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Html } from '@react-three/drei'
import type { Vector3 } from 'three'
import { Button } from '@/components/ui/Button'
import { useFadeRef } from '@/hooks/useFadeRef'
import type { Milestone as MilestoneEntry } from '@/content/experience'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface MilestoneProps {
  position: Vector3
  entry: MilestoneEntry
  index: number
  dimmed: boolean
  pinned: boolean
  isMobile: boolean
  frameRef: RefObject<Frame>
  onActivate: (index: number | null) => void
  onPin: (index: number | null) => void
}

export function Milestone({
  position,
  entry,
  index,
  dimmed,
  pinned,
  isMobile,
  frameRef,
  onActivate,
  onPin,
}: MilestoneProps) {
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.tips)
  const sheetRef = useRef<HTMLDivElement>(null)
  const sheetOpen = isMobile && pinned
  const activate = () => onActivate(index)
  const release = () => onActivate(null)
  const toggle = () => onPin(pinned ? null : index)

  useEffect(() => {
    if (!sheetOpen) return
    const close = () => onPin(null)
    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (sheetRef.current?.contains(target) || ref.current?.contains(target)) return
      close()
    }
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      close()
      ref.current?.focus()
    }
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', close, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', close)
    }
  }, [sheetOpen, onPin, ref])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isMobile || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    toggle()
  }

  return (
    <Html position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div
        ref={ref}
        className={styles.milestone}
        tabIndex={0}
        role={isMobile ? 'button' : 'group'}
        aria-expanded={isMobile ? pinned : undefined}
        aria-label={`${entry.org}, ${entry.role}, ${entry.period}. ${entry.line}`}
        onPointerEnter={activate}
        onPointerLeave={release}
        onFocus={activate}
        onBlur={release}
        onClick={isMobile ? toggle : undefined}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.body} data-dimmed={dimmed}>
          <p className={`mono ${styles.period}`}>{entry.period}</p>
          <p className={styles.org}>{entry.org}</p>
          <p className={styles.role}>{entry.role}</p>
          <div className={styles.more}>
            <p className={styles.line}>{entry.line}</p>
            {entry.details.length > 0 && (
              <ul className={styles.details}>
                {entry.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {sheetOpen &&
        createPortal(
          <div
            ref={sheetRef}
            className={styles.sheet}
            role="dialog"
            aria-label={`${entry.org}, ${entry.role}`}
          >
            <p className={`mono ${styles.period}`}>{entry.period}</p>
            <p className={styles.org}>{entry.org}</p>
            <p className={styles.sheetRole}>{entry.role}</p>
            <p className={styles.line}>{entry.line}</p>
            {entry.details.length > 0 && (
              <ul className={styles.details}>
                {entry.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
            <Button variant="ghost" size="sm" className={styles.close} onClick={() => onPin(null)}>
              Close
            </Button>
          </div>,
          document.body,
        )}
    </Html>
  )
}
