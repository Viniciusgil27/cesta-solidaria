// src/app/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getEntregaAtiva() {
  return prisma.entrega.findFirst({
    where: { status: 'ATIVA' },
    orderBy: { criadoEm: 'desc' },
  })
}

export default async function HomePage() {
  const entrega = await getEntregaAtiva()

  return (
    <main className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center py-10 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-7 w-full max-w-sm text-center shadow-sm">

        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'var(--roxo)' }}>
          <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
            <path d="M20 8H4C2.9 8 2 8.9 2 10v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM4 10h16v2H4v-2zm0 9v-5h16v5H4zM8 3h8v3H8z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--roxo)' }}>
          Cesta Solidária
        </h1>
        <p className="text-sm text-slate-500 mb-7 leading-relaxed">
          Comunidade Batista Alternativa de Vida · Campinas
        </p>

        {/* Info entrega */}
        {entrega ? (
          <div className="rounded-xl p-4 mb-3 text-left" style={{ background: 'var(--roxo-bg)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--roxo-med)' }}>
              Próxima entrega
            </p>
            <p className="font-semibold" style={{ color: 'var(--roxo)' }}>
              {formatDate(entrega.data)}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{entrega.local}</p>
          </div>
        ) : (
          <div className="rounded-xl p-4 mb-3 text-left bg-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Próxima entrega
            </p>
            <p className="font-semibold text-slate-500">Aguardando confirmação</p>
            <p className="text-sm text-slate-400 mt-0.5">A equipe irá anunciar em breve</p>
          </div>
        )}

        {/* Aviso */}
        <div className="rounded-xl p-3.5 mb-6 text-left flex gap-2.5 bg-amber-50 border border-amber-200">
          <span className="text-base mt-0.5">📋</span>
          <p className="text-sm text-amber-700 font-medium leading-relaxed">
            Leve seu documento com CPF para retirar a cesta.
          </p>
        </div>

        <Link href="/cadastro"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm mb-2.5 transition-opacity hover:opacity-90"
          style={{ background: 'var(--roxo)' }}>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/></svg>
          Fazer cadastro
        </Link>

        <Link href="/admin/login"
          className="block w-full py-3 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          Área administrativa
        </Link>

        <p className="text-xs text-slate-400 mt-5 leading-relaxed">
          Ação voluntária, sem fins lucrativos.<br />
          Dúvidas? Fale com a equipe da igreja.
        </p>
      </div>
    </main>
  )
}
