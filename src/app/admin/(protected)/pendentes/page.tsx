'use client'
// src/app/admin/(protected)/pendentes/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCPF, totalMoradores } from '@/lib/utils'
import type { Beneficiario } from '@/types'

export default function PendentesPage() {
  const [lista, setLista] = useState<Beneficiario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const res = await fetch('/api/beneficiarios/pendentes')
    if (res.ok) setLista(await res.json())
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function aprovar(id: string) {
    setProcessando(id)
    await fetch(`/api/beneficiarios/${id}/aprovar`, { method: 'PUT' })
    setProcessando(null)
    carregar()
  }

  async function rejeitar(id: string, nome: string) {
    if (!confirm(`Rejeitar o cadastro de ${nome}? Esta ação pode ser revertida editando o beneficiário.`)) return
    setProcessando(id)
    await fetch(`/api/beneficiarios/${id}/rejeitar`, { method: 'PUT' })
    setProcessando(null)
    carregar()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1">Cadastros pendentes</p>
        {!carregando && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-400 text-amber-900">
            {lista.length}
          </span>
        )}
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-4">
        <p className="text-xs text-slate-400">
          Cadastros realizados pelo site que aguardam confirmação do administrador.
        </p>

        {carregando && (
          <p className="text-sm text-slate-400 text-center py-8">Carregando…</p>
        )}

        {!carregando && lista.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm">Nenhum cadastro pendente de aprovação.</p>
          </div>
        )}

        <div className="space-y-3">
          {lista.map(b => (
            <div key={b.id} className="bg-white border-2 border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: 'var(--roxo-bg)', color: 'var(--roxo-med)' }}>
                  {b.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{b.nome}</p>
                  <p className="text-xs text-slate-500">{formatCPF(b.cpf)}</p>
                  {b.telefone && <p className="text-xs text-slate-500">{b.telefone}</p>}
                  {b.endereco && (
                    <p className="text-xs text-slate-500 truncate">{b.endereco}{b.bairro ? ` · ${b.bairro}` : ''}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalMoradores(b)} morador{totalMoradores(b) !== 1 ? 'es' : ''}
                    {b.criancas > 0 && ` · ${b.criancas} criança${b.criancas > 1 ? 's' : ''}`}
                    {b.adolescentes > 0 && ` · ${b.adolescentes} adolescente${b.adolescentes > 1 ? 's' : ''}`}
                    {b.idosos > 0 && ` · ${b.idosos} idoso${b.idosos > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              <p className="text-xs text-amber-600 font-medium">
                Solicitado em {new Date(b.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => rejeitar(b.id, b.nome)}
                  disabled={processando === b.id}
                  className="flex-1 py-2.5 rounded-xl text-red-600 font-semibold text-sm border-2 border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50">
                  Rejeitar
                </button>
                <button
                  onClick={() => aprovar(b.id)}
                  disabled={processando === b.id}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--roxo)' }}>
                  {processando === b.id ? 'Processando…' : 'Aprovar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
