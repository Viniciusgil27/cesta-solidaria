'use client'
// src/app/admin/(protected)/historico/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Entrega } from '@/types'

type EntregaComStats = Entrega & { totalRetiraram: number; totalCadastrados: number }

export default function HistoricoPage() {
  const [entregas, setEntregas] = useState<EntregaComStats[]>([])
  const [carregando, setCarregando] = useState(true)
  const [exportando, setExportando] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/entregas')
      .then(r => r.ok ? r.json() : [])
      .then((data: EntregaComStats[]) => {
        setEntregas(data.filter(e => e.status === 'ENCERRADA'))
        setCarregando(false)
      })
  }, [])

  async function exportarEntrega(entrega: EntregaComStats) {
    setExportando(entrega.id)
    try {
      const XLSX = await import('xlsx')
      const res = await fetch(`/api/beneficiarios?entregaId=${entrega.id}`)
      const beneficiarios = await res.json()

      const dados = beneficiarios.map((b: any) => ({
        'Nome': b.nome,
        'CPF': b.cpf,
        'Telefone': b.telefone || '',
        'Endereço': [b.endereco, b.bairro].filter(Boolean).join(', '),
        'Status': b.jaRetirou ? 'Retirou' : 'Não retirou',
      }))

      const ws = XLSX.utils.json_to_sheet(dados)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Entrega')
      XLSX.writeFile(wb, `entrega_${formatDate(entrega.data).replace(/\//g, '-')}.xlsx`)
    } finally {
      setExportando(null)
    }
  }

  const pct = (e: EntregaComStats) =>
    e.totalCadastrados ? Math.round((e.totalRetiraram / e.totalCadastrados) * 100) : 0

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold">Histórico de entregas</p>
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-3">

        {carregando && (
          <p className="text-center text-slate-400 text-sm pt-12">Carregando…</p>
        )}

        {!carregando && entregas.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">Nenhuma entrega finalizada ainda.</p>
          </div>
        )}

        {entregas.map(e => (
          <div key={e.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--roxo)' }}>
                  📦 Entrega de {formatDate(e.data)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{e.local}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">
                Encerrada
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { n: e.totalCadastrados, l: 'Cadastrados' },
                { n: e.totalRetiraram, l: 'Retiraram', cor: 'text-green-600' },
                { n: e.totalCadastrados - e.totalRetiraram, l: 'Pendentes', cor: 'text-red-500' },
                { n: `${pct(e)}%`, l: 'Atendidos', cor: 'text-purple-600' },
              ].map(s => (
                <div key={s.l} className="text-center rounded-xl py-2" style={{ background: 'var(--roxo-bg)' }}>
                  <p className={`text-base font-bold ${s.cor || ''}`} style={!s.cor ? { color: 'var(--roxo)' } : {}}>
                    {s.n}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => exportarEntrega(e)}
              disabled={exportando === e.id}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
              {exportando === e.id ? 'Gerando…' : '↓ Exportar lista desta entrega'}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
