import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/locale'
import { useLocale } from '@/i18n/useLocale'
import styles from './styles.module.css'

export function LanguageMenu() {
  const { locale, setLocale, messages } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }, [])

  const focusItem = useCallback((index: number) => {
    const count = LOCALES.length
    itemRefs.current[(index + count) % count]?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    itemRefs.current[Math.max(LOCALES.indexOf(locale), 0)]?.focus()
    const handlePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open, locale])

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
        focusItem(LOCALES.length - 1)
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

  const handleSelect = (option: Locale) => {
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
        aria-label={`${messages.header.language}: ${LOCALE_LABELS[locale].name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleButtonKey}
      >
        {LOCALE_LABELS[locale].short}
      </Button>
      {open && (
        <ul
          id={menuId}
          className={styles.menu}
          role="menu"
          aria-label={messages.header.language}
          onKeyDown={handleMenuKey}
        >
          {LOCALES.map((option, index) => (
            <li key={option} role="none">
              <Button
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                variant="ghost"
                role="menuitemradio"
                tabIndex={-1}
                lang={option}
                className={styles.item}
                aria-checked={option === locale}
                onClick={() => handleSelect(option)}
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
