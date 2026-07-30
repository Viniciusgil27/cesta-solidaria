'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { DataList, DataRow } from '@/components/template-alternativa/DataTable'
import { Badge } from '@/components/template-alternativa/Badge'
import { Button } from '@/components/template-alternativa/Button'
import { Modal } from '@/components/template-alternativa/Modal'
import { FormField, tplInputClass } from '@/components/template-alternativa/FormField'
import { Toast } from '@/components/template-alternativa/Toast'
import { iniciais } from '@/lib/template-alternativa/format'
import { mockAdmins, type MockAdmin } from '@/lib/template-alternativa/mock-data'

export default function TemplateAdminsPage() {
  const [lista, setLista] = useState<MockAdmin[]>(mockAdmins)
  const [novo, setNovo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function adicionar(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const nome = (form.elements.namedItem('nome') as HTMLInputElement).value
    setSalvando(true)
    setTimeout(() => {
      setLista((l) => [...l, { id: `admin-${l.length + 1}`, nome, email: 'novo@altvida.org.br', superAdmin: false, ativo: true }])
      setSalvando(false)
      setNovo(false)
      setToast(`${nome} adicionado(a) como administrador(a).`)
    }, 500)
  }

  return (
    <AdminShell title="Administradores" backHref="/template-visual/admin"
      headerAction={<Button size="md" className="!py-1.5 !px-3 !text-xs" onClick={() => setNovo(true)}>+ Novo</Button>}>
      <div className="space-y-4">
        <p className="text-xs text-[var(--tpl-text-muted)]">Pessoas com acesso à área administrativa do sistema.</p>

        <DataList>
          {lista.map((a) => (
            <DataRow key={a.id}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                {iniciais(a.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--tpl-text-primary)] truncate">{a.nome}</p>
                <p className="text-xs text-[var(--tpl-text-muted)] truncate">{a.email}</p>
              </div>
              {a.superAdmin && <Badge tone="primary">Super admin</Badge>}
            </DataRow>
          ))}
        </DataList>
      </div>

      <Modal open={novo} onClose={() => setNovo(false)} title="Novo administrador">
        <form onSubmit={adicionar} className="space-y-3">
          <FormField label="Nome completo" htmlFor="nome" required>
            <input id="nome" name="nome" required className={tplInputClass} placeholder="Nome da pessoa" />
          </FormField>
          <FormField label="Email" htmlFor="email" required>
            <input id="email" name="email" type="email" required className={tplInputClass} placeholder="email@altvida.org.br" />
          </FormField>
          <FormField label="Senha provisória" htmlFor="senha" required>
            <input id="senha" name="senha" type="password" required className={tplInputClass} placeholder="••••••••" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={() => setNovo(false)}>Cancelar</Button>
            <Button type="submit" fullWidth disabled={salvando}>{salvando ? 'Salvando…' : 'Adicionar'}</Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast} tone="success" onClose={() => setToast(null)} />}
    </AdminShell>
  )
}
