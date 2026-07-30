'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormField, tplInputClass } from '@/components/template-alternativa/FormField'
import { Button } from '@/components/template-alternativa/Button'
import { Card } from '@/components/template-alternativa/Card'

// Não há NextAuth aqui — "Entrar" apenas navega para o painel do protótipo
// após uma pequena espera simulada, sem autenticação real.
export default function TemplateAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  function entrar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push('/template-visual/admin')
    }, 600)
  }

  return (
    <main className="min-h-[100dvh] flex flex-col tpl-hero-scrim">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-7 w-full max-w-sm">
          <p className="tpl-eyebrow mb-1">Protótipo — sem autenticação real</p>
          <h1 className="font-tpl-serif font-bold text-xl text-[var(--tpl-text-primary)] mb-1">Área administrativa</h1>
          <p className="text-sm text-[var(--tpl-text-secondary)] mb-6">Acesso restrito à equipe da Igreja AltVida.</p>

          <form onSubmit={entrar} className="space-y-4">
            <FormField label="Email" htmlFor="email" required>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={tplInputClass} placeholder="seu@email.com" autoComplete="email" required />
            </FormField>
            <FormField label="Senha" htmlFor="senha" required>
              <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                className={tplInputClass} placeholder="••••••••" autoComplete="current-password" required />
            </FormField>
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
      <div className="pb-6 text-center">
        <Link href="/template-visual" className="text-sm text-white/70 hover:text-white">← Voltar para o início</Link>
      </div>
    </main>
  )
}
