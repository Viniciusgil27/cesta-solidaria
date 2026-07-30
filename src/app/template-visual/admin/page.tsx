import Link from 'next/link'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { StatCard } from '@/components/template-alternativa/StatCard'
import { formatDateTime } from '@/lib/template-alternativa/format'
import {
  mockEntregaAtiva,
  mockBeneficiariosAprovados,
  mockBeneficiariosPendentes,
  mockVoluntarios,
} from '@/lib/template-alternativa/mock-data'

export default function TemplateAdminDashboardPage() {
  const totalBeneficiarios = mockBeneficiariosAprovados.length
  const totalPendentesCadastro = mockBeneficiariosPendentes.length
  const totalVoluntarios = mockVoluntarios.filter((v) => v.status === 'ATIVO').length
  const totalRetiraram = mockEntregaAtiva.totalRetiradas
  const pct = totalBeneficiarios ? Math.round((totalRetiraram / totalBeneficiarios) * 100) : 0

  const acoesBeneficiarios = [
    { href: '/template-visual/admin/beneficiarios', icon: '👥', label: 'Ver cadastros', desc: 'Editar e remover' },
    { href: '/template-visual/admin/beneficiarios/novo', icon: '➕', label: 'Adicionar família', desc: 'Cadastro manual' },
    { href: '/template-visual/admin/importar', icon: '📥', label: 'Importar Excel', desc: 'Atualizar base' },
    { href: '/template-visual/admin/exportar', icon: '📊', label: 'Exportar dados', desc: 'Relatórios em Excel' },
  ]

  return (
    <AdminShell title="Painel administrativo">
      <div className="space-y-6">
        <div>
          <p className="tpl-eyebrow mb-1">Painel administrativo</p>
          <h2 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)]">Olá, Camila 👋</h2>
        </div>

        {/* Banner entrega */}
        <div className="rounded-2xl p-4 border bg-[var(--tpl-success-soft)] border-emerald-200">
          <p className="text-xs font-bold uppercase tracking-wider mb-1 text-[var(--tpl-success)]">Entrega ativa</p>
          <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)]">{formatDateTime(mockEntregaAtiva.data)}</p>
          <p className="text-sm text-[var(--tpl-text-secondary)] mt-0.5">{mockEntregaAtiva.local}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={totalBeneficiarios} label="Cadastrados" />
          <StatCard value={totalRetiraram} label="Retiraram" />
          <StatCard value={totalBeneficiarios - totalRetiraram} label="Pendentes" />
          <StatCard value={`${pct}%`} label="Atendimento" />
        </div>

        {/* Distribuição */}
        <div>
          <p className="tpl-eyebrow mb-3">Distribuição</p>
          <Link
            href="/template-visual/admin/entrega"
            className="flex items-center gap-3 w-full rounded-xl p-4 text-white font-semibold text-sm bg-[var(--tpl-primary)] hover:bg-[var(--tpl-primary-hover)] transition-colors"
          >
            <span className="text-xl" aria-hidden="true">🧺</span>
            <div className="text-left">
              <p>Entregar cestas</p>
              <p className="font-normal text-white/75 text-xs">Validar CPF e confirmar retirada</p>
            </div>
          </Link>
        </div>

        {/* Beneficiários */}
        <div>
          <p className="tpl-eyebrow mb-3">Beneficiários</p>

          {totalPendentesCadastro > 0 && (
            <Link
              href="/template-visual/admin/pendentes"
              className="flex items-center gap-3 w-full rounded-xl p-4 mb-2.5 border-2 border-amber-300 bg-[var(--tpl-warning-soft)] hover:bg-amber-100 transition-colors"
            >
              <span className="text-2xl" aria-hidden="true">🕐</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[var(--tpl-warning)]">Aprovar cadastros</p>
                <p className="text-xs text-[var(--tpl-warning)]">{totalPendentesCadastro} cadastro{totalPendentesCadastro !== 1 ? 's' : ''} aguardando aprovação</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-400 text-amber-900">{totalPendentesCadastro}</span>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {acoesBeneficiarios.map((a) => (
              <Link key={a.href} href={a.href}
                className="bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-xl p-4 flex flex-col items-center gap-1.5 text-center hover:bg-[var(--tpl-primary-soft)] hover:border-[var(--tpl-primary)] transition-colors">
                <span className="text-2xl" aria-hidden="true">{a.icon}</span>
                <p className="text-xs font-semibold text-[var(--tpl-text-primary)]">{a.label}</p>
                <p className="text-xs text-[var(--tpl-text-muted)] leading-tight">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Voluntários */}
        <Link href="/template-visual/admin/voluntarios"
          className="flex items-center gap-3 w-full rounded-xl p-4 bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] hover:bg-[var(--tpl-primary-soft)] hover:border-[var(--tpl-primary)] transition-colors">
          <span className="text-2xl" aria-hidden="true">🙋</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">Voluntários</p>
            <p className="text-xs text-[var(--tpl-text-muted)]">{totalVoluntarios} ativo{totalVoluntarios !== 1 ? 's' : ''}</p>
          </div>
          <span className="text-[var(--tpl-text-muted)] text-lg">›</span>
        </Link>

        {/* Histórico e Admins */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/template-visual/admin/historico"
            className="bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-xl p-4 flex flex-col items-center gap-1.5 text-center hover:bg-[var(--tpl-primary-soft)] hover:border-[var(--tpl-primary)] transition-colors">
            <span className="text-2xl" aria-hidden="true">📋</span>
            <p className="text-xs font-semibold text-[var(--tpl-text-primary)]">Histórico</p>
            <p className="text-xs text-[var(--tpl-text-muted)]">Entregas anteriores</p>
          </Link>
          <Link href="/template-visual/admin/admins"
            className="bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-xl p-4 flex flex-col items-center gap-1.5 text-center hover:bg-[var(--tpl-primary-soft)] hover:border-[var(--tpl-primary)] transition-colors">
            <span className="text-2xl" aria-hidden="true">🔐</span>
            <p className="text-xs font-semibold text-[var(--tpl-text-primary)]">Admins</p>
            <p className="text-xs text-[var(--tpl-text-muted)]">Gerenciar equipe</p>
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
