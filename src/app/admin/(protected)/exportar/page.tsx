'use client'
// src/app/admin/(protected)/exportar/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { formatDate, totalMoradores, formatCPF } from '@/lib/utils'

type OpcaoExport = {
  id: string
  icon: string
  titulo: string
  desc: string
  requerEntregaAtiva?: boolean
}

const OPCOES: OpcaoExport[] = [
  { id: 'todos',          icon: '👥', titulo: 'Todos os cadastros',              desc: 'Nome, CPF, telefone, endereço e moradores' },
  { id: 'retiraram',      icon: '✅', titulo: 'Quem retirou — entrega atual',    desc: 'Famílias atendidas nesta distribuição', requerEntregaAtiva: true },
  { id: 'nao-retiraram',  icon: '❌', titulo: 'Quem não retirou — entrega atual', desc: 'Famílias que ainda não vieram', requerEntregaAtiva: true },
  { id: 'resumo',         icon: '📊', titulo: 'Resumo da entrega atual',          desc: 'Totais, percentual e estatísticas', requerEntregaAtiva: true },
  { id: 'historico',      icon: '📋', titulo: 'Histórico de todas as entregas',   desc: 'Comparativo entre distribuições' },
]

export default function ExportarPage() {
  const [carregando, setCarregando] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  async function exportar(tipo: string) {
    setAviso('')
    setCarregando(tipo)

    try {
      const XLSX = await import('xlsx')
      const hoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      let dados: Record<string, any>[] = []
      let nomeArquivo = ''

      if (tipo === 'todos') {
        const res = await fetch('/api/beneficiarios')
        const lista = await res.json()
        dados = lista.map((b: any) => ({
          'Nome':            b.nome,
          'CPF':             formatCPF(b.cpf),
          'Telefone':        b.telefone || '',
          'Endereço':        b.endereco || '',
          'Bairro':          b.bairro || '',
          'Crianças (0-12)': b.criancas,
          'Adolescentes (13-17)': b.adolescentes,
          'Adultos (18-59)': b.adultos,
          'Idosos (60+)':    b.idosos,
          'Total moradores': totalMoradores(b),
        }))
        nomeArquivo = `cadastros_${hoje}.xlsx`

      } else if (tipo === 'retiraram' || tipo === 'nao-retiraram') {
        const entregasRes = await fetch('/api/entregas')
        const entregas = await entregasRes.json()
        const ativa = entregas.find((e: any) => e.status === 'ATIVA')
        if (!ativa) { setAviso('Nenhuma entrega ativa no momento.'); setCarregando(null); return }

        const res = await fetch(`/api/beneficiarios?entregaId=${ativa.id}`)
        const lista = await res.json()
        const filtrados = lista.filter((b: any) => tipo === 'retiraram' ? b.jaRetirou : !b.jaRetirou)

        dados = filtrados.map((b: any) => ({
          'Nome':     b.nome,
          'CPF':      formatCPF(b.cpf),
          'Telefone': b.telefone || '',
          'Endereço': [b.endereco, b.bairro].filter(Boolean).join(', '),
        }))
        nomeArquivo = tipo === 'retiraram'
          ? `retiraram_${hoje}.xlsx`
          : `nao_retiraram_${hoje}.xlsx`

      } else if (tipo === 'resumo') {
        const res = await fetch('/api/entregas')
        const entregas = await res.json()
        const ativa = entregas.find((e: any) => e.status === 'ATIVA')
        if (!ativa) { setAviso('Nenhuma entrega ativa no momento.'); setCarregando(null); return }

        const pct = ativa.totalCadastrados
          ? Math.round((ativa.totalRetiraram / ativa.totalCadastrados) * 100)
          : 0

        dados = [{
          'Data':                formatDate(ativa.data),
          'Local':               ativa.local,
          'Total cadastrados':   ativa.totalCadastrados,
          'Retiraram':           ativa.totalRetiraram,
          'Não retiraram':       ativa.totalCadastrados - ativa.totalRetiraram,
          '% atendidos':         `${pct}%`,
        }]
        nomeArquivo = `resumo_entrega_${hoje}.xlsx`

      } else if (tipo === 'historico') {
        const res = await fetch('/api/entregas')
        const entregas = await res.json()
        const encerradas = entregas.filter((e: any) => e.status === 'ENCERRADA')
        if (!encerradas.length) { setAviso('Nenhuma entrega no histórico ainda.'); setCarregando(null); return }

        dados = encerradas.map((e: any) => {
          const pct = e.totalCadastrados
            ? Math.round((e.totalRetiraram / e.totalCadastrados) * 100)
            : 0
          return {
            'Data':              formatDate(e.data),
            'Local':             e.local,
            'Cadastrados':       e.totalCadastrados,
            'Retiraram':         e.totalRetiraram,
            'Não retiraram':     e.totalCadastrados - e.totalRetiraram,
            '% atendidos':       `${pct}%`,
          }
        })
        nomeArquivo = `historico_entregas_${hoje}.xlsx`
      }

      if (!dados.length) { setAviso('Nenhum dado para exportar.'); setCarregando(null); return }

      const ws = XLSX.utils.json_to_sheet(dados)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Dados')
      XLSX.writeFile(wb, nomeArquivo)

    } catch {
      setAviso('Erro ao gerar o arquivo. Tente novamente.')
    } finally {
      setCarregando(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/admin" className="text-white text-xl leading-none">‹</Link>
        <p className="text-white text-sm font-semibold">Exportar dados</p>
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-3">

        {aviso && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-700">
            ⚠️ {aviso}
          </div>
        )}

        {OPCOES.map(op => (
          <button key={op.id} onClick={() => exportar(op.id)} disabled={carregando === op.id}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-slate-50 disabled:opacity-60 transition-colors">
            <span className="text-2xl flex-shrink-0">{op.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800">{op.titulo}</p>
              <p className="text-xs text-slate-500 mt-0.5">{op.desc}</p>
              {op.requerEntregaAtiva && (
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--roxo-med)' }}>
                  Requer entrega ativa
                </p>
              )}
            </div>
            <span className="text-slate-400 flex-shrink-0 text-lg">
              {carregando === op.id ? '…' : '↓'}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
