import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outlineDanger'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--tpl-primary)] text-white hover:bg-[var(--tpl-primary-hover)]',
  secondary: 'bg-[var(--tpl-surface-muted)] text-[var(--tpl-primary)] hover:brightness-95',
  ghost: 'bg-transparent text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)]',
  danger: 'bg-[var(--tpl-danger)] text-white hover:opacity-90',
  outlineDanger: 'bg-transparent border-2 border-[var(--tpl-danger)] text-[var(--tpl-danger)] hover:bg-[var(--tpl-danger-soft)]',
}

const sizeClasses: Record<Size, string> = {
  md: 'py-3 px-4 text-sm min-h-[44px]',
  lg: 'py-3.5 px-5 text-base min-h-[48px]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  className?: string
  children: React.ReactNode
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className)} {...props}>
      {children}
    </button>
  )
}

interface ButtonLinkProps extends CommonProps {
  href: string
}

export function ButtonLink({ href, variant = 'primary', size = 'md', fullWidth, className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(base, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className)}>
      {children}
    </Link>
  )
}
