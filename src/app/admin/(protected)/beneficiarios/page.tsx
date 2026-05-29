'use client'
// src/app/admin/(protected)/beneficiarios/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCPF, totalMoradores } from '@/lib/utils'
import type { Beneficiario } from '@/types'

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
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1">Beneficiários cadastrados</p>
        <Link href="/admin/beneficiarios/novo"
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
          + Novo
        </Link>
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-4">

        {/* Busca */}
        <form onSubmit={buscar} className="flex gap-2">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF…"
            className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400 bg-white"
          />
          <button type="submit"
            className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: 'var(--roxo)' }}>
            Buscar
          </button>
        </form>

        {/* Contagem */}
        <p className="text-xs text-slate-400 font-medium">
          {carregando ? 'Carregando…' : `${lista.length} beneficiário${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`}
        </p>

        {/* Lista */}
        <div className="space-y-2">
          {lista.map(b => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'var(--roxo-bg)', color: 'var(--roxo-med)' }}>
                {b.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{b.nome}</p>
                <p className="text-xs text-slate-400">{formatCPF(b.cpf)} · {totalMoradores(b)} morador{totalMoradores(b) !== 1 ? 'es' : ''}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Link href={`/admin/beneficiarios/${b.id}`}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  Ver
                </Link>
                <button onClick={() => abrirEdicao(b)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  Editar
                </button>
                <button onClick={() => remover(b)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                  Remover
                </button>
              </div>
            </div>
          ))}

          {!carregando && lista.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm">{busca ? 'Nenhum resultado para a busca.' : 'Nenhum beneficiário cadastrado ainda.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && fecharModal()}>
          <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-3 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Editar beneficiário</h3>
              <button onClick={fecharModal} className="text-slate-400 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={salvar} className="px-6 pb-6 pt-4 space-y-3">
              {erro && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{erro}</div>}

              {CAMPOS_FORM.map(c => (
                <div key={c.key}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">{c.label}</label>
                  <input
                    type={c.type}
                    value={(form as any)[c.key]}
                    onChange={e => {
                      const val = c.key === 'cpf' ? formatCPF(e.target.value) : e.target.value
                      setForm(f => ({ ...f, [c.key]: val }))
                    }}
                    placeholder={c.placeholder}
                    required={c.required}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                  />
                </div>
              ))}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Moradores por faixa etária</p>
                <div className="grid grid-cols-2 gap-2">
                  {FAIXAS.map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-slate-500 block mb-1">{f.label}</label>
                      <input
                        type="number" min={0} max={99}
                        value={(form as any)[f.key]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))}
                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400 text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal}
                  className="flex-1 py-3 rounded-xl text-slate-600 font-semibold text-sm border border-slate-200">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                  style={{ background: 'var(--roxo)' }}>
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
