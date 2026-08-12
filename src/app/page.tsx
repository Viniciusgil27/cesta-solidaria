import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { ButtonLink } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

async function getEntregaAtiva() {
  return prisma.entrega.findFirst({
    where: { status: 'ATIVA' },
    orderBy: { criadoEm: 'desc' },
  })
}

// Página inicial pensada pro público principal do sistema: pessoas idosas e
// com pouca familiaridade com tecnologia. Por isso só o essencial fica aqui —
// data da próxima entrega, as duas ações possíveis e o que levar no dia.
// Conteúdo institucional ("como funciona", "sobre a comunidade", "seja
// voluntário") continua acessível pelo menu e pelo rodapé, só não compete
// mais por atenção na primeira tela.
export default async function HomePage() {
  const entrega = await getEntregaAtiva()

  return (
    <main className="min-h-[100dvh]">
      <Header />

      <section className="tpl-hero-scrim text-white px-5 py-8 text-center">
        <h1 className="font-tpl-serif text-3xl font-bold">Cesta Solidária</h1>
        <p className="text-sm text-white/85 mt-1">Comunidade Batista Alternativa de Vida · Jaraguá</p>
      </section>

      <div className="max-w-xl mx-auto px-5 -mt-5 pb-14 space-y-5">

        {/* Próxima entrega — a informação mais importante da página */}
        <div className="rounded-2xl border-2 border-[var(--tpl-primary)] bg-[var(--tpl-surface-card)] p-6 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--tpl-primary)] mb-2">
            📅 Próxima entrega de cestas
          </p>
          {entrega ? (
            <>
              <p className="font-tpl-serif text-3xl font-bold text-[var(--tpl-text-primary)] leading-snug">
                {formatDateTime(entrega.data)}
              </p>
              <p className="text-lg text-[var(--tpl-text-secondary)] mt-2">{entrega.local}</p>
            </>
          ) : (
            <p className="text-xl text-[var(--tpl-text-muted)] py-1">Aguardando confirmação da equipe</p>
          )}
        </div>

        {/* Ações principais */}
        <div className="space-y-3">
          <ButtonLink href="/cadastro" size="lg" fullWidth className="!text-lg !py-5">
            Fazer cadastro
          </ButtonLink>
          <ButtonLink href="/consulta" size="lg" variant="secondary" fullWidth className="!text-lg !py-5">
            Consultar meu cadastro
          </ButtonLink>
        </div>

        {/* Para retirar — informação prática essencial */}
        <div className="rounded-2xl p-5 bg-[var(--tpl-warning-soft)] border-2 border-amber-300">
          <p className="text-base font-bold text-[var(--tpl-warning)] mb-2">📋 Para retirar sua cesta</p>
          <ul className="text-base text-[var(--tpl-text-secondary)] space-y-2 leading-relaxed list-disc list-inside">
            <li>Leve um documento com CPF</li>
            <li>Compareça no dia e horário da entrega</li>
            <li>O cadastro precisa estar aprovado</li>
          </ul>
        </div>
      </div>

      <Footer />
    </main>
  )
}
