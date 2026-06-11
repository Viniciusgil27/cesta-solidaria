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
  const [imagemAberta, setImagemAberta] = useState<string | null>(null)
  const [rejeitando, setRejeitando] = useState<{ id: string; nome: string } | null>(null)
  const [motivo, setMotivo] = useState('')

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

  async function confirmarRejeicao() {
    if (!rejeitando || !motivo.trim()) return
    setProcessando(rejeitando.id)
    await fetch(`/api/beneficiarios/${rejeitando.id}/rejeitar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivo.trim() }),
    })
    setProcessando(null)
    setRejeitando(null)
    setMotivo('')
    carregar()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1">Cadastros pendentes</p>
        {!carregando && lista.length > 0 && (
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
            <div key={b.id} className="bg-white border-2 border-amber-200 rounded-xl overflow-hidden">

              {/* Comprovante de residência */}
              {b.comprovanteUrl ? (
                <button
                  type="button"
                  onClick={() => setImagemAberta(b.comprovanteUrl ?? null)}
                  className="w-full relative group">
                  <img
                    src={b.comprovanteUrl}
                    alt="Comprovante de residência"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/90 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                      🔍 Ver comprovante
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-full h-14 bg-slate-100 flex items-center justify-center">
                  <p className="text-xs text-slate-400">Sem comprovante enviado</p>
                </div>
              )}

              <div className="p-4 space-y-3">
                {/* Dados */}
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
                      <p className="text-xs text-slate-500 truncate">
                        {b.endereco}{b.bairro ? ` · ${b.bairro}` : ''}
                      </p>
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
                  Solicitado em {new Date(b.criadoEm).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                  })}
                </p>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setRejeitando({ id: b.id, nome: b.nome }); setMotivo('') }}
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
            </div>
          ))}
        </div>
      </div>

      {/* Modal de visualização do comprovante */}
      {imagemAberta && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImagemAberta(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setImagemAberta(null)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold leading-none">
              ✕
            </button>
            <img
              src={imagemAberta}
              alt="Comprovante de residência"
              className="w-full rounded-xl max-h-[80vh] object-contain"
            />
            <a
              href={imagemAberta}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-sm text-white/70 underline">
              Abrir em nova aba
            </a>
          </div>
        </div>
      )}

      {/* Modal de motivo da rejeição */}
      {rejeitando && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setRejeitando(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <p className="font-bold text-slate-800 mb-1">Rejeitar cadastro</p>
            <p className="text-sm text-slate-500 mb-4">
              Informe o motivo da rejeição de <strong>{rejeitando.nome}</strong>. Esse motivo será exibido para a pessoa na consulta de cadastro.
            </p>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              rows={3}
              autoFocus
              placeholder="Ex: Comprovante de residência ilegível."
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-300 transition-colors resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRejeitando(null)}
                className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold text-sm border-2 border-slate-200 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={confirmarRejeicao}
                disabled={!motivo.trim() || processando === rejeitando.id}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm bg-red-600 hover:opacity-90 transition-opacity disabled:opacity-50">
                {processando === rejeitando.id ? 'Enviando…' : 'Confirmar rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
