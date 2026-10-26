import { forwardRef } from 'react'
import styles from './styles.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface StyleProps {
  variant?: Variant
  size?: Size
  className?: string
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {}

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, StyleProps {
  href: string
}

function buttonClass({ variant = 'primary', size = 'md', className }: StyleProps): string {
  return [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClass({ variant, size, className })} {...props} />
  ),
)

Button.displayName = 'Button'

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <a
      {...props}
      ref={ref}
      className={buttonClass({ variant, size, className })}
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
)

LinkButton.displayName = 'LinkButton'
