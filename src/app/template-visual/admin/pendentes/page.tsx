'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Card } from '@/components/template-alternativa/Card'
import { Button } from '@/components/template-alternativa/Button'
import { Modal } from '@/components/template-alternativa/Modal'
import { Toast } from '@/components/template-alternativa/Toast'
import { EmptyState } from '@/components/template-alternativa/EmptyState'
import { formatCPF, totalMoradores } from '@/lib/template-alternativa/format'
import { mockBeneficiariosPendentes, type MockBeneficiario } from '@/lib/template-alternativa/mock-data'

// Lista, aprovação e rejeição são simuladas em estado local (useState) — nada
// é persistido, e o comprovante é representado por um bloco ilustrativo, nunca
// por uma imagem real de documento.
export default function TemplatePendentesPage() {
  const [lista, setLista] = useState<MockBeneficiario[]>(mockBeneficiariosPendentes)
  const [processando, setProcessando] = useState<string | null>(null)
  const [comprovanteAberto, setComprovanteAberto] = useState<string | null>(null)
  const [rejeitando, setRejeitando] = useState<{ id: string; nome: string } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function aprovar(id: string, nome: string) {
    setProcessando(id)
    setTimeout(() => {
      setLista((l) => l.filter((b) => b.id !== id))
      setProcessando(null)
      setToast(`Cadastro de ${nome} aprovado.`)
    }, 500)
  }

  function confirmarRejeicao() {
    if (!rejeitando || !motivo.trim()) return
    setProcessando(rejeitando.id)
    setTimeout(() => {
      setLista((l) => l.filter((b) => b.id !== rejeitando.id))
      setProcessando(null)
      setToast(`Cadastro de ${rejeitando.nome} rejeitado.`)
      setRejeitando(null)
      setMotivo('')
    }, 500)
  }

  return (
    <AdminShell title="Cadastros pendentes" backHref="/template-visual/admin"
      headerAction={lista.length > 0 && (
        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-400 text-amber-900">{lista.length}</span>
      )}>
      <div className="space-y-4">
        <p className="text-xs text-[var(--tpl-text-muted)]">
          Cadastros realizados pelo site que aguardam confirmação do administrador.
        </p>

        {lista.length === 0 && (
          <EmptyState icon="✅" title="Tudo em dia" description="Nenhum cadastro pendente de aprovação." />
        )}

        <div className="space-y-3">
          {lista.map((b) => (
            <Card key={b.id} className="overflow-hidden border-2 border-amber-200">
              {b.temComprovante ? (
                <button type="button" onClick={() => setComprovanteAberto(b.nome)} className="w-full h-28 flex items-center justify-center gap-2 bg-[var(--tpl-surface-muted)] hover:bg-amber-100 transition-colors">
                  <span className="text-2xl" aria-hidden="true">📄</span>
                  <span className="text-xs font-semibold text-[var(--tpl-text-secondary)]">Ver comprovante de residência</span>
                </button>
              ) : (
                <div className="w-full h-14 bg-[var(--tpl-surface-muted)] flex items-center justify-center">
                  <p className="text-xs text-[var(--tpl-text-muted)]">Sem comprovante enviado</p>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                    {b.nome.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">{b.nome}</p>
                    <p className="text-xs text-[var(--tpl-text-secondary)]">{formatCPF(b.cpf)}</p>
                    <p className="text-xs text-[var(--tpl-text-secondary)]">{b.telefone}</p>
                    <p className="text-xs text-[var(--tpl-text-secondary)] truncate">{b.endereco} · {b.bairro}</p>
                    <p className="text-xs text-[var(--tpl-text-muted)] mt-0.5">
                      {totalMoradores(b)} morador{totalMoradores(b) !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>

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

      <Modal open={!!comprovanteAberto} onClose={() => setComprovanteAberto(null)} title="Comprovante de residência">
        <div className="rounded-xl bg-[var(--tpl-surface-muted)] h-56 flex flex-col items-center justify-center gap-2 text-center px-4">
          <span className="text-4xl" aria-hidden="true">📄</span>
          <p className="text-sm text-[var(--tpl-text-secondary)]">
            Representação do documento enviado por <strong>{comprovanteAberto}</strong>.<br />
            Protótipo visual — nenhum arquivo real é exibido aqui.
          </p>
        </div>
      </Modal>

      <Modal open={!!rejeitando} onClose={() => setRejeitando(null)} title="Rejeitar cadastro">
        <p className="text-sm text-[var(--tpl-text-secondary)] mb-4">
          Informe o motivo da rejeição de <strong>{rejeitando?.nome}</strong>. Esse motivo será exibido para a pessoa
          na consulta de cadastro.
        </p>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
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
