'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { DataList, DataRow } from '@/components/template-alternativa/DataTable'
import { Modal } from '@/components/template-alternativa/Modal'
import { ConfirmDialog } from '@/components/template-alternativa/ConfirmDialog'
import { Toast } from '@/components/template-alternativa/Toast'
import { EmptyState } from '@/components/template-alternativa/EmptyState'
import { Button, ButtonLink } from '@/components/template-alternativa/Button'
import { FormField, tplInputClass } from '@/components/template-alternativa/FormField'
import { formatCPF, totalMoradores, iniciais } from '@/lib/template-alternativa/format'
import { mockBeneficiariosAprovados, type MockBeneficiario } from '@/lib/template-alternativa/mock-data'

// Busca, edição e remoção operam só sobre o array em memória — nada é salvo
// de verdade, e a página recarrega para a lista original ao ser revisitada.
export default function TemplateBeneficiariosPage() {
  const [lista, setLista] = useState<MockBeneficiario[]>(mockBeneficiariosAprovados)
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<MockBeneficiario | null>(null)
  const [removendo, setRemovendo] = useState<MockBeneficiario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const filtrada = useMemo(() => {
    if (!busca.trim()) return lista
    const termo = busca.trim().toLowerCase()
    return lista.filter((b) => b.nome.toLowerCase().includes(termo) || b.cpf.includes(termo.replace(/\D/g, '')))
  }, [lista, busca])

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setTimeout(() => {
      setSalvando(false)
      setEditando(null)
      setToast('Alterações salvas.')
    }, 500)
  }

  function remover() {
    if (!removendo) return
    setLista((l) => l.filter((b) => b.id !== removendo.id))
    setToast(`${removendo.nome} removido(a).`)
    setRemovendo(null)
  }

  return (
    <AdminShell title="Beneficiários cadastrados" backHref="/template-visual/admin"
      headerAction={<ButtonLink href="/template-visual/admin/beneficiarios/novo" size="md" className="!py-1.5 !px-3 !text-xs">+ Novo</ButtonLink>}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou CPF…"
            className={tplInputClass + ' flex-1'} />
        </div>

        <p className="text-xs text-[var(--tpl-text-muted)] font-medium">
          {filtrada.length} beneficiário{filtrada.length !== 1 ? 's' : ''} encontrado{filtrada.length !== 1 ? 's' : ''}
        </p>

        <DataList>
          {filtrada.map((b) => (
            <DataRow key={b.id}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                {iniciais(b.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--tpl-text-primary)] truncate">{b.nome}</p>
                <p className="text-xs text-[var(--tpl-text-muted)]">{formatCPF(b.cpf)} · {totalMoradores(b)} morador{totalMoradores(b) !== 1 ? 'es' : ''}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Link href={`/template-visual/admin/beneficiarios/${b.id}`}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--tpl-border)] text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)] transition-colors">
                  Ver
                </Link>
                <button onClick={() => setEditando(b)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--tpl-border)] text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)] transition-colors">
                  Editar
                </button>
                <button onClick={() => setRemovendo(b)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-[var(--tpl-danger)] hover:bg-[var(--tpl-danger-soft)] transition-colors">
                  Remover
                </button>
              </div>
            </DataRow>
          ))}
        </DataList>

        {filtrada.length === 0 && (
          <EmptyState icon="👥" title="Nenhum resultado" description={busca ? 'Nenhum resultado para a busca.' : 'Nenhum beneficiário cadastrado ainda.'} />
        )}
      </div>

      <Modal open={!!editando} onClose={() => setEditando(null)} title="Editar beneficiário">
        {editando && (
          <form onSubmit={salvar} className="space-y-3">
            <FormField label="Nome completo" htmlFor="edit-nome" required>
              <input id="edit-nome" defaultValue={editando.nome} className={tplInputClass} />
            </FormField>
            <FormField label="CPF" htmlFor="edit-cpf" required>
              <input id="edit-cpf" defaultValue={formatCPF(editando.cpf)} className={tplInputClass} />
            </FormField>
            <FormField label="Telefone" htmlFor="edit-telefone">
              <input id="edit-telefone" defaultValue={editando.telefone} className={tplInputClass} />
            </FormField>
            <FormField label="Endereço" htmlFor="edit-endereco">
              <input id="edit-endereco" defaultValue={editando.endereco} className={tplInputClass} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" fullWidth onClick={() => setEditando(null)}>Cancelar</Button>
              <Button type="submit" fullWidth disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!removendo}
        onClose={() => setRemovendo(null)}
        onConfirm={remover}
        title="Remover beneficiário"
        description={`Remover ${removendo?.nome}? O registro ficará inativo, mas o histórico é mantido.`}
        confirmLabel="Remover"
        danger
      />

      {toast && <Toast message={toast} tone="success" onClose={() => setToast(null)} />}
    </AdminShell>
  )
}
