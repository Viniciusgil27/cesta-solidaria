'use client'
// src/app/admin/(protected)/pendentes/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { formatCPF, totalMoradores, iniciais } from '@/lib/utils'
import type { Beneficiario } from '@/types'
import { AdminShell } from '@/components/ui/AdminShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

export default function PendentesPage() {
  const [lista, setLista] = useState<Beneficiario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState<string | null>(null)
  const [imagemAberta, setImagemAberta] = useState<string | null>(null)
  const [rejeitando, setRejeitando] = useState<{ id: string; nome: string } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const res = await fetch('/api/beneficiarios/pendentes')
    if (res.ok) setLista(await res.json())
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function aprovar(id: string, nome: string) {
    setProcessando(id)
    await fetch(`/api/beneficiarios/${id}/aprovar`, { method: 'PUT' })
    setProcessando(null)
    setToast(`Cadastro de ${nome} aprovado.`)
    carregar()
  }

  async function confirmarRejeicao() {
    if (!rejeitando || !motivo.trim()) return
    setProcessando(rejeitando.id)
    await fetch(`/api/beneficiarios/${rejeitando.id}/rejeitar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivo.trim() }),
    })
    setProcessando(null)
    setToast(`Cadastro de ${rejeitando.nome} rejeitado.`)
    setRejeitando(null)
    setMotivo('')
    carregar()
  }

  return (
    <AdminShell title="Cadastros pendentes" backHref="/admin"
      headerAction={!carregando && lista.length > 0 && (
        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-400 text-amber-900">{lista.length}</span>
      )}>
      <div className="space-y-4">
        <p className="text-xs text-[var(--tpl-text-muted)]">
          Cadastros realizados pelo site que aguardam confirmação do administrador.
        </p>

        {carregando && <LoadingState />}

        {!carregando && lista.length === 0 && (
          <EmptyState icon="✅" title="Tudo em dia" description="Nenhum cadastro pendente de aprovação." />
        )}

        <div className="space-y-3">
          {lista.map(b => (
            <Card key={b.id} className="overflow-hidden border-2 border-amber-200">

              {b.comprovanteUrl ? (
                <button
                  type="button"
                  onClick={() => setImagemAberta(b.comprovanteUrl ?? null)}
                  className="w-full relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.comprovanteUrl}
                    alt="Comprovante de residência"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/90 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                      🔍 Ver comprovante
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-full h-14 bg-[var(--tpl-surface-muted)] flex items-center justify-center">
                  <p className="text-xs text-[var(--tpl-text-muted)]">Sem comprovante enviado</p>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                    {iniciais(b.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">{b.nome}</p>
                    <p className="text-xs text-[var(--tpl-text-secondary)]">{formatCPF(b.cpf)}</p>
                    {b.telefone && <p className="text-xs text-[var(--tpl-text-secondary)]">{b.telefone}</p>}
                    {b.endereco && (
                      <p className="text-xs text-[var(--tpl-text-secondary)] truncate">
                        {b.endereco}{b.bairro ? ` · ${b.bairro}` : ''}
                      </p>
                    )}
                    <p className="text-xs text-[var(--tpl-text-muted)] mt-0.5">
                      {totalMoradores(b)} morador{totalMoradores(b) !== 1 ? 'es' : ''}
                      {b.criancas > 0 && ` · ${b.criancas} criança${b.criancas > 1 ? 's' : ''}`}
                      {b.adolescentes > 0 && ` · ${b.adolescentes} adolescente${b.adolescentes > 1 ? 's' : ''}`}
                      {b.idosos > 0 && ` · ${b.idosos} idoso${b.idosos > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--tpl-warning)] font-medium">
                  Solicitado em {new Date(b.criadoEm).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                  })}
                </p>

                <div className="flex gap-2">
                  <Button variant="outlineDanger" size="md" fullWidth disabled={processando === b.id}
                    onClick={() => { setRejeitando({ id: b.id, nome: b.nome }); setMotivo('') }}>
                    Rejeitar
                  </Button>
                  <Button variant="primary" size="md" fullWidth disabled={processando === b.id}
                    onClick={() => aprovar(b.id, b.nome)}>
                    {processando === b.id ? 'Processando…' : 'Aprovar'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal de visualização do comprovante */}
      <Modal open={!!imagemAberta} onClose={() => setImagemAberta(null)} title="Comprovante de residência">
        {imagemAberta && (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagemAberta}
              alt="Comprovante de residência"
              className="w-full rounded-xl max-h-[70vh] object-contain bg-[var(--tpl-surface-muted)]"
            />
            <a
              href={imagemAberta}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-[var(--tpl-primary)] underline">
              Abrir em nova aba
            </a>
          </div>
        )}
      </Modal>

      {/* Modal de motivo da rejeição */}
      <Modal open={!!rejeitando} onClose={() => setRejeitando(null)} title="Rejeitar cadastro">
        <p className="text-sm text-[var(--tpl-text-secondary)] mb-4">
          Informe o motivo da rejeição de <strong>{rejeitando?.nome}</strong>. Esse motivo será exibido para a pessoa
          na consulta de cadastro.
        </p>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          rows={3}
          autoFocus
          placeholder="Ex: Comprovante de residência ilegível."
          className="w-full border-2 border-[var(--tpl-border)] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[var(--tpl-danger)] transition-colors resize-none"
        />
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" fullWidth onClick={() => setRejeitando(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth disabled={!motivo.trim() || processando === rejeitando?.id} onClick={confirmarRejeicao}>
            {processando === rejeitando?.id ? 'Enviando…' : 'Confirmar rejeição'}
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast} tone="success" onClose={() => setToast(null)} />}
    </AdminShell>
  )
}
