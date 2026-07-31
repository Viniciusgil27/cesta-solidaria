'use client'
// src/app/admin/login/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormField, tplInputClass } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const res = await signIn('credentials', { email, senha, redirect: false })
    setLoading(false)
    if (res?.error) { setErro('Email ou senha incorretos.'); return }
    router.push('/admin')
  }

  return (
    <main className="min-h-screen flex flex-col tpl-hero-scrim">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-7 w-full max-w-sm">
          <h1 className="font-tpl-serif font-bold text-xl text-[var(--tpl-text-primary)] mb-1">Área administrativa</h1>
          <p className="text-sm text-[var(--tpl-text-secondary)] mb-6">Acesso restrito à equipe da Igreja AltVida.</p>

          {erro && (
            <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 mb-4 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>
          )}

          <form onSubmit={entrar} className="space-y-4">
            <FormField label="Email" htmlFor="email" required>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                className={tplInputClass} placeholder="seu@email.com" autoComplete="email" required />
            </FormField>
            <FormField label="Senha" htmlFor="senha" required>
              <input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)}
                className={tplInputClass} placeholder="••••••••" autoComplete="current-password" required />
            </FormField>
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
      <div className="pb-6 text-center">
        <Link href="/" className="text-sm text-white/70 hover:text-white">← Voltar para o início</Link>
      </div>
    </main>
  )
}
