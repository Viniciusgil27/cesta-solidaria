'use client'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--tpl-surface-card)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md sm:m-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--tpl-surface-card)] px-6 pt-6 pb-3 flex items-center justify-between border-b border-[var(--tpl-border)]">
          <h3 className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)]">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-[var(--tpl-text-muted)] text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
