'use client'
// src/app/admin/(protected)/historico/page.tsx
import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import type { Entrega } from '@/types'
import { AdminShell } from '@/components/ui/AdminShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

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
    <AdminShell title="Histórico de entregas" backHref="/admin">
      <div className="space-y-3">
        {carregando && <LoadingState />}

        {!carregando && entregas.length === 0 && (
          <EmptyState icon="📋" title="Nenhuma entrega finalizada ainda" />
        )}

        {entregas.map(e => (
          <Card key={e.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-tpl-legible font-bold text-sm text-[var(--tpl-primary)]">
                  📦 Entrega de {formatDate(e.data)}
                </p>
                <p className="text-xs text-[var(--tpl-text-secondary)] mt-0.5">{e.local}</p>
              </div>
              <Badge tone="neutral">Encerrada</Badge>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { n: e.totalCadastrados, l: 'Cadastrados', cor: 'text-[var(--tpl-text-primary)]' },
                { n: e.totalRetiraram, l: 'Retiraram', cor: 'text-[var(--tpl-success)]' },
                { n: e.totalCadastrados - e.totalRetiraram, l: 'Pendentes', cor: 'text-[var(--tpl-danger)]' },
                { n: `${pct(e)}%`, l: 'Atendidos', cor: 'text-[var(--tpl-primary)]' },
              ].map(s => (
                <div key={s.l} className="text-center rounded-xl py-2 bg-[var(--tpl-surface-muted)]">
                  <p className={`text-base font-bold font-tpl-legible ${s.cor}`}>{s.n}</p>
                  <p className="text-xs text-[var(--tpl-text-muted)] mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => exportarEntrega(e)}
              disabled={exportando === e.id}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[var(--tpl-border)] text-[var(--tpl-text-secondary)] hover:bg-[var(--tpl-surface-muted)] disabled:opacity-50 transition-colors">
              {exportando === e.id ? 'Gerando…' : '↓ Exportar lista desta entrega'}
            </button>
          </Card>
        ))}
      </div>
    </AdminShell>
  )
}
