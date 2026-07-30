import { cn } from '@/lib/utils'

// Classe padrão para inputs/textarea/select do protótipo — label sempre visível
// (aplicado via FormField), foco visível via .tpl-av *:focus-visible.
export const tplInputClass =
  'w-full border-2 border-[var(--tpl-border)] rounded-xl px-4 py-3 text-sm bg-white text-[var(--tpl-text-primary)] outline-none transition-colors focus:border-[var(--tpl-primary)] placeholder:text-[var(--tpl-text-muted)] min-h-[44px]'

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}

export function FormField({ label, htmlFor, required, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn(className)}>
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wide text-[var(--tpl-text-secondary)] block mb-1.5">
        {label}
        {required && <span className="text-[var(--tpl-danger)]"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--tpl-text-muted)] mt-1">{hint}</p>}
      {error && <p className="text-xs text-[var(--tpl-danger)] font-medium mt-1">{error}</p>}
    </div>
  )
}
