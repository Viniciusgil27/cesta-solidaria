'use client'
// src/app/admin/(protected)/admins/page.tsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { iniciais } from '@/lib/utils'
import { AdminShell } from '@/components/ui/AdminShell'
import { DataList, DataRow } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FormField, tplInputClass } from '@/components/ui/FormField'

type Admin = { id: string; nome: string; email: string; superAdmin: boolean; ativo: boolean; criadoEm: string }

export default function AdminsPage() {
  const { data: session } = useSession()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const isSuperAdmin = (session?.user as any)?.superAdmin

  async function carregar() {
    const res = await fetch('/api/admins')
    if (res.ok) setAdmins(await res.json())
  }

  useEffect(() => { carregar() }, [])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.senha.length < 8) { setErro('Senha deve ter pelo menos 8 caracteres.'); return }
    setLoading(true)
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErro(d.error); return }
    setModal(false)
    setForm({ nome: '', email: '', senha: '' })
    carregar()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch(`/api/admins/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    carregar()
  }

  async function remover(id: string, nome: string) {
    if (!confirm(`Remover ${nome}? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/admins/${id}`, { method: 'DELETE' })
    carregar()
  }

  return (
    <AdminShell title="Gerenciar admins" backHref="/admin"
      headerAction={isSuperAdmin && (
        <Button size="md" className="!py-1.5 !px-3 !text-xs" onClick={() => setModal(true)}>+ Novo</Button>
      )}>
      <div className="space-y-4">
        {!isSuperAdmin && (
          <div className="bg-[var(--tpl-warning-soft)] border border-amber-200 rounded-xl p-3 text-sm text-[var(--tpl-warning)]">
            Somente o super admin pode gerenciar outros admins.
          </div>
        )}

        <DataList>
          {admins.map(a => (
            <DataRow key={a.id} className="flex-col items-stretch sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                  {iniciais(a.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold truncate text-[var(--tpl-text-primary)]">{a.nome}</p>
                    {a.superAdmin && <Badge tone="primary">Super</Badge>}
                    {!a.ativo && <Badge tone="neutral">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-[var(--tpl-text-muted)] truncate">{a.email}</p>
                </div>
              </div>
              {isSuperAdmin && !a.superAdmin && (
                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-shrink-0">
                  <button onClick={() => toggleAtivo(a.id, a.ativo)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--tpl-border)] text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)] transition-colors">
                    {a.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => remover(a.id, a.nome)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-[var(--tpl-danger)] hover:bg-[var(--tpl-danger-soft)] transition-colors">
                    Remover
                  </button>
                </div>
              )}
            </DataRow>
          ))}
        </DataList>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Novo administrador">
        {erro && <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 mb-3 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>}

        <form onSubmit={criar} className="space-y-3">
          <FormField label="Nome" htmlFor="a-nome" required>
            <input id="a-nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className={tplInputClass} placeholder="Nome completo" required />
          </FormField>
          <FormField label="Email" htmlFor="a-email" required>
            <input id="a-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={tplInputClass} placeholder="email@altvida.org" required />
          </FormField>
          <FormField label="Senha inicial" htmlFor="a-senha" required>
            <input id="a-senha" type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              className={tplInputClass + ' font-tpl-legible'} placeholder="Mínimo 8 caracteres" required minLength={8} />
          </FormField>
          <Button type="submit" fullWidth disabled={loading} className="mt-2">
            {loading ? 'Criando…' : 'Criar administrador'}
          </Button>
        </form>
      </Modal>
    </AdminShell>
  )
}
