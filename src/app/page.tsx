import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getEntregaAtiva() {
  return prisma.entrega.findFirst({
    where: { status: 'ATIVA' },
    orderBy: { criadoEm: 'desc' },
  })
}

const PASSOS = [
  {
    titulo: 'Faça seu cadastro',
    texto: 'Preencha seus dados e envie o comprovante de residência pelo site.',
  },
  {
    titulo: 'Aguarde a aprovação',
    texto: 'A equipe confere as informações para garantir que a ajuda chegue a quem mais precisa.',
  },
  {
    titulo: 'Acompanhe a próxima entrega',
    texto: 'Consulte aqui mesmo a data, o horário e o local de retirada.',
  },
  {
    titulo: 'Retire sua cesta',
    texto: 'Compareça no dia combinado com um documento com CPF.',
  },
]

export default async function HomePage() {
  const entrega = await getEntregaAtiva()

  return (
    <main className="min-h-[100dvh] bg-slate-50">
      {/* Hero */}
      <section
        className="px-5 pt-12 pb-14 text-center text-white"
        style={{ background: 'linear-gradient(160deg, var(--roxo) 0%, var(--roxo-med) 100%)' }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white/15">
          <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 8H4C2.9 8 2 8.9 2 10v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM4 10h16v2H4v-2zm0 9v-5h16v5H4zM8 3h8v3H8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Cesta Solidária</h1>
        <p className="text-sm text-white/85 max-w-xs mx-auto leading-relaxed">
          Um gesto de cuidado da Comunidade Batista Alternativa de Vida · Jaraguá para famílias da nossa região.
        </p>
      </section>

      <div className="px-5 -mt-6 pb-10 max-w-lg mx-auto space-y-5">

        {/* Próxima entrega */}
        {entrega ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--roxo-med)' }}>
              Próxima entrega
            </p>
            <p className="font-bold text-lg" style={{ color: 'var(--roxo)' }}>
              {formatDateTime(entrega.data)}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{entrega.local}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Próxima entrega</p>
            <p className="font-bold text-lg text-slate-500">Aguardando confirmação</p>
            <p className="text-sm text-slate-400 mt-0.5">A equipe irá anunciar em breve</p>
          </div>
        )}

        {/* Cadastro e consulta */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-800">Ainda não é cadastrado?</h2>
          <p className="text-sm text-slate-500 mt-0.5 mb-4 leading-relaxed">
            Faça seu cadastro para participar das próximas entregas de cestas básicas.
          </p>
          <Link
            href="/cadastro"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ background: 'var(--roxo)' }}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
            </svg>
            Fazer cadastro
          </Link>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-2 leading-relaxed">
              Já se cadastrou? Veja a situação do seu cadastro.
            </p>
            <Link
              href="/consulta"
              className="block w-full py-3 rounded-xl text-sm font-semibold text-center border-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ borderColor: 'var(--roxo-claro)', color: 'var(--roxo)' }}
            >
              Consultar meu cadastro
            </Link>
          </div>
        </div>

        {/* Como funciona */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4">Como funciona</h2>
          <ol className="space-y-3.5">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--roxo-bg)', color: 'var(--roxo-med)' }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{passo.titulo}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Informações sobre retirada */}
        <div className="rounded-2xl p-5 flex gap-3 bg-amber-50 border border-amber-200">
          <span className="text-xl leading-none" aria-hidden="true">📋</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1.5">Para retirar sua cesta</p>
            <ul className="text-sm text-amber-700 space-y-1 leading-relaxed list-disc list-inside">
              <li>Leve um documento com CPF</li>
              <li>Compareça no dia e horário da entrega</li>
              <li>O cadastro precisa estar aprovado</li>
            </ul>
          </div>
        </div>

        {/* Sobre a comunidade */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-2">Sobre a Comunidade</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            A Comunidade Batista Alternativa de Vida, em Jaraguá, mantém este projeto de forma totalmente
            voluntária, com o objetivo de levar cestas básicas a famílias da região. Cada doação e cada hora
            de trabalho fazem parte de um esforço coletivo de cuidado com o próximo.
          </p>
        </div>

        {/* Rodapé */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Ação voluntária, sem fins lucrativos.<br />
            Dúvidas? Fale com a equipe da igreja.
          </p>
          <Link
            href="/admin/login"
            className="text-xs font-medium text-slate-400 hover:text-slate-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
          >
            Área administrativa
          </Link>
        </div>
      </div>
    </main>
  )
}
