const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function trapTab(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== 'Tab') return
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
