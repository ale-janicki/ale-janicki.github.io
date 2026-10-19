import { useEffect, useRef, type FocusEvent, type KeyboardEvent, type RefObject } from 'react'
import { Arrow } from '@/components/layout/FlightNav'
import { Button } from '@/components/ui/Button'
import { LocalizedHtml } from '@/components/features/synapse/LocalizedHtml'
import type { Vector3 } from 'three'
import { useFadeRef } from '@/hooks/useFadeRef'
import { useLocale } from '@/i18n/useLocale'
import type { Milestone as MilestoneEntry } from '@/content/experience'
import type { Frame } from '@/lib/synapse/timeline'
import styles from './styles.module.css'

interface MilestoneProps {
  position: Vector3
  entry: MilestoneEntry
  index: number
  dimmed: boolean
  focused: boolean
  locked: boolean
  frameRef: RefObject<Frame>
  onActivate: (index: number | null) => void
  onOpen: (id: string) => void
  onClose: () => void
}

export function Milestone({
  position,
  entry,
  index,
  dimmed,
  focused,
  locked,
  frameRef,
  onActivate,
  onOpen,
  onClose,
}: MilestoneProps) {
  const { messages } = useLocale()
  const ref = useFadeRef<HTMLDivElement>(frameRef, (frame) => frame.tips)
  const activate = () => onActivate(index)
  const release = () => onActivate(null)
  const activateVisible = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.matches(':focus-visible')) activate()
  }
  const open = () => {
    if (!focused) onOpen(entry.id)
  }
  const headerRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const wasFocused = useRef(false)

  useEffect(() => {
    if (focused) {
      backRef.current?.focus({ preventScroll: true })
    } else if (wasFocused.current) {
      headerRef.current?.focus({ preventScroll: true })
    }
    wasFocused.current = focused
  }, [focused])

  useEffect(() => {
    if (!focused) return
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [focused, onClose])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    open()
  }

  return (
    <LocalizedHtml position={position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={styles.milestone} inert={locked} data-focused={focused}>
        <div className={styles.body} data-dimmed={dimmed}>
          <div
            ref={headerRef}
            className={styles.header}
            tabIndex={locked || focused ? -1 : 0}
            role="button"
            aria-expanded={focused}
            aria-label={`${entry.org}, ${entry.role}, ${entry.period}. ${entry.line}`}
            onPointerEnter={activate}
            onPointerLeave={release}
            onFocus={activateVisible}
            onBlur={release}
            onClick={open}
            onKeyDown={handleKeyDown}
          >
            <p className={`mono ${styles.period}`}>{entry.period}</p>
            <p className={styles.org}>{entry.org}</p>
            <p className={styles.role}>{entry.role}</p>
            <p className={`mono ${styles.cue}`} aria-hidden="true">
              {messages.milestone.more} →
            </p>
          </div>
          <div className={styles.expanded} role="group" aria-label={entry.org} inert={!focused}>
            <div className={styles.scroll} data-lenis-prevent>
              <p className={styles.fullLine}>{entry.line}</p>
              {entry.details.length > 0 && (
                <ul className={styles.fullDetails}>
                  {entry.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
              <div className={styles.actions}>
                <Button ref={backRef} variant="secondary" size="lg" onClick={onClose}>
                  <Arrow back />
                  {messages.milestone.back}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizedHtml>
  )
}
