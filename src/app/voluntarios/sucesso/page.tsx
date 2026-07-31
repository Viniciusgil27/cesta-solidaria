import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'

export default function VoluntarioSucessoPage() {
  return (
    <main className="min-h-[100dvh] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <Card className="p-8 text-center max-w-sm w-full">
          <p className="text-5xl mb-4" aria-hidden="true">🙋</p>
          <h1 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)] mb-2">Cadastro recebido!</h1>
          <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed mb-6">
            Obrigado por se voluntariar! A equipe da Igreja AltVida vai entrar em contato pelo WhatsApp em breve.
          </p>
          <ButtonLink href="/" fullWidth>Voltar ao início</ButtonLink>
        </Card>
      </div>
      <Footer />
    </main>
  )
}
