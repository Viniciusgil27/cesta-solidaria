'use client'
// src/app/admin/(protected)/beneficiarios/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF, formatPhone, totalMoradores } from '@/lib/utils'
import type { Beneficiario } from '@/types'

const FAIXAS = [
  { key: 'criancas',     label: 'Crianças',      sub: '0 a 12 anos' },
  { key: 'adolescentes', label: 'Adolescentes',   sub: '13 a 17 anos' },
  { key: 'adultos',      label: 'Adultos',         sub: '18 a 59 anos' },
  { key: 'idosos',       label: 'Idosos',          sub: '60 anos ou mais' },
]

export default function VerFamiliaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [b, setB] = useState<Beneficiario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [removendo, setRemovendo] = useState(false)

  useEffect(() => {
    fetch(`/api/beneficiarios/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setB(data); setCarregando(false) })
  }, [id])

  async function remover() {
    if (!b || !confirm(`Remover ${b.nome}? O registro ficará inativo mas o histórico é mantido.`)) return
    setRemovendo(true)
    await fetch(`/api/beneficiarios/${id}`, { method: 'DELETE' })
    router.push('/admin/beneficiarios')
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
          <Link href="/admin/beneficiarios" className="text-white text-xl leading-none">‹</Link>
          <p className="text-white text-sm font-semibold">Família</p>
        </header>
        <div className="flex items-center justify-center pt-20 text-slate-400 text-sm">Carregando…</div>
      </main>
    )
  }

  if (!b) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
          <Link href="/admin/beneficiarios" className="text-white text-xl leading-none">‹</Link>
          <p className="text-white text-sm font-semibold">Família</p>
        </header>
        <div className="text-center pt-20 text-slate-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Beneficiário não encontrado.</p>
        </div>
      </main>
    )
  }

  const total = totalMoradores(b)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin/beneficiarios" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold flex-1 truncate">{b.nome}</p>
        <Link href={`/admin/beneficiarios/${id}/editar`}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
          Editar
        </Link>
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-4">

        {/* Avatar + nome */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0"
            style={{ background: 'var(--roxo-bg)', color: 'var(--roxo-med)' }}>
            {b.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{b.nome}</p>
            <p className="text-sm text-slate-500 mt-0.5">{formatCPF(b.cpf)}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--roxo-med)' }}>
              {total} morador{total !== 1 ? 'es' : ''} na casa
            </p>
          </div>
        </div>

        {/* Contato e endereço */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contato e endereço</p>
          {b.telefone ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-base w-5 text-center">📱</span>
              <p className="text-sm text-slate-700">{formatPhone(b.telefone)}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Telefone não informado</p>
          )}
          {(b.endereco || b.bairro) ? (
            <div className="flex items-start gap-3">
              <span className="text-slate-400 text-base w-5 text-center mt-0.5">📍</span>
              <div>
                {b.endereco && <p className="text-sm text-slate-700">{b.endereco}</p>}
                {b.bairro && <p className="text-sm text-slate-500">{b.bairro}</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Endereço não informado</p>
          )}
        </div>

        {/* Moradores */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Moradores por faixa etária</p>
          <div className="grid grid-cols-2 gap-2.5">
            {FAIXAS.map(f => (
              <div key={f.key} className="rounded-xl p-3 text-center" style={{ background: 'var(--roxo-bg)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--roxo)' }}>
                  {(b as any)[f.key]}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{f.label}</p>
                <p className="text-xs text-slate-400">{f.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs text-slate-500">Total de moradores</p>
            <p className="font-bold text-sm" style={{ color: 'var(--roxo)' }}>{total}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <Link href={`/admin/beneficiarios/${id}/editar`}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm text-center"
            style={{ background: 'var(--roxo)' }}>
            Editar dados
          </Link>
          <button onClick={remover} disabled={removendo}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60">
            {removendo ? 'Removendo…' : 'Remover família'}
          </button>
        </div>

      </div>
    </main>
  )
}
