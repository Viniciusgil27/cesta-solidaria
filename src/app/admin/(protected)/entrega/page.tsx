'use client'
// src/app/admin/(protected)/entrega/page.tsx
import { useState, useEffect, useRef } from 'react'
import { formatCPF, totalMoradores } from '@/lib/utils'
import type { Beneficiario } from '@/types'
import { AdminShell } from '@/components/ui/AdminShell'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type Status = 'idle' | 'pode_retirar' | 'ja_retirou' | 'nao_cadastrado'
type Confirmado = { nome: string; cpf: string }

export default function EntregaPage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [pessoa, setPessoa] = useState<Beneficiario | null>(null)
  const [confirmados, setConfirmados] = useState<Confirmado[]>([])
  const [entregaId, setEntregaId] = useState<string | null>(null)
  const [encerrandoId, setEncerrandoId] = useState<string | null>(null)
  const [modalEncerrar, setModalEncerrar] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/entregas').then(r => r.json()).then(data => {
      const ativa = data.find((e: any) => e.status === 'ATIVA')
      if (ativa) setEntregaId(ativa.id)
    })
    inputRef.current?.focus()
  }, [])

  async function buscar() {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length < 11) return
    setLoading(true)
    setStatus('idle')
    const res = await fetch(`/api/beneficiarios/cpf/${cpfLimpo}?entregaId=${entregaId}`)
    const data = await res.json()
    setLoading(false)
    setStatus(data.status)
    setPessoa(data.beneficiario || null)
  }

  async function confirmar() {
    if (!pessoa || !entregaId) return
    setLoading(true)
    const res = await fetch(`/api/entregas/${entregaId}/retirada`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beneficiarioId: pessoa.id }),
    })
    setLoading(false)
    if (res.ok) {
      setConfirmados(prev => [{ nome: pessoa.nome, cpf: pessoa.cpf }, ...prev])
      setStatus('idle')
      setCpf('')
      setPessoa(null)
      inputRef.current?.focus()
    }
  }

  async function encerrar() {
    if (!entregaId) return
    setEncerrandoId(entregaId)
    await fetch(`/api/entregas/${entregaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'encerrar' }),
    })
    setEncerrandoId(null)
    setModalEncerrar(false)
    window.location.href = '/admin'
  }

  const statusStyle: Record<Exclude<Status, 'idle'>, { bg: string; border: string; text: string; title: string; msg: string }> = {
    pode_retirar: { bg: 'bg-[var(--tpl-success-soft)]', border: 'border-emerald-300', text: 'text-[var(--tpl-success)]', title: '✓ Pode retirar', msg: 'Família cadastrada e apta a receber a cesta.' },
    ja_retirou: { bg: 'bg-[var(--tpl-warning-soft)]', border: 'border-amber-300', text: 'text-[var(--tpl-warning)]', title: '⚠ Já retirou', msg: 'Esta família já retirou a cesta nesta entrega.' },
    nao_cadastrado: { bg: 'bg-[var(--tpl-danger-soft)]', border: 'border-red-300', text: 'text-[var(--tpl-danger)]', title: '✕ Não cadastrado', msg: 'Este CPF não está na lista. Verifique o número ou cadastre a família.' },
  }

  return (
    <AdminShell title="Entrega de cestas" backHref="/admin"
      headerAction={<button onClick={() => setModalEncerrar(true)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/15 text-white sm:bg-transparent sm:text-[var(--tpl-danger)] sm:border sm:border-red-200">Encerrar</button>}>
      <div className="space-y-5">
        <div>
          <p className="tpl-eyebrow mb-2">CPF do beneficiário</p>
          <div className="flex gap-2.5">
            <input ref={inputRef} value={cpf}
              onChange={(e) => { setCpf(formatCPF(e.target.value)); setStatus('idle') }}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              type="text" inputMode="numeric" placeholder="000.000.000-00" maxLength={14}
              className="flex-1 min-w-0 border-2 border-[var(--tpl-border)] rounded-xl px-4 py-3 text-base outline-none focus:border-[var(--tpl-primary)] bg-white tracking-wider" />
            <Button onClick={buscar} disabled={loading || cpf.replace(/\D/g, '').length < 11} className="flex-shrink-0">
              {loading ? '…' : 'Buscar'}
            </Button>
          </div>
        </div>

        {status !== 'idle' && (
          <div className={`rounded-2xl p-4 border-2 ${statusStyle[status].bg} ${statusStyle[status].border}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${statusStyle[status].text}`}>{statusStyle[status].title}</p>
            <p className="text-xl font-tpl-serif font-bold mb-1 text-[var(--tpl-text-primary)]">{pessoa?.nome || 'CPF não encontrado'}</p>
            <p className="text-sm text-[var(--tpl-text-secondary)] mb-2">{statusStyle[status].msg}</p>
            {pessoa && (
              <p className="text-xs text-[var(--tpl-text-secondary)] bg-white/60 rounded-lg px-3 py-2 mb-3">
                {totalMoradores(pessoa)} pessoa{totalMoradores(pessoa) !== 1 ? 's' : ''} na casa · {pessoa.criancas} criança{pessoa.criancas !== 1 ? 's' : ''} · {pessoa.adolescentes} adolescente{pessoa.adolescentes !== 1 ? 's' : ''} · {pessoa.adultos} adulto{pessoa.adultos !== 1 ? 's' : ''} · {pessoa.idosos} idoso{pessoa.idosos !== 1 ? 's' : ''}
              </p>
            )}
            {status === 'pode_retirar' && (
              <Button fullWidth className="!bg-[var(--tpl-success)] hover:!bg-emerald-700" disabled={loading} onClick={confirmar}>
                {loading ? 'Confirmando…' : '✓ Confirmar retirada'}
              </Button>
            )}
          </div>
        )}

        <div>
          <p className="tpl-eyebrow mb-2">Confirmadas nesta sessão ({confirmados.length})</p>
          {confirmados.length === 0 ? (
            <p className="text-sm text-[var(--tpl-text-muted)]">Nenhuma confirmação ainda.</p>
          ) : (
            <div className="space-y-2">
              {confirmados.map((c, i) => (
                <div key={i} className="bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">{c.nome}</p>
                    <p className="text-xs text-[var(--tpl-text-muted)] mt-0.5">{formatCPF(c.cpf)}</p>
                  </div>
                  <span className="text-xs font-bold bg-[var(--tpl-success-soft)] text-[var(--tpl-success)] px-2.5 py-1 rounded-full">Retirou</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={modalEncerrar}
        onClose={() => setModalEncerrar(false)}
        onConfirm={encerrar}
        title="Encerrar entrega"
        description="Encerrar salva os resultados no histórico. Você poderá visualizar os dados depois."
        confirmLabel="Encerrar"
        loading={!!encerrandoId}
      />
    </AdminShell>
  )
}
