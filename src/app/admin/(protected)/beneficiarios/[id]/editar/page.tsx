'use client'
// src/app/admin/(protected)/beneficiarios/[id]/editar/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF, formatPhone } from '@/lib/utils'

function Counter({ label, sub, value, onChange }: {
  label: string; sub: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="rounded-xl p-3 text-center bg-white border border-slate-200">
      <p className="text-xs font-semibold text-slate-700 leading-tight mb-0.5">{label}</p>
      <p className="text-xs text-slate-400 mb-2">{sub}</p>
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-medium hover:bg-purple-50 transition-colors"
          style={{ color: 'var(--roxo-med)' }}>−</button>
        <span className="text-base font-bold w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-medium hover:bg-purple-50 transition-colors"
          style={{ color: 'var(--roxo-med)' }}>+</button>
      </div>
    </div>
  )
}

export default function EditarBeneficiarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', bairro: '',
    criancas: 0, adolescentes: 0, adultos: 0, idosos: 0,
  })

  useEffect(() => {
    fetch(`/api/beneficiarios/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setForm({
            nome: data.nome,
            cpf: formatCPF(data.cpf),
            telefone: data.telefone ? formatPhone(data.telefone) : '',
            endereco: data.endereco || '',
            bairro: data.bairro || '',
            criancas: data.criancas,
            adolescentes: data.adolescentes,
            adultos: data.adultos,
            idosos: data.idosos,
          })
        }
        setCarregando(false)
      })
  }, [id])

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.cpf.replace(/\D/g, '').length < 11) { setErro('CPF inválido.'); return }
    setLoading(true)
    const res = await fetch(`/api/beneficiarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cpf: form.cpf.replace(/\D/g, '') }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErro(d.error || 'Erro ao salvar.'); return }
    router.push(`/admin/beneficiarios/${id}`)
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
          <Link href={`/admin/beneficiarios/${id}`} className="text-white text-xl leading-none">‹</Link>
          <p className="text-white text-sm font-semibold">Editar família</p>
        </header>
        <div className="flex items-center justify-center pt-20 text-slate-400 text-sm">Carregando…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href={`/admin/beneficiarios/${id}`} className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1 truncate">Editar — {form.nome}</p>
      </header>

      <form onSubmit={salvar} className="p-5 max-w-md mx-auto space-y-5">

        {erro && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{erro}</div>}

        {/* Dados pessoais */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-200">Dados pessoais</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Nome completo *</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400"
                placeholder="Nome da família" value={form.nome} onChange={e => set('nome', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">CPF *</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400"
                placeholder="000.000.000-00" inputMode="numeric" value={form.cpf} maxLength={14}
                onChange={e => set('cpf', formatCPF(e.target.value))} required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Telefone</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400"
                placeholder="(19) 9 0000-0000" type="tel" value={form.telefone}
                onChange={e => set('telefone', formatPhone(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-200">Endereço</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Rua e número</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400"
                placeholder="Rua, número" value={form.endereco} onChange={e => set('endereco', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Bairro</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400"
                placeholder="Bairro" value={form.bairro} onChange={e => set('bairro', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Moradores */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-200">Pessoas na casa</p>
          <div className="grid grid-cols-2 gap-2.5">
            <Counter label="Crianças" sub="0 a 12 anos" value={form.criancas} onChange={v => set('criancas', v)} />
            <Counter label="Adolescentes" sub="13 a 17 anos" value={form.adolescentes} onChange={v => set('adolescentes', v)} />
            <Counter label="Adultos" sub="18 a 59 anos" value={form.adultos} onChange={v => set('adultos', v)} />
            <Counter label="Idosos" sub="60 anos ou mais" value={form.idosos} onChange={v => set('idosos', v)} />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/admin/beneficiarios/${id}`}
            className="flex-1 py-3 rounded-xl text-slate-600 font-semibold text-sm border border-slate-200 text-center">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
            style={{ background: 'var(--roxo)' }}>
            {loading ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </main>
  )
}
