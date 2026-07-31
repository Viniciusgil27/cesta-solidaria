import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'

export default function CadastroSucessoPage() {
  return (
    <main className="min-h-[100dvh] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <Card className="p-8 text-center max-w-sm w-full">
          <p className="text-5xl mb-4" aria-hidden="true">✅</p>
          <h1 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)] mb-2">Cadastro enviado!</h1>
          <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed mb-6">
            A equipe da Igreja AltVida irá analisar seu cadastro e confirmar antes da próxima entrega de cestas.
          </p>
          <div className="space-y-2.5">
            <ButtonLink href="/consulta" fullWidth>Consultar meu cadastro</ButtonLink>
            <ButtonLink href="/" variant="ghost" fullWidth>Voltar ao início</ButtonLink>
          </div>
        </Card>
      </div>
      <Footer />
    </main>
  )
}
