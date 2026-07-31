'use client'
// src/app/voluntarios/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF, formatPhone } from '@/lib/utils'
import { Header } from '@/components/ui/Header'
import { FormField, tplInputClass } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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
    <main className="min-h-[100dvh] pb-10">
      <Header />

      <div className="px-5 pt-6 max-w-md mx-auto">
        <Link href="/" className="text-sm text-[var(--tpl-primary)] font-semibold hover:underline">‹ Início</Link>
        <h1 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)] mt-2 mb-1">Quero ser voluntário</h1>
        <p className="text-sm text-[var(--tpl-text-secondary)] mb-6 leading-relaxed">
          Preencha seus dados para se cadastrar como voluntário da Cesta Solidária. A equipe da igreja entrará em
          contato pelo WhatsApp.
        </p>

        <form onSubmit={enviar} className="space-y-6">
          {erro && <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>}

          <Card className="p-4 sm:p-5 space-y-3">
            <FormField label="Nome completo" htmlFor="nome" required>
              <input id="nome" className={tplInputClass} placeholder="Seu nome completo" value={form.nome}
                onChange={e => set('nome', e.target.value)} autoComplete="name" />
            </FormField>
            <FormField label="CPF" htmlFor="cpf" required>
              <input id="cpf" className={tplInputClass} placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
                value={form.cpf} onChange={e => set('cpf', formatCPF(e.target.value))} />
            </FormField>
            <FormField label="WhatsApp" htmlFor="telefone" required>
              <input id="telefone" type="tel" className={tplInputClass} placeholder="(19) 9 0000-0000" value={form.telefone}
                onChange={e => set('telefone', formatPhone(e.target.value))} autoComplete="tel" />
            </FormField>
          </Card>

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar cadastro'}
          </Button>
        </form>
      </div>
    </main>
  )
}
