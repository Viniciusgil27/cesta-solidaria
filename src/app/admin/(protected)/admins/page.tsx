'use client'
// src/app/admin/(protected)/admins/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

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
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1">Gerenciar admins</p>
        {isSuperAdmin && (
          <button onClick={() => setModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            + Novo
          </button>
        )}
      </header>

      <div className="p-5 max-w-md mx-auto">
        {!isSuperAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
            Somente o super admin pode gerenciar outros admins.
          </div>
        )}

        <div className="space-y-2.5">
          {admins.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'var(--roxo-bg)', color: 'var(--roxo-med)' }}>
                {a.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{a.nome}</p>
                  {a.superAdmin && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Super</span>
                  )}
                  {!a.ativo && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0">Inativo</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{a.email}</p>
              </div>
              {isSuperAdmin && !a.superAdmin && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleAtivo(a.id, a.ativo)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    {a.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => remover(a.id, a.nome)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                    Remover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal novo admin */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Novo administrador</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 text-xl">✕</button>
            </div>

            {erro && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-700">{erro}</div>}

            <form onSubmit={criar} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Nome</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400"
                  placeholder="Nome completo" required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400"
                  placeholder="email@altvida.org" required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Senha inicial</label>
                <input type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400"
                  placeholder="Mínimo 8 caracteres" required minLength={8} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm mt-2 disabled:opacity-60"
                style={{ background: 'var(--roxo)' }}>
                {loading ? 'Criando…' : 'Criar administrador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
