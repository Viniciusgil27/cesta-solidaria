'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { DataList, DataRow } from '@/components/template-alternativa/DataTable'
import { Badge } from '@/components/template-alternativa/Badge'
import { EmptyState } from '@/components/template-alternativa/EmptyState'
import { formatCPF, iniciais } from '@/lib/template-alternativa/format'
import { mockVoluntarios } from '@/lib/template-alternativa/mock-data'

export default function TemplateVoluntariosAdminPage() {
  const [busca, setBusca] = useState('')
  const filtrada = mockVoluntarios.filter((v) => v.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <AdminShell title="Voluntários" backHref="/template-visual/admin">
      <div className="space-y-4">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome…"
          className="w-full border-2 border-[var(--tpl-border)] rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[var(--tpl-primary)]" />

        {filtrada.length === 0 ? (
          <EmptyState icon="🙋" title="Nenhum voluntário encontrado" description="Ajuste a busca ou aguarde novos cadastros." />
        ) : (
          <DataList>
            {filtrada.map((v) => (
              <Link key={v.id} href={`/template-visual/admin/voluntarios/${v.id}`}>
                <DataRow className="hover:bg-[var(--tpl-primary-soft)] transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]">
                    {iniciais(v.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--tpl-text-primary)] truncate">{v.nome}</p>
                    <p className="text-xs text-[var(--tpl-text-muted)]">{formatCPF(v.cpf)}</p>
                  </div>
                  <Badge tone={v.status === 'ATIVO' ? 'success' : 'neutral'}>{v.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</Badge>
                </DataRow>
              </Link>
            ))}
          </DataList>
        )}
      </div>
    </AdminShell>
  )
}
