import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { DataList, DataRow } from '@/components/template-alternativa/DataTable'
import { EmptyState } from '@/components/template-alternativa/EmptyState'
import { formatDateTime } from '@/lib/template-alternativa/format'
import { mockHistoricoEntregas } from '@/lib/template-alternativa/mock-data'

export default function TemplateHistoricoPage() {
  return (
    <AdminShell title="Histórico de entregas" backHref="/template-visual/admin">
      <div className="space-y-4">
        <p className="text-xs text-[var(--tpl-text-muted)]">Entregas já encerradas, com o total de famílias atendidas em cada uma.</p>

        {mockHistoricoEntregas.length === 0 ? (
          <EmptyState icon="📋" title="Nenhuma entrega encerrada" description="Assim que uma entrega for encerrada, ela aparece aqui." />
        ) : (
          <DataList>
            {mockHistoricoEntregas.map((e) => (
              <DataRow key={e.id} className="items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">{formatDateTime(e.data)}</p>
                  <p className="text-xs text-[var(--tpl-text-muted)] mt-0.5">{e.local}</p>
                </div>
                <span className="text-xs font-bold bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)] px-2.5 py-1 rounded-full flex-shrink-0">
                  {e.totalRetiradas} famílias
                </span>
              </DataRow>
            ))}
          </DataList>
        )}
      </div>
    </AdminShell>
  )
}
