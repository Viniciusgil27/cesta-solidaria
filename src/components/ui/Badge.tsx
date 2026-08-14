import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary'

const toneClasses: Record<Tone, string> = {
  success: 'bg-[var(--tpl-success-soft)] text-[var(--tpl-success)]',
  warning: 'bg-[var(--tpl-warning-soft)] text-[var(--tpl-warning)]',
  danger: 'bg-[var(--tpl-danger-soft)] text-[var(--tpl-danger)]',
  neutral: 'bg-[var(--tpl-surface-muted)] text-[var(--tpl-text-secondary)]',
  primary: 'bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]',
}

// Status sempre com texto + cor (nunca só cor), para não depender de percepção de cor.
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-tpl-legible inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap', toneClasses[tone], className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" aria-hidden="true" />
      {children}
    </span>
  )
}
