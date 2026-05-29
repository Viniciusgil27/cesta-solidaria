// src/app/admin/(protected)/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { SignOutButton } from '@/components/admin/SignOutButton'
import { NovaEntregaButton } from '@/components/admin/NovaEntregaButton'

export const revalidate = 0

async function getDados() {
  const [entregaAtiva, totalBeneficiarios, historico] = await Promise.all([
    prisma.entrega.findFirst({ where: { status: 'ATIVA' }, include: { _count: { select: { retiradas: true } } } }),
    prisma.beneficiario.count({ where: { ativo: true } }),
    prisma.entrega.findMany({ where: { status: 'ENCERRADA' }, orderBy: { criadoEm: 'desc' }, take: 3, include: { _count: { select: { retiradas: true } } } }),
  ])
  return { entregaAtiva, totalBeneficiarios, historico }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const { entregaAtiva, totalBeneficiarios, historico } = await getDados()

  const totalRetiraram = entregaAtiva?._count.retiradas ?? 0
  const totalPendentes = totalBeneficiarios - totalRetiraram
  const pct = totalBeneficiarios ? Math.round(totalRetiraram / totalBeneficiarios * 100) : 0

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between" style={{ background: 'var(--roxo)' }}>
        <div>
          <p className="text-white font-semibold text-sm">Painel administrativo</p>
          <p className="text-purple-300 text-xs mt-0.5">Olá, {session?.user?.name}</p>
        </div>
        <SignOutButton />
      </header>

      <div className="p-5 max-w-lg mx-auto space-y-5">

        {/* Banner entrega */}
        <div className={`rounded-2xl p-4 border ${entregaAtiva ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${entregaAtiva ? 'text-green-600' : 'text-amber-600'}`}>
            {entregaAtiva ? 'Entrega ativa' : 'Nenhuma entrega ativa'}
          </p>
          <p className={`font-bold text-base ${entregaAtiva ? 'text-green-800' : 'text-amber-800'}`}>
            {entregaAtiva ? formatDate(entregaAtiva.data) : '—'}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {entregaAtiva ? entregaAtiva.local : 'Inicie uma nova entrega para começar a distribuição'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { n: totalBeneficiarios, l: 'Cadastrados' },
            { n: totalRetiraram, l: 'Retiraram' },
            { n: totalPendentes, l: 'Pendentes' },
            { n: `${pct}%`, l: 'Atendimento' },
          ].map(s => (
            <div key={s.l} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--roxo)' }}>{s.n}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Ações principais */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Distribuição</p>
          <div className="space-y-2.5">
            <NovaEntregaButton />
            {entregaAtiva && (
              <Link href="/admin/entrega"
                className="flex items-center gap-3 w-full rounded-xl p-4 text-white font-semibold text-sm"
                style={{ background: 'var(--roxo)' }}>
                <span className="text-xl">🧺</span>
                <div className="text-left">
                  <p>Entregar cestas</p>
                  <p className="font-normal text-purple-200 text-xs">Validar CPF e confirmar retirada</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Beneficiários */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Beneficiários</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: '/admin/beneficiarios', icon: '👥', label: 'Ver cadastros', desc: 'Editar e remover' },
              { href: '/admin/beneficiarios/novo', icon: '➕', label: 'Adicionar família', desc: 'Cadastro manual' },
              { href: '/admin/importar', icon: '📥', label: 'Importar Excel', desc: 'Atualizar base' },
              { href: '/admin/exportar', icon: '📊', label: 'Exportar dados', desc: 'Relatórios em Excel' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1.5 text-center hover:bg-purple-50 hover:border-purple-200 transition-colors">
                <span className="text-2xl">{a.icon}</span>
                <p className="text-xs font-semibold text-slate-700">{a.label}</p>
                <p className="text-xs text-slate-400 leading-tight">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Histórico e Admins */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/admin/historico"
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1.5 text-center hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <span className="text-2xl">📋</span>
            <p className="text-xs font-semibold text-slate-700">Histórico</p>
            <p className="text-xs text-slate-400">Entregas anteriores</p>
          </Link>
          <Link href="/admin/admins"
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1.5 text-center hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <span className="text-2xl">🔐</span>
            <p className="text-xs font-semibold text-slate-700">Admins</p>
            <p className="text-xs text-slate-400">Gerenciar equipe</p>
          </Link>
        </div>

      </div>
    </main>
  )
}
