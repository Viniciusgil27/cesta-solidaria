'use client'
// src/app/admin/(protected)/voluntarios/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCPF, formatPhone } from '@/lib/utils'
import type { Voluntario } from '@/types'

export default function VoluntariosPage() {
  const [lista, setLista] = useState<Voluntario[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async (termo = '') => {
    setCarregando(true)
    const res = await fetch(`/api/voluntarios?busca=${encodeURIComponent(termo)}`)
    if (res.ok) setLista(await res.json())
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    carregar(busca)
  }

  async function remover(v: Voluntario) {
    if (!confirm(`Remover ${v.nome} da lista de voluntários? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/voluntarios/${v.id}`, { method: 'DELETE' })
    carregar(busca)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1">Voluntários</p>
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-4">

        {/* Busca */}
        <form onSubmit={buscar} className="flex gap-2">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone…"
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
          {carregando ? 'Carregando…' : `${lista.length} voluntário${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`}
        </p>

        {/* Lista */}
        <div className="space-y-2">
          {lista.map(v => (
            <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'var(--roxo-bg)', color: 'var(--roxo-med)' }}>
                {v.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{v.nome}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                    v.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {v.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{formatCPF(v.cpf)} · {formatPhone(v.telefone)}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Link href={`/admin/voluntarios/${v.id}`}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  Ver
                </Link>
                <button onClick={() => remover(v)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                  Remover
                </button>
              </div>
            </div>
          ))}

          {!carregando && lista.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">🙋</p>
              <p className="text-sm">{busca ? 'Nenhum resultado para a busca.' : 'Nenhum voluntário cadastrado ainda.'}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
