import styles from './styles.module.css'

interface ChipProps {
  children: React.ReactNode
}

export function Chip({ children }: ChipProps) {
  return <span className={styles.chip}>{children}</span>
}
