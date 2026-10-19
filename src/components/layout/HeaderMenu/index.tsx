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
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/locale'
import { useLocale } from '@/i18n/useLocale'
import type { Project } from '@/types/project'
import styles from './styles.module.css'

interface HeaderMenuProps {
  projects: Project[]
  activeId: string | null
  onSelectProject: (id: string) => void
}

export function HeaderMenu({ projects, activeId, onSelectProject }: HeaderMenuProps) {
  const { locale, setLocale, messages } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const languageStart = projects.length
  const count = languageStart + LOCALES.length

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }, [])

  const focusItem = useCallback(
    (index: number) => {
      itemRefs.current[(index + count) % count]?.focus()
    },
    [count],
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
        focusItem(count - 1)
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

  const handleProject = (id: string) => {
    close(true)
    onSelectProject(id)
  }

  const handleLocale = (option: Locale) => {
    close(true)
    setLocale(option)
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <Button
        ref={buttonRef}
        variant="secondary"
        size="sm"
        className={styles.trigger}
        aria-label={messages.header.menu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleButtonKey}
      >
        <span className={styles.bars} aria-hidden="true" />
      </Button>
      {open && (
        <ul
          id={menuId}
          className={styles.menu}
          role="menu"
          aria-label={messages.header.menu}
          onKeyDown={handleMenuKey}
        >
          <li role="presentation" className={styles.heading}>
            {messages.header.projects}
          </li>
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
                onClick={() => handleProject(project.id)}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.text}>
                  <span className={styles.name}>{project.name}</span>
                  <span className={styles.tagline}>{project.tagline}</span>
                </span>
              </Button>
            </li>
          ))}
          <li role="separator" className={styles.separator} />
          <li role="presentation" className={styles.heading}>
            {messages.header.language}
          </li>
          {LOCALES.map((option, index) => (
            <li key={option} role="none">
              <Button
                ref={(node) => {
                  itemRefs.current[languageStart + index] = node
                }}
                variant="ghost"
                role="menuitemradio"
                tabIndex={-1}
                lang={option}
                className={styles.item}
                aria-checked={option === locale}
                onClick={() => handleLocale(option)}
              >
                <span className={styles.name}>{LOCALE_LABELS[option].name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
