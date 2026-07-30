import { cn } from '@/lib/utils'

// Lista de registros em cards empilhados em vez de <table> — em telas de
// celular uma tabela tradicional força rolagem horizontal e é difícil de ler
// para o público-alvo deste sistema. Cada "linha" já é responsiva por natureza.
export function DataList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-2', className)}>{children}</div>
}

export function DataRow({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-xl p-4 flex items-center gap-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
