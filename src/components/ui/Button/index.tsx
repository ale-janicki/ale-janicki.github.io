import { forwardRef } from 'react'
import styles from './styles.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, type = 'button', ...props }, ref) => {
    const cls = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')

    return <button ref={ref} type={type} className={cls} {...props} />
  },
)

Button.displayName = 'Button'
