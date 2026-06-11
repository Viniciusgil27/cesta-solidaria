'use client'
// src/app/voluntarios/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF, formatPhone } from '@/lib/utils'

export default function VoluntariosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '' })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim()) { setErro('Informe seu nome completo.'); return }
    if (form.cpf.replace(/\D/g, '').length < 11) { setErro('Informe um CPF válido.'); return }
    if (!form.telefone.trim()) { setErro('Informe seu telefone com WhatsApp.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/voluntarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cpf: form.cpf.replace(/\D/g, ''),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao enviar cadastro.'); return }
      router.push('/voluntarios/sucesso')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3" style={{ background: 'var(--roxo)' }}>
        <Link href="/" className="text-white text-xl leading-none">‹</Link>
        <span className="text-white text-sm font-semibold">Quero ser voluntário</span>
      </header>

      <form onSubmit={enviar} className="p-5 max-w-md mx-auto">
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          Preencha seus dados para se cadastrar como voluntário da Cesta Solidária. A equipe da igreja entrará em
          contato pelo WhatsApp.
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">{erro}</div>
        )}

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Nome completo</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="Seu nome completo" value={form.nome}
              onChange={e => set('nome', e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">CPF</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="000.000.000-00" inputMode="numeric" value={form.cpf} maxLength={14}
              onChange={e => set('cpf', formatCPF(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">WhatsApp</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="(19) 9 0000-0000" type="tel" value={form.telefone}
              onChange={e => set('telefone', formatPhone(e.target.value))} autoComplete="tel" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{ background: 'var(--roxo)' }}>
          {loading ? 'Enviando…' : 'Enviar cadastro'}
        </button>
      </form>
    </main>
  )
}
