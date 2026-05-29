'use client'
// src/app/admin/(protected)/entrega/page.tsx
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatCPF, totalMoradores } from '@/lib/utils'
import type { Beneficiario } from '@/types'

type Status = 'idle' | 'pode_retirar' | 'ja_retirou' | 'nao_cadastrado'
type Confirmado = { nome: string; cpf: string }

export default function EntregaPage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [pessoa, setPessoa] = useState<Beneficiario | null>(null)
  const [confirmados, setConfirmados] = useState<Confirmado[]>([])
  const [entregaId, setEntregaId] = useState<string | null>(null)
  const [encerrandoId, setEncerrandoId] = useState<string | null>(null)
  const [modalEncerrar, setModalEncerrar] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/entregas').then(r => r.json()).then(data => {
      const ativa = data.find((e: any) => e.status === 'ATIVA')
      if (ativa) setEntregaId(ativa.id)
    })
    inputRef.current?.focus()
  }, [])

  async function buscar() {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length < 11) return
    setLoading(true)
    setStatus('idle')
    const res = await fetch(`/api/beneficiarios/cpf/${cpfLimpo}?entregaId=${entregaId}`)
    const data = await res.json()
    setLoading(false)
    setStatus(data.status)
    setPessoa(data.beneficiario || null)
  }

  async function confirmar() {
    if (!pessoa || !entregaId) return
    setLoading(true)
    const res = await fetch(`/api/entregas/${entregaId}/retirada`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beneficiarioId: pessoa.id }),
    })
    setLoading(false)
    if (res.ok) {
      setConfirmados(prev => [{ nome: pessoa.nome, cpf: pessoa.cpf }, ...prev])
      setStatus('idle')
      setCpf('')
      setPessoa(null)
      inputRef.current?.focus()
    }
  }

  async function encerrar() {
    if (!entregaId) return
    setEncerrandoId(entregaId)
    await fetch(`/api/entregas/${entregaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'encerrar' }),
    })
    setEncerrandoId(null)
    setModalEncerrar(false)
    window.location.href = '/admin'
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <div className="flex-1">
          <p className="text-white text-sm font-semibold">Entrega de cestas</p>
          <p className="text-purple-300 text-xs">Digite o CPF do beneficiário</p>
        </div>
        <button onClick={() => setModalEncerrar(true)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: 'rgba(255,220,100,0.2)', color: '#FFE066', border: '1px solid rgba(255,220,100,0.3)' }}>
          Encerrar
        </button>
      </header>

      <div className="flex-1 p-5 max-w-md mx-auto w-full space-y-4">

        {/* Busca CPF */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">CPF do beneficiário</p>
          <div className="flex gap-2.5">
            <input ref={inputRef} value={cpf}
              onChange={e => { setCpf(formatCPF(e.target.value)); setStatus('idle') }}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              type="text" inputMode="numeric" placeholder="000.000.000-00" maxLength={14}
              className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-purple-400 bg-white tracking-wider" />
            <button onClick={buscar} disabled={loading || cpf.replace(/\D/g,'').length < 11}
              className="px-5 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-opacity"
              style={{ background: 'var(--roxo)' }}>
              {loading ? '…' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {status !== 'idle' && (
          <div className={`rounded-2xl p-4 border-2 ${
            status === 'pode_retirar' ? 'bg-green-50 border-green-300' :
            status === 'ja_retirou' ? 'bg-amber-50 border-amber-300' :
            'bg-red-50 border-red-300'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
              status === 'pode_retirar' ? 'text-green-600' :
              status === 'ja_retirou' ? 'text-amber-600' : 'text-red-600'}`}>
              {status === 'pode_retirar' ? '✓ Pode retirar' :
               status === 'ja_retirou' ? '⚠ Já retirou' : '✕ Não cadastrado'}
            </p>
            <p className={`text-xl font-bold mb-1 ${
              status === 'pode_retirar' ? 'text-green-800' :
              status === 'ja_retirou' ? 'text-amber-800' : 'text-red-800'}`}>
              {pessoa?.nome || 'CPF não encontrado'}
            </p>
            <p className="text-sm text-slate-500 mb-2">
              {status === 'pode_retirar' ? 'Família cadastrada e apta a receber a cesta.' :
               status === 'ja_retirou' ? 'Esta família já retirou a cesta nesta entrega.' :
               'Este CPF não está na lista. Verifique o número ou cadastre a família.'}
            </p>
            {pessoa && (
              <p className="text-xs text-slate-400 bg-white/60 rounded-lg px-3 py-2 mb-3">
                {totalMoradores(pessoa)} pessoa{totalMoradores(pessoa) !== 1 ? 's' : ''} na casa ·{' '}
                {pessoa.criancas} criança{pessoa.criancas !== 1 ? 's' : ''} ·{' '}
                {pessoa.adolescentes} adolescente{pessoa.adolescentes !== 1 ? 's' : ''} ·{' '}
                {pessoa.adultos} adulto{pessoa.adultos !== 1 ? 's' : ''} ·{' '}
                {pessoa.idosos} idoso{pessoa.idosos !== 1 ? 's' : ''}
              </p>
            )}
            {status === 'pode_retirar' && (
              <button onClick={confirmar} disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60"
                style={{ background: '#1A7A4A' }}>
                {loading ? 'Confirmando…' : '✓ Confirmar retirada'}
              </button>
            )}
          </div>
        )}

        {/* Confirmados */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Confirmadas nesta sessão ({confirmados.length})
          </p>
          {confirmados.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma confirmação ainda.</p>
          ) : (
            <div className="space-y-2">
              {confirmados.map((c, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{c.nome}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.cpf}</p>
                  </div>
                  <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">Retirou</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal encerrar */}
      {modalEncerrar && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">Encerrar entrega</h3>
              <button onClick={() => setModalEncerrar(false)} className="text-slate-400 text-xl">✕</button>
            </div>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Encerrar salva os resultados no histórico. Você poderá visualizar os dados depois.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalEncerrar(false)}
                className="flex-1 py-3 rounded-xl text-slate-600 font-semibold text-sm border border-slate-200">
                Cancelar
              </button>
              <button onClick={encerrar} disabled={!!encerrandoId}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: 'var(--roxo)' }}>
                {encerrandoId ? 'Encerrando…' : 'Encerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
