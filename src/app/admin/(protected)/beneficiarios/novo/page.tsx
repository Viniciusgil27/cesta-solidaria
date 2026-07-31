'use client'
// src/app/admin/(protected)/beneficiarios/novo/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCPF, formatPhone } from '@/lib/utils'
import { AdminShell } from '@/components/ui/AdminShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField, tplInputClass } from '@/components/ui/FormField'

function Counter({ label, sub, value, onChange }: {
  label: string; sub: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="rounded-xl p-3 text-center bg-white border border-[var(--tpl-border)]">
      <p className="text-xs font-semibold text-[var(--tpl-text-primary)] leading-tight mb-0.5">{label}</p>
      <p className="text-xs text-[var(--tpl-text-muted)] mb-2">{sub}</p>
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-lg border border-[var(--tpl-border)] flex items-center justify-center font-bold text-[var(--tpl-primary)] hover:bg-[var(--tpl-primary-soft)] transition-colors">−</button>
        <span className="text-base font-bold w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg border border-[var(--tpl-border)] flex items-center justify-center font-bold text-[var(--tpl-primary)] hover:bg-[var(--tpl-primary-soft)] transition-colors">+</button>
      </div>
    </div>
  )
}

export default function NovoBeneficiarioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', bairro: '',
    criancas: 0, adolescentes: 0, adultos: 0, idosos: 0,
  })

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.cpf.replace(/\D/g, '').length < 11) { setErro('CPF inválido.'); return }
    setLoading(true)
    const res = await fetch('/api/beneficiarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cpf: form.cpf.replace(/\D/g, '') }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErro(d.error || 'Erro ao salvar.'); return }
    router.push('/admin/beneficiarios')
  }

  return (
    <AdminShell title="Adicionar família" backHref="/admin/beneficiarios">
      <form onSubmit={salvar} className="space-y-6">
        {erro && <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>}

        <Card className="p-4 sm:p-5 space-y-3">
          <p className="tpl-eyebrow">Dados pessoais</p>
          <FormField label="Nome completo" htmlFor="nome" required>
            <input id="nome" className={tplInputClass} placeholder="Nome da família" value={form.nome} onChange={e => set('nome', e.target.value)} required />
          </FormField>
          <FormField label="CPF" htmlFor="cpf" required>
            <input id="cpf" className={tplInputClass} placeholder="000.000.000-00" inputMode="numeric" value={form.cpf} maxLength={14}
              onChange={e => set('cpf', formatCPF(e.target.value))} required />
          </FormField>
          <FormField label="Telefone" htmlFor="telefone">
            <input id="telefone" className={tplInputClass} placeholder="(19) 9 0000-0000" type="tel" value={form.telefone}
              onChange={e => set('telefone', formatPhone(e.target.value))} />
          </FormField>
        </Card>

        <Card className="p-4 sm:p-5 space-y-3">
          <p className="tpl-eyebrow">Endereço</p>
          <FormField label="Rua e número" htmlFor="endereco">
            <input id="endereco" className={tplInputClass} placeholder="Rua, número" value={form.endereco} onChange={e => set('endereco', e.target.value)} />
          </FormField>
          <FormField label="Bairro" htmlFor="bairro">
            <input id="bairro" className={tplInputClass} placeholder="Bairro" value={form.bairro} onChange={e => set('bairro', e.target.value)} />
          </FormField>
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="tpl-eyebrow mb-3">Pessoas na casa</p>
          <div className="grid grid-cols-2 gap-2.5">
            <Counter label="Crianças" sub="0 a 12 anos" value={form.criancas} onChange={v => set('criancas', v)} />
            <Counter label="Adolescentes" sub="13 a 17 anos" value={form.adolescentes} onChange={v => set('adolescentes', v)} />
            <Counter label="Adultos" sub="18 a 59 anos" value={form.adultos} onChange={v => set('adultos', v)} />
            <Counter label="Idosos" sub="60 anos ou mais" value={form.idosos} onChange={v => set('idosos', v)} />
          </div>
        </Card>

        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Salvando…' : 'Adicionar família'}
        </Button>
      </form>
    </AdminShell>
  )
}
