import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Card } from '@/components/template-alternativa/Card'
import { Badge } from '@/components/template-alternativa/Badge'
import { ButtonLink } from '@/components/template-alternativa/Button'
import { formatCPF, formatDateTime, totalMoradores, iniciais } from '@/lib/template-alternativa/format'
import { mockBeneficiarios } from '@/lib/template-alternativa/mock-data'

const badgeTone = { APROVADO: 'success', PENDENTE: 'warning', REJEITADO: 'danger' } as const
const badgeLabel = { APROVADO: 'Aprovado', PENDENTE: 'Pendente', REJEITADO: 'Rejeitado' } as const

export default function TemplateBeneficiarioDetalhePage({ params }: { params: { id: string } }) {
  const beneficiario = mockBeneficiariosMap()[params.id] ?? mockBeneficiarios[0]
  if (!beneficiario) notFound()

  return (
    <AdminShell title={beneficiario.nome} backHref="/template-visual/admin/beneficiarios"
      headerAction={<ButtonLink href={`/template-visual/admin/beneficiarios/${params.id}/editar`} size="md" className="!py-1.5 !px-3 !text-xs">Editar</ButtonLink>}>
      <div className="space-y-4">
        <Card className="p-5 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
            {iniciais(beneficiario.nome)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-tpl-serif font-bold text-xl text-[var(--tpl-text-primary)]">{beneficiario.nome}</h2>
            <p className="text-sm text-[var(--tpl-text-secondary)]">{formatCPF(beneficiario.cpf)}</p>
            <div className="mt-2"><Badge tone={badgeTone[beneficiario.statusCadastro]}>{badgeLabel[beneficiario.statusCadastro]}</Badge></div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="tpl-eyebrow mb-3">Contato e endereço</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-[var(--tpl-text-muted)]">Telefone</dt><dd className="font-medium text-[var(--tpl-text-primary)]">{beneficiario.telefone}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[var(--tpl-text-muted)]">Endereço</dt><dd className="font-medium text-[var(--tpl-text-primary)] text-right">{beneficiario.endereco}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[var(--tpl-text-muted)]">Bairro</dt><dd className="font-medium text-[var(--tpl-text-primary)]">{beneficiario.bairro}</dd></div>
          </dl>
        </Card>

        <Card className="p-5">
          <p className="tpl-eyebrow mb-3">Composição familiar</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><p className="text-lg font-bold text-[var(--tpl-primary)]">{beneficiario.criancas}</p><p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">Crianças</p></div>
            <div><p className="text-lg font-bold text-[var(--tpl-primary)]">{beneficiario.adolescentes}</p><p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">Adolesc.</p></div>
            <div><p className="text-lg font-bold text-[var(--tpl-primary)]">{beneficiario.adultos}</p><p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">Adultos</p></div>
            <div><p className="text-lg font-bold text-[var(--tpl-primary)]">{beneficiario.idosos}</p><p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">Idosos</p></div>
          </div>
          <p className="text-center text-xs text-[var(--tpl-text-muted)] mt-3">{totalMoradores(beneficiario)} pessoas na casa, ao todo</p>
        </Card>

        {beneficiario.statusCadastro === 'REJEITADO' && beneficiario.motivoRejeicao && (
          <div className="rounded-2xl p-5 bg-[var(--tpl-danger-soft)] border border-red-200">
            <p className="text-xs font-semibold text-[var(--tpl-danger)] mb-1">Motivo da rejeição</p>
            <p className="text-sm text-[var(--tpl-text-primary)]">{beneficiario.motivoRejeicao}</p>
          </div>
        )}

        <p className="text-xs text-[var(--tpl-text-muted)]">Cadastrado em {formatDateTime(beneficiario.criadoEm)}</p>
      </div>
    </AdminShell>
  )
}

function mockBeneficiariosMap() {
  return Object.fromEntries(mockBeneficiarios.map((b) => [b.id, b]))
}
