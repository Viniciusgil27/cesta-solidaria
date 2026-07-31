export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12 px-4">
      <p className="text-4xl mb-3" aria-hidden="true">{icon}</p>
      <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] mb-1">{title}</p>
      {description && (
        <p className="text-sm text-[var(--tpl-text-secondary)] max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
