'use client'
// src/app/admin/login/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--roxo)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-7 w-full max-w-sm">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--roxo)' }}>Área administrativa</h2>
          <p className="text-sm text-slate-500 mb-6">Acesso restrito à equipe da Igreja AltVida.</p>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">{erro}</div>
          )}

          <form onSubmit={entrar} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 transition-colors"
                placeholder="seu@email.com" autoComplete="email" required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1.5">Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 transition-colors"
                placeholder="••••••••" autoComplete="current-password" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
              style={{ background: 'var(--roxo)' }}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
      <div className="pb-6 text-center">
        <Link href="/" className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ← Voltar para o início
        </Link>
      </div>
    </main>
  )
}
