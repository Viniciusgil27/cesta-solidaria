'use client'
// src/app/admin/(protected)/voluntarios/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF, formatPhone, formatDateTime } from '@/lib/utils'
import type { Voluntario } from '@/types'

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
      <main className="min-h-screen bg-slate-50">
        <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
          <Link href="/admin/voluntarios" className="text-white text-xl leading-none">‹</Link>
          <p className="text-white text-sm font-semibold">Voluntário</p>
        </header>
        <div className="flex items-center justify-center pt-20 text-slate-400 text-sm">Carregando…</div>
      </main>
    )
  }

  if (!v) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
          <Link href="/admin/voluntarios" className="text-white text-xl leading-none">‹</Link>
          <p className="text-white text-sm font-semibold">Voluntário</p>
        </header>
        <div className="text-center pt-20 text-slate-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Voluntário não encontrado.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin/voluntarios" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1 truncate">{v.nome}</p>
        {!editando && (
          <button onClick={abrirEdicao}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            Editar
          </button>
        )}
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-4">

        {editando ? (
          <form onSubmit={salvar} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            {erro && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{erro}</div>}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Nome completo</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">CPF</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
                value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Telefone</label>
              <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                placeholder="(19) 9 0000-0000" type="tel"
                value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: formatPhone(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Observações</label>
              <textarea className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400 resize-none"
                rows={3} placeholder="Disponibilidade, função, observações da equipe…"
                value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setEditando(false); setErro('') }}
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
        ) : (
          <>
            {/* Avatar + nome */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                style={{ background: 'var(--roxo-bg)', color: 'var(--roxo-med)' }}>
                {v.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{v.nome}</p>
                <p className="text-sm text-slate-500 mt-0.5">{formatCPF(v.cpf)}</p>
                <p className="text-xs text-slate-400 mt-1">Cadastrado em {formatDateTime(v.criadoEm)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  v.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {v.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <button onClick={alternarStatus} disabled={alterandoStatus}
                className="text-xs px-3 py-2 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60">
                {alterandoStatus ? 'Salvando…' : v.status === 'ATIVO' ? 'Marcar como inativo' : 'Marcar como ativo'}
              </button>
            </div>

            {/* Contato */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contato</p>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-base w-5 text-center">📱</span>
                <p className="text-sm text-slate-700">{formatPhone(v.telefone)}</p>
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Observações</p>
              {v.observacoes ? (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{v.observacoes}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">Nenhuma observação registrada.</p>
              )}
            </div>

            {/* Ações */}
            <button onClick={remover} disabled={removendo}
              className="w-full py-3 rounded-xl font-semibold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60">
              {removendo ? 'Removendo…' : 'Remover voluntário'}
            </button>
          </>
        )}

      </div>
    </main>
  )
}
