import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { Button } from '@/components/ui/Button'
import { useLocale } from '@/i18n/useLocale'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface ProjectsMenuProps {
  projects: Project[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function ProjectsMenu({ projects, activeId, onSelect }: ProjectsMenuProps) {
  const { messages } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }, [])

  const focusItem = useCallback(
    (index: number) => {
      const count = projects.length
      itemRefs.current[(index + count) % count]?.focus()
    },
    [projects.length],
  )

  useEffect(() => {
    if (!open) return
    const current = projects.findIndex((project) => project.id === activeId)
    itemRefs.current[Math.max(current, 0)]?.focus()
    const handlePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open, projects, activeId])

  const handleButtonKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
    }
  }

  const handleMenuKey = (event: KeyboardEvent) => {
    const index = itemRefs.current.findIndex((item) => item === document.activeElement)
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusItem(index + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusItem(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusItem(0)
        break
      case 'End':
        event.preventDefault()
        focusItem(projects.length - 1)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close(true)
        break
      case 'Tab':
        event.preventDefault()
        close(true)
        break
    }
  }

  const handleSelect = (id: string) => {
    close(true)
    onSelect(id)
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <Button
        ref={buttonRef}
        variant="secondary"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleButtonKey}
      >
        {messages.header.projects}
      </Button>
      {open && (
        <ul
          id={menuId}
          className={styles.menu}
          role="menu"
          aria-label={messages.header.projects}
          onKeyDown={handleMenuKey}
        >
          {projects.map((project, index) => (
            <li key={project.id} role="none">
              <Button
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                variant="ghost"
                role="menuitem"
                tabIndex={-1}
                className={styles.item}
                aria-current={project.id === activeId ? 'true' : undefined}
                style={{ '--branch': project.branch.color } as CSSProperties}
                onClick={() => handleSelect(project.id)}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.text}>
                  <span className={styles.name}>{project.name}</span>
                  <span className={styles.tagline}>{project.tagline}</span>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
