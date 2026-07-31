'use client'
// src/app/admin/(protected)/beneficiarios/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCPF, totalMoradores, iniciais } from '@/lib/utils'
import type { Beneficiario } from '@/types'
import { AdminShell } from '@/components/ui/AdminShell'
import { DataList, DataRow } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button, ButtonLink } from '@/components/ui/Button'
import { FormField, tplInputClass } from '@/components/ui/FormField'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

const CAMPOS_FORM = [
  { key: 'nome',     label: 'Nome completo',  type: 'text',  required: true,  placeholder: 'Nome da família' },
  { key: 'cpf',      label: 'CPF',            type: 'text',  required: true,  placeholder: '000.000.000-00' },
  { key: 'telefone', label: 'Telefone',        type: 'text',  required: false, placeholder: '(19) 9 0000-0000' },
  { key: 'endereco', label: 'Endereço',        type: 'text',  required: false, placeholder: 'Rua, número' },
  { key: 'bairro',   label: 'Bairro',          type: 'text',  required: false, placeholder: 'Bairro' },
]

const FAIXAS = [
  { key: 'criancas',     label: 'Crianças (0–12)' },
  { key: 'adolescentes', label: 'Adolescentes (13–17)' },
  { key: 'adultos',      label: 'Adultos (18–59)' },
  { key: 'idosos',       label: 'Idosos (60+)' },
]

type FormData = {
  nome: string; cpf: string; telefone: string; endereco: string; bairro: string
  criancas: number; adolescentes: number; adultos: number; idosos: number
}

const FORM_VAZIO: FormData = {
  nome: '', cpf: '', telefone: '', endereco: '', bairro: '',
  criancas: 0, adolescentes: 0, adultos: 0, idosos: 0,
}

export default function BeneficiariosPage() {
  const [lista, setLista] = useState<Beneficiario[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState<Beneficiario | null>(null)
  const [form, setForm] = useState<FormData>(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async (termo = '') => {
    setCarregando(true)
    const res = await fetch(`/api/beneficiarios?busca=${encodeURIComponent(termo)}`)
    if (res.ok) setLista(await res.json())
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    carregar(busca)
  }

  function abrirEdicao(b: Beneficiario) {
    setErro('')
    setForm({
      nome: b.nome, cpf: formatCPF(b.cpf),
      telefone: b.telefone || '', endereco: b.endereco || '', bairro: b.bairro || '',
      criancas: b.criancas, adolescentes: b.adolescentes, adultos: b.adultos, idosos: b.idosos,
    })
    setEditando(b)
  }

  function fecharModal() { setEditando(null); setErro('') }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!editando) return
    setErro('')
    setSalvando(true)
    const res = await fetch(`/api/beneficiarios/${editando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cpf: form.cpf.replace(/\D/g, '') }),
    })
    setSalvando(false)
    if (!res.ok) { const d = await res.json(); setErro(d.error || 'Erro ao salvar'); return }
    fecharModal()
    carregar(busca)
  }

  async function remover(b: Beneficiario) {
    if (!confirm(`Remover ${b.nome}? O registro ficará inativo mas o histórico é mantido.`)) return
    await fetch(`/api/beneficiarios/${b.id}`, { method: 'DELETE' })
    carregar(busca)
  }

  return (
    <AdminShell title="Beneficiários cadastrados" backHref="/admin"
      headerAction={<ButtonLink href="/admin/beneficiarios/novo" size="md" className="!py-1.5 !px-3 !text-xs">+ Novo</ButtonLink>}>
      <div className="space-y-4">
        <form onSubmit={buscar} className="flex gap-2">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF…"
            className={tplInputClass + ' flex-1 min-w-0'}
          />
          <Button type="submit" className="flex-shrink-0">Buscar</Button>
        </form>

        <p className="text-xs text-[var(--tpl-text-muted)] font-medium">
          {carregando ? 'Carregando…' : `${lista.length} beneficiário${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`}
        </p>

        {carregando && <LoadingState />}

        <DataList>
          {lista.map(b => (
            <DataRow key={b.id} className="flex-col items-stretch sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                  {iniciais(b.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-[var(--tpl-text-primary)]">{b.nome}</p>
                  <p className="text-xs text-[var(--tpl-text-muted)] truncate">{formatCPF(b.cpf)} · {totalMoradores(b)} morador{totalMoradores(b) !== 1 ? 'es' : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-shrink-0">
                <Link href={`/admin/beneficiarios/${b.id}`}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--tpl-border)] text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)] transition-colors text-center">
                  Ver
                </Link>
                <button onClick={() => abrirEdicao(b)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--tpl-border)] text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)] transition-colors">
                  Editar
                </button>
                <button onClick={() => remover(b)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-[var(--tpl-danger)] hover:bg-[var(--tpl-danger-soft)] transition-colors">
                  Remover
                </button>
              </div>
            </DataRow>
          ))}
        </DataList>

        {!carregando && lista.length === 0 && (
          <EmptyState icon="👥" title="Nenhum resultado" description={busca ? 'Nenhum resultado para a busca.' : 'Nenhum beneficiário cadastrado ainda.'} />
        )}
      </div>

      {/* Modal de edição */}
      <Modal open={!!editando} onClose={fecharModal} title="Editar beneficiário">
        {erro && <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 text-sm text-[var(--tpl-danger)] font-medium mb-3">{erro}</div>}

        <form onSubmit={salvar} className="space-y-3">
          {CAMPOS_FORM.map(c => (
            <FormField key={c.key} label={c.label} htmlFor={`edit-${c.key}`} required={c.required}>
              <input
                id={`edit-${c.key}`}
                type={c.type}
                value={(form as any)[c.key]}
                onChange={e => {
                  const val = c.key === 'cpf' ? formatCPF(e.target.value) : e.target.value
                  setForm(f => ({ ...f, [c.key]: val }))
                }}
                placeholder={c.placeholder}
                required={c.required}
                className={tplInputClass}
              />
            </FormField>
          ))}

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--tpl-text-secondary)] mb-2">Moradores por faixa etária</p>
            <div className="grid grid-cols-2 gap-2">
              {FAIXAS.map(f => (
                <div key={f.key}>
                  <label className="text-xs text-[var(--tpl-text-muted)] block mb-1">{f.label}</label>
                  <input
                    type="number" min={0} max={99}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))}
                    className={tplInputClass + ' text-center'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={fecharModal}>Cancelar</Button>
            <Button type="submit" fullWidth disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  )
}
