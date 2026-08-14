'use client'
// src/app/admin/(protected)/beneficiarios/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCPF, formatPhone, formatDateTime, totalMoradores, iniciais } from '@/lib/utils'
import type { Beneficiario } from '@/types'
import { AdminShell } from '@/components/ui/AdminShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'

const FAIXAS = [
  { key: 'criancas',     label: 'Crianças',      sub: '0 a 12 anos' },
  { key: 'adolescentes', label: 'Adolescentes',   sub: '13 a 17 anos' },
  { key: 'adultos',      label: 'Adultos',         sub: '18 a 59 anos' },
  { key: 'idosos',       label: 'Idosos',          sub: '60 anos ou mais' },
]

const badgeTone = { APROVADO: 'success', PENDENTE: 'warning', REJEITADO: 'danger' } as const
const badgeLabel = { APROVADO: 'Aprovado', PENDENTE: 'Pendente', REJEITADO: 'Rejeitado' } as const

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
      <AdminShell title="Família" backHref="/admin/beneficiarios">
        <LoadingState />
      </AdminShell>
    )
  }

  if (!b) {
    return (
      <AdminShell title="Família" backHref="/admin/beneficiarios">
        <EmptyState icon="🔍" title="Beneficiário não encontrado" />
      </AdminShell>
    )
  }

  const total = totalMoradores(b)

  return (
    <AdminShell title={b.nome} backHref="/admin/beneficiarios"
      headerAction={<ButtonLink href={`/admin/beneficiarios/${id}/editar`} size="md" className="!py-1.5 !px-3 !text-xs">Editar</ButtonLink>}>
      <div className="space-y-4">
        <Card className="p-5 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
            {iniciais(b.nome)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-tpl-serif font-bold text-xl text-[var(--tpl-text-primary)]">{b.nome}</h2>
            <p className="text-sm text-[var(--tpl-text-secondary)] font-tpl-legible">{formatCPF(b.cpf)}</p>
            <div className="mt-2"><Badge tone={badgeTone[b.statusCadastro]}>{badgeLabel[b.statusCadastro]}</Badge></div>
          </div>
        </Card>

        {/* Detalhes do status */}
        <Card className="p-5">
          <p className="tpl-eyebrow mb-2">Status do cadastro</p>
          {b.statusCadastro === 'APROVADO' && b.aprovadoEm && (
            <p className="text-sm text-[var(--tpl-text-secondary)]">Aprovado em <span className="font-tpl-legible">{formatDateTime(b.aprovadoEm)}</span></p>
          )}
          {b.statusCadastro === 'PENDENTE' && (
            <p className="text-sm text-[var(--tpl-text-secondary)]">Aguardando análise da equipe.</p>
          )}
          {b.statusCadastro === 'REJEITADO' && (
            <>
              {b.rejeitadoEm && (
                <p className="text-sm text-[var(--tpl-text-secondary)] mb-2">Rejeitado em <span className="font-tpl-legible">{formatDateTime(b.rejeitadoEm)}</span></p>
              )}
              {b.motivoRejeicao && (
                <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-[var(--tpl-danger)] mb-0.5">Motivo</p>
                  <p className="text-sm text-[var(--tpl-text-primary)]">{b.motivoRejeicao}</p>
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="p-5">
          <p className="tpl-eyebrow mb-3">Contato e endereço</p>
          {b.telefone ? (
            <p className="text-sm text-[var(--tpl-text-primary)] mb-2 font-tpl-legible">📱 {formatPhone(b.telefone)}</p>
          ) : (
            <p className="text-sm text-[var(--tpl-text-muted)] italic mb-2">Telefone não informado</p>
          )}
          {(b.endereco || b.bairro) ? (
            <p className="text-sm text-[var(--tpl-text-primary)]">📍 {[b.endereco, b.bairro].filter(Boolean).join(' · ')}</p>
          ) : (
            <p className="text-sm text-[var(--tpl-text-muted)] italic">Endereço não informado</p>
          )}
        </Card>

        <Card className="p-5">
          <p className="tpl-eyebrow mb-3">Composição familiar</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {FAIXAS.map(f => (
              <div key={f.key}>
                <p className="text-lg font-bold font-tpl-legible text-[var(--tpl-primary)]">{(b as any)[f.key]}</p>
                <p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">{f.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[var(--tpl-text-muted)] mt-3">{total} pessoas na casa, ao todo</p>
        </Card>

        <div className="flex gap-3">
          <ButtonLink href={`/admin/beneficiarios/${id}/editar`} fullWidth>Editar dados</ButtonLink>
          <Button variant="outlineDanger" fullWidth disabled={removendo} onClick={remover}>
            {removendo ? 'Removendo…' : 'Remover família'}
          </Button>
        </div>
      </div>
    </AdminShell>
  )
}
