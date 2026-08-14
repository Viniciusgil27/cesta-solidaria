'use client'
// src/app/admin/(protected)/voluntarios/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCPF, formatPhone, formatDateTime, iniciais } from '@/lib/utils'
import type { Voluntario } from '@/types'
import { AdminShell } from '@/components/ui/AdminShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormField, tplInputClass } from '@/components/ui/FormField'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'

export default function VerVoluntarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [v, setV] = useState<Voluntario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', observacoes: '' })
  const [salvando, setSalvando] = useState(false)
  const [removendo, setRemovendo] = useState(false)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch(`/api/voluntarios/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setV(data); setCarregando(false) })
  }, [id])

  function abrirEdicao() {
    if (!v) return
    setErro('')
    setForm({
      nome: v.nome,
      cpf: formatCPF(v.cpf),
      telefone: formatPhone(v.telefone),
      observacoes: v.observacoes || '',
    })
    setEditando(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.cpf.replace(/\D/g, '').length < 11) { setErro('Informe um CPF válido.'); return }
    setSalvando(true)
    const res = await fetch(`/api/voluntarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cpf: form.cpf.replace(/\D/g, '') }),
    })
    setSalvando(false)
    if (!res.ok) { const d = await res.json(); setErro(d.error || 'Erro ao salvar'); return }
    setV(await res.json())
    setEditando(false)
  }

  async function alternarStatus() {
    if (!v) return
    setAlterandoStatus(true)
    const res = await fetch(`/api/voluntarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: v.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' }),
    })
    setAlterandoStatus(false)
    if (res.ok) setV(await res.json())
  }

  async function remover() {
    if (!v || !confirm(`Remover ${v.nome} da lista de voluntários? Esta ação não pode ser desfeita.`)) return
    setRemovendo(true)
    await fetch(`/api/voluntarios/${id}`, { method: 'DELETE' })
    router.push('/admin/voluntarios')
  }

  if (carregando) {
    return (
      <AdminShell title="Voluntário" backHref="/admin/voluntarios">
        <LoadingState />
      </AdminShell>
    )
  }

  if (!v) {
    return (
      <AdminShell title="Voluntário" backHref="/admin/voluntarios">
        <EmptyState icon="🔍" title="Voluntário não encontrado" />
      </AdminShell>
    )
  }

  return (
    <AdminShell title={v.nome} backHref="/admin/voluntarios"
      headerAction={!editando && (
        <Button size="md" className="!py-1.5 !px-3 !text-xs" onClick={abrirEdicao}>Editar</Button>
      )}>
      <div className="space-y-4">
        {editando ? (
          <Card className="p-5">
            <form onSubmit={salvar} className="space-y-3">
              {erro && <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>}

              <FormField label="Nome completo" htmlFor="v-nome" required>
                <input id="v-nome" className={tplInputClass} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
              </FormField>
              <FormField label="CPF" htmlFor="v-cpf" required>
                <input id="v-cpf" className={tplInputClass + ' font-tpl-legible'} placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
                  value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))} required />
              </FormField>
              <FormField label="Telefone" htmlFor="v-telefone">
                <input id="v-telefone" className={tplInputClass + ' font-tpl-legible'} placeholder="(19) 9 0000-0000" type="tel"
                  value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: formatPhone(e.target.value) }))} />
              </FormField>
              <FormField label="Observações" htmlFor="v-obs">
                <textarea id="v-obs" className={tplInputClass + ' resize-none'} rows={3}
                  placeholder="Disponibilidade, função, observações da equipe…"
                  value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              </FormField>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" fullWidth onClick={() => { setEditando(false); setErro('') }}>Cancelar</Button>
                <Button type="submit" fullWidth disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
              </div>
            </form>
          </Card>
        ) : (
          <>
            <Card className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                {iniciais(v.nome)}
              </div>
              <div className="min-w-0">
                <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] truncate">{v.nome}</p>
                <p className="text-sm text-[var(--tpl-text-secondary)] mt-0.5 font-tpl-legible">{formatCPF(v.cpf)}</p>
                <p className="text-xs text-[var(--tpl-text-muted)] mt-1">Cadastrado em <span className="font-tpl-legible">{formatDateTime(v.criadoEm)}</span></p>
              </div>
            </Card>

            <Card className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="tpl-eyebrow mb-1">Status</p>
                <Badge tone={v.status === 'ATIVO' ? 'success' : 'neutral'}>{v.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</Badge>
              </div>
              <Button variant="ghost" size="md" disabled={alterandoStatus} onClick={alternarStatus} className="border border-[var(--tpl-border)] !py-2">
                {alterandoStatus ? 'Salvando…' : v.status === 'ATIVO' ? 'Marcar como inativo' : 'Marcar como ativo'}
              </Button>
            </Card>

            <Card className="p-5">
              <p className="tpl-eyebrow mb-2">Contato</p>
              <p className="text-sm text-[var(--tpl-text-primary)] font-tpl-legible">📱 {formatPhone(v.telefone)}</p>
            </Card>

            <Card className="p-5">
              <p className="tpl-eyebrow mb-2">Observações</p>
              {v.observacoes ? (
                <p className="text-sm text-[var(--tpl-text-primary)] leading-relaxed whitespace-pre-line">{v.observacoes}</p>
              ) : (
                <p className="text-sm text-[var(--tpl-text-muted)] italic">Nenhuma observação registrada.</p>
              )}
            </Card>

            <Button variant="outlineDanger" fullWidth disabled={removendo} onClick={remover}>
              {removendo ? 'Removendo…' : 'Remover voluntário'}
            </Button>
          </>
        )}
      </div>
    </AdminShell>
  )
}
