export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3" role="status" aria-live="polite">
      <div
        className="w-8 h-8 border-[3px] border-[var(--tpl-primary-soft)] border-t-[var(--tpl-primary)] rounded-full animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm text-[var(--tpl-text-secondary)]">{label}</p>
    </div>
  )
}
