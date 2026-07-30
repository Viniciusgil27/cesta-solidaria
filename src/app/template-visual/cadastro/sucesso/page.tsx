import { Header } from '@/components/template-alternativa/Header'
import { Footer } from '@/components/template-alternativa/Footer'
import { Card } from '@/components/template-alternativa/Card'
import { ButtonLink } from '@/components/template-alternativa/Button'

export default function TemplateCadastroSucessoPage() {
  return (
    <main className="min-h-[100dvh] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <Card className="p-8 text-center max-w-sm w-full">
          <p className="text-5xl mb-4" aria-hidden="true">✅</p>
          <h1 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)] mb-2">Cadastro enviado!</h1>
          <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed mb-6">
            Recebemos seus dados e o comprovante de residência. A equipe da igreja vai analisar e confirmar seu
            cadastro antes da próxima entrega.
          </p>
          <div className="space-y-2.5">
            <ButtonLink href="/template-visual/consulta" fullWidth>Consultar meu cadastro</ButtonLink>
            <ButtonLink href="/template-visual" variant="ghost" fullWidth>Voltar ao início</ButtonLink>
          </div>
        </Card>
      </div>
      <Footer />
    </main>
  )
}
