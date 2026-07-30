import { Header } from '@/components/template-alternativa/Header'
import { Footer } from '@/components/template-alternativa/Footer'
import { Card } from '@/components/template-alternativa/Card'
import { ButtonLink } from '@/components/template-alternativa/Button'
import { formatDateTime } from '@/lib/template-alternativa/format'
import { mockEntregaAtiva } from '@/lib/template-alternativa/mock-data'

const PASSOS = [
  { titulo: 'Faça seu cadastro', texto: 'Preencha seus dados e envie o comprovante de residência pelo site.' },
  { titulo: 'Aguarde a aprovação', texto: 'A equipe confere as informações para garantir que a ajuda chegue a quem mais precisa.' },
  { titulo: 'Acompanhe a próxima entrega', texto: 'Consulte aqui mesmo a data, o horário e o local de retirada.' },
  { titulo: 'Retire sua cesta', texto: 'Compareça no dia combinado com um documento com CPF.' },
]

export default function TemplateHomePage() {
  return (
    <main className="min-h-[100dvh]">
      <Header />

      {/* Hero — bloco de cor no lugar de foto de estoque, ver relatório final */}
      <section className="tpl-hero-scrim text-white px-5 py-16 sm:py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-3">Comunidade Batista Alternativa de Vida</p>
        <h1 className="font-tpl-serif text-3xl sm:text-5xl font-bold mb-4 max-w-2xl mx-auto leading-tight">
          Cuidado que chega até você
        </h1>
        <p className="text-sm sm:text-base text-white/85 max-w-md mx-auto leading-relaxed mb-8">
          Um gesto de fé e comunhão da nossa comunidade para famílias de Jaraguá — cestas básicas entregues com carinho todo mês.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm sm:max-w-none mx-auto">
          <ButtonLink href="/template-visual/cadastro" size="lg" className="bg-white text-[var(--tpl-primary)] hover:bg-white/90">
            Fazer cadastro
          </ButtonLink>
          <ButtonLink href="/template-visual/consulta" size="lg" variant="ghost" className="border-2 border-white/40 text-white hover:bg-white/10">
            Consultar meu cadastro
          </ButtonLink>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 -mt-8 pb-16 space-y-6">

        {/* Próxima entrega */}
        <Card className="p-5 sm:p-6">
          <p className="tpl-eyebrow mb-1">Próxima entrega</p>
          <p className="font-tpl-serif font-bold text-xl text-[var(--tpl-text-primary)]">{formatDateTime(mockEntregaAtiva.data)}</p>
          <p className="text-sm text-[var(--tpl-text-secondary)] mt-0.5">{mockEntregaAtiva.local}</p>
        </Card>

        {/* Como funciona */}
        <Card className="p-5 sm:p-6">
          <h2 className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] mb-4">Como funciona</h2>
          <ol className="space-y-4">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-[var(--tpl-primary-soft)] text-[var(--tpl-primary)]"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">{passo.titulo}</p>
                  <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* Para retirar */}
        <div className="rounded-2xl p-5 sm:p-6 flex gap-3 bg-[var(--tpl-warning-soft)] border border-amber-200">
          <span className="text-xl leading-none" aria-hidden="true">📋</span>
          <div>
            <p className="text-sm font-semibold text-[var(--tpl-warning)] mb-1.5">Para retirar sua cesta</p>
            <ul className="text-sm text-[var(--tpl-text-secondary)] space-y-1 leading-relaxed list-disc list-inside">
              <li>Leve um documento com CPF</li>
              <li>Compareça no dia e horário da entrega</li>
              <li>O cadastro precisa estar aprovado</li>
            </ul>
          </div>
        </div>

        {/* Sobre a comunidade */}
        <Card className="p-5 sm:p-6">
          <p className="tpl-eyebrow mb-1">Quem somos</p>
          <h2 className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] mb-2">Sobre a Comunidade</h2>
          <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed">
            A Comunidade Batista Alternativa de Vida, em Jaraguá, mantém este projeto de forma totalmente voluntária,
            com o objetivo de levar cestas básicas a famílias da região. Cada doação e cada hora de trabalho fazem
            parte de um esforço coletivo de cuidado com o próximo.
          </p>
        </Card>

        {/* Voluntário */}
        <Card className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div>
            <h2 className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)]">Quer ajudar como voluntário?</h2>
            <p className="text-sm text-[var(--tpl-text-secondary)] mt-0.5">Cadastre-se e a equipe entra em contato pelo WhatsApp.</p>
          </div>
          <ButtonLink href="/template-visual/voluntarios" variant="secondary" className="flex-shrink-0">
            Quero ser voluntário
          </ButtonLink>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
