// src/app/cadastro/sucesso/page.tsx
import Link from 'next/link'

export default function CadastroSucessoPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Cadastro enviado!</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-7">
          A equipe da Igreja AltVida irá analisar seu cadastro e confirmar antes da próxima entrega de cestas.
        </p>
        <Link href="/"
          className="block w-full py-3.5 rounded-xl text-white font-semibold text-sm text-center"
          style={{ background: 'var(--roxo)' }}>
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
