'use client'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'error' | 'info'

const toneClasses: Record<Tone, string> = {
  success: 'bg-[var(--tpl-success)]',
  error: 'bg-[var(--tpl-danger)]',
  info: 'bg-[var(--tpl-primary)]',
}

interface ToastProps {
  message: string
  tone?: Tone
  onClose: () => void
  autoCloseMs?: number
}

export function Toast({ message, tone = 'success', onClose, autoCloseMs = 3000 }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(id)
  }, [onClose, autoCloseMs])

  return (
    <div
      role="status"
      className={cn(
        'fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] text-white text-sm font-semibold pl-4 pr-3 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-[90vw]',
        toneClasses[tone]
      )}
    >
      <span>{message}</span>
      <button onClick={onClose} aria-label="Fechar aviso" className="text-white/80 hover:text-white leading-none">✕</button>
    </div>
  )
}
