'use client'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}

// Ações perigosas exigem confirmação explícita — nunca disparadas direto no clique da lista.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  danger = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed mb-5">{description}</p>
      <div className="flex gap-3">
        <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
        <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={onConfirm} disabled={loading}>
          {loading ? 'Processando…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
