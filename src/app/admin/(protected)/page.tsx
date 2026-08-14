// src/app/admin/(protected)/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDataDestaque } from '@/lib/utils'
import Link from 'next/link'
import { SignOutButton } from '@/components/admin/SignOutButton'
import { NovaEntregaButton } from '@/components/admin/NovaEntregaButton'
import { AdminShell } from '@/components/ui/AdminShell'
import { StatCard } from '@/components/ui/StatCard'

export const revalidate = 0

async function getDados() {
  const [entregaAtiva, totalBeneficiarios, totalPendentesCadastro, totalVoluntarios, historico] = await Promise.all([
    prisma.entrega.findFirst({ where: { status: 'ATIVA' }, include: { _count: { select: { retiradas: true } } } }),
    prisma.beneficiario.count({ where: { ativo: true, statusCadastro: 'APROVADO' } }),
    prisma.beneficiario.count({ where: { statusCadastro: 'PENDENTE' } }),
    prisma.voluntario.count({ where: { status: 'ATIVO' } }),
    prisma.entrega.findMany({ where: { status: 'ENCERRADA' }, orderBy: { criadoEm: 'desc' }, take: 3, include: { _count: { select: { retiradas: true } } } }),
  ])
  return { entregaAtiva, totalBeneficiarios, totalPendentesCadastro, totalVoluntarios, historico }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const { entregaAtiva, totalBeneficiarios, totalPendentesCadastro, totalVoluntarios } = await getDados()

  const totalRetiraram = entregaAtiva?._count.retiradas ?? 0
  const totalPendentes = totalBeneficiarios - totalRetiraram
  const pct = totalBeneficiarios ? Math.round(totalRetiraram / totalBeneficiarios * 100) : 0
  const destaque = entregaAtiva ? formatDataDestaque(entregaAtiva.data) : null

  return (
    <AdminShell title="Painel administrativo" headerAction={<SignOutButton />}>
      <div className="space-y-6">
        <div>
          <p className="tpl-eyebrow mb-1">Painel administrativo</p>
          <h2 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)]">Olá, {session?.user?.name} 👋</h2>
        </div>

        {/* Banner entrega */}
        <div className={`rounded-2xl p-4 border ${entregaAtiva ? 'bg-[var(--tpl-success-soft)] border-emerald-200' : 'bg-[var(--tpl-warning-soft)] border-amber-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${entregaAtiva ? 'text-[var(--tpl-success)]' : 'text-[var(--tpl-warning)]'}`}>
            {entregaAtiva ? 'Entrega ativa' : 'Nenhuma entrega ativa'}
          </p>
          <p className="font-tpl-legible font-bold text-lg text-[var(--tpl-text-primary)]">
            {destaque ? `${destaque.diaSemana.charAt(0).toUpperCase()}${destaque.diaSemana.slice(1)}, ${destaque.diaMes} às ${destaque.hora}` : '—'}
          </p>
          <p className="text-sm text-[var(--tpl-text-secondary)] mt-0.5">
            {entregaAtiva ? entregaAtiva.local : 'Inicie uma nova entrega para começar a distribuição'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={totalBeneficiarios} label="Cadastrados" />
          <StatCard value={totalRetiraram} label="Retiraram" />
          <StatCard value={totalPendentes} label="Pendentes" />
          <StatCard value={`${pct}%`} label="Atendimento" />
        </div>

        {/* Ações principais */}
        <div>
          <p className="tpl-eyebrow mb-3">Distribuição</p>
          <div className="space-y-2.5">
            <NovaEntregaButton />
            {entregaAtiva && (
              <Link href="/admin/entrega"
                className="flex items-center gap-3 w-full rounded-xl p-4 text-white font-semibold text-sm bg-[var(--tpl-primary)] hover:bg-[var(--tpl-primary-hover)] transition-colors">
                <span className="text-xl" aria-hidden="true">🧺</span>
                <div className="text-left">
                  <p>Entregar cestas</p>
                  <p className="font-normal text-white/75 text-xs">Validar CPF e confirmar retirada</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Beneficiários */}
        <div>
          <p className="tpl-eyebrow mb-3">Beneficiários</p>

          {totalPendentesCadastro > 0 && (
            <Link href="/admin/pendentes"
              className="flex items-center gap-3 w-full rounded-xl p-4 mb-2.5 border-2 border-amber-300 bg-[var(--tpl-warning-soft)] hover:bg-amber-100 transition-colors">
              <span className="text-2xl" aria-hidden="true">🕐</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[var(--tpl-warning)]">Aprovar cadastros</p>
                <p className="text-xs text-[var(--tpl-warning)]">{totalPendentesCadastro} cadastro{totalPendentesCadastro !== 1 ? 's' : ''} aguardando aprovação</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-400 text-amber-900">{totalPendentesCadastro}</span>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: '/admin/beneficiarios', icon: '👥', label: 'Ver cadastros', desc: 'Editar e remover' },
              { href: '/admin/beneficiarios/novo', icon: '➕', label: 'Adicionar família', desc: 'Cadastro manual' },
              { href: '/admin/importar', icon: '📥', label: 'Importar Excel', desc: 'Atualizar base' },
              { href: '/admin/exportar', icon: '📊', label: 'Exportar dados', desc: 'Relatórios em Excel' },
            ].map(a => (
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
        <Link href="/admin/voluntarios"
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
          <Link href="/admin/historico"
            className="bg-[var(--tpl-surface-card)] border border-[var(--tpl-border)] rounded-xl p-4 flex flex-col items-center gap-1.5 text-center hover:bg-[var(--tpl-primary-soft)] hover:border-[var(--tpl-primary)] transition-colors">
            <span className="text-2xl" aria-hidden="true">📋</span>
            <p className="text-xs font-semibold text-[var(--tpl-text-primary)]">Histórico</p>
            <p className="text-xs text-[var(--tpl-text-muted)]">Entregas anteriores</p>
          </Link>
          <Link href="/admin/admins"
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
