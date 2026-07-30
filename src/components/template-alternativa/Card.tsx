import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-2xl shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}
