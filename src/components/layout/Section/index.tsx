import { useRef } from 'react'
import { useReveal } from '@/hooks/useReveal'
import styles from './styles.module.css'

interface SectionProps {
  id?: string
  label: string
  full: boolean
  align?: 'left' | 'right'
  mobileEnd?: boolean
  reveal?: boolean
  children: React.ReactNode
}

export function Section({
  id,
  label,
  full,
  align = 'left',
  mobileEnd = false,
  reveal = full,
  children,
}: SectionProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  useReveal(contentRef, styles.visible, reveal)

  const sectionCls = [
    styles.section,
    full ? styles.full : '',
    align === 'right' ? styles.right : '',
    mobileEnd ? styles.mobileEnd : '',
  ]
  const contentCls = [styles.content, reveal ? styles.reveal : '']

  return (
    <section id={id} aria-label={label} className={sectionCls.filter(Boolean).join(' ')}>
      <div ref={contentRef} className={contentCls.filter(Boolean).join(' ')}>
        {children}
      </div>
    </section>
  )
}
