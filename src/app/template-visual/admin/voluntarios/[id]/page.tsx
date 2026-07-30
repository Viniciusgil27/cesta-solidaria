import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Card } from '@/components/template-alternativa/Card'
import { Badge } from '@/components/template-alternativa/Badge'
import { formatCPF, formatDateTime, iniciais } from '@/lib/template-alternativa/format'
import { mockVoluntarios } from '@/lib/template-alternativa/mock-data'

export default function TemplateVoluntarioDetalhePage({ params }: { params: { id: string } }) {
  const voluntario = mockVoluntarios.find((v) => v.id === params.id) ?? mockVoluntarios[0]

  return (
    <AdminShell title={voluntario.nome} backHref="/template-visual/admin/voluntarios">
      <div className="space-y-4">
        <Card className="p-5 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
            {iniciais(voluntario.nome)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-tpl-serif font-bold text-xl text-[var(--tpl-text-primary)]">{voluntario.nome}</h2>
            <p className="text-sm text-[var(--tpl-text-secondary)]">{formatCPF(voluntario.cpf)}</p>
            <div className="mt-2"><Badge tone={voluntario.status === 'ATIVO' ? 'success' : 'neutral'}>{voluntario.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</Badge></div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="tpl-eyebrow mb-3">Contato</p>
          <p className="text-sm text-[var(--tpl-text-primary)] font-medium">{voluntario.telefone}</p>
        </Card>

        {voluntario.observacoes && (
          <Card className="p-5">
            <p className="tpl-eyebrow mb-2">Observações</p>
            <p className="text-sm text-[var(--tpl-text-primary)]">{voluntario.observacoes}</p>
          </Card>
        )}

        <p className="text-xs text-[var(--tpl-text-muted)]">Cadastrado em {formatDateTime(voluntario.criadoEm)}</p>
      </div>
    </AdminShell>
  )
}
