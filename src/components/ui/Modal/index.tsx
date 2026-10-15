import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { trapTab } from '@/lib/trapTab'
import styles from './styles.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog?.focus()

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (dialog) trapTab(event, dialog)
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previous?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div
        ref={dialogRef}
        className={styles.dialog}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            Close
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
