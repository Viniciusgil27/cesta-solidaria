'use client'
// src/app/consulta/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { formatCPF, formatDateTime } from '@/lib/utils'

type Resultado =
  | { status: 'nao_encontrado' }
  | { status: 'pendente' }
  | { status: 'aprovado'; nome: string; cpfMascarado: string; aprovadoEm?: string }
  | { status: 'rejeitado'; cpfMascarado: string; motivoRejeicao?: string; rejeitadoEm?: string }

export default function ConsultaPage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)

  async function consultar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setResultado(null)

    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) { setErro('Informe um CPF válido.'); return }

    setLoading(true)
    try {
      const res = await fetch(`/api/consulta/${cpfLimpo}`)
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao consultar. Tente novamente.'); return }
      setResultado(data)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/" className="text-white text-xl leading-none">‹</Link>
        <span className="text-white text-sm font-semibold">Consultar cadastro</span>
      </header>

      <div className="p-5 max-w-md mx-auto">
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          Digite o CPF utilizado no cadastro para ver a situação atual.
        </p>

        <form onSubmit={consultar} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">CPF</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
              value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{erro}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
            style={{ background: 'var(--roxo)' }}>
            {loading ? 'Consultando…' : 'Consultar'}
          </button>
        </form>

        {resultado && (
          <div className="mt-5">
            {resultado.status === 'nao_encontrado' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="font-semibold text-slate-800 mb-1">Cadastro não encontrado</p>
                <p className="text-sm text-slate-500 mb-4">Não encontramos nenhum cadastro para este CPF.</p>
                <Link href="/cadastro"
                  className="inline-block w-full py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'var(--roxo)' }}>
                  Fazer cadastro
                </Link>
              </div>
            )}

            {resultado.status === 'pendente' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-2">⏳</p>
                <p className="font-semibold text-amber-800 mb-1">Cadastro em análise</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Seu cadastro foi recebido e está em análise pela equipe responsável.
                </p>
              </div>
            )}

            {resultado.status === 'aprovado' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-2">✅</p>
                <p className="font-semibold text-green-800 mb-1">Cadastro aprovado</p>
                <p className="text-sm text-green-700 mb-3">Seu cadastro foi aprovado.</p>
                <div className="bg-white rounded-xl p-3.5 text-left text-sm space-y-1.5">
                  <p><span className="text-slate-400">Nome: </span><span className="font-semibold text-slate-700">{resultado.nome}</span></p>
                  <p><span className="text-slate-400">CPF: </span><span className="font-semibold text-slate-700">{resultado.cpfMascarado}</span></p>
                  {resultado.aprovadoEm && (
                    <p><span className="text-slate-400">Aprovado em: </span><span className="font-semibold text-slate-700">{formatDateTime(resultado.aprovadoEm)}</span></p>
                  )}
                </div>
              </div>
            )}

            {resultado.status === 'rejeitado' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-2">❌</p>
                <p className="font-semibold text-red-800 mb-1">Cadastro não aprovado</p>
                <p className="text-sm text-red-700 mb-3">Seu cadastro não foi aprovado.</p>
                {resultado.motivoRejeicao && (
                  <div className="bg-white rounded-xl p-3.5 text-left">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Motivo</p>
                    <p className="text-sm text-slate-700">{resultado.motivoRejeicao}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
