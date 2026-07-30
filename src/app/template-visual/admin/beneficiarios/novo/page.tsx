'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Card } from '@/components/template-alternativa/Card'
import { Button, ButtonLink } from '@/components/template-alternativa/Button'
import { FormField, tplInputClass } from '@/components/template-alternativa/FormField'
import { formatCPF, formatPhone } from '@/lib/template-alternativa/format'

const FAIXAS = [
  { key: 'criancas', label: 'Crianças (0–12)' },
  { key: 'adolescentes', label: 'Adolescentes (13–17)' },
  { key: 'adultos', label: 'Adultos (18–59)' },
  { key: 'idosos', label: 'Idosos (60+)' },
] as const

export default function TemplateBeneficiarioNovoPage() {
  const [salvando, setSalvando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', bairro: '',
    criancas: 0, adolescentes: 0, adultos: 0, idosos: 0,
  })

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setTimeout(() => {
      setSalvando(false)
      setConcluido(true)
    }, 500)
  }

  if (concluido) {
    return (
      <AdminShell title="Adicionar família" backHref="/template-visual/admin/beneficiarios">
        <Card className="p-8 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">✅</p>
          <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] mb-1">Família cadastrada</p>
          <p className="text-sm text-[var(--tpl-text-secondary)] mb-5">{form.nome} foi adicionado(a) à lista de beneficiários.</p>
          <ButtonLink href="/template-visual/admin/beneficiarios" fullWidth>Voltar para a lista</ButtonLink>
        </Card>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Adicionar família" backHref="/template-visual/admin/beneficiarios">
      <form onSubmit={salvar} className="space-y-6">
        <Card className="p-4 sm:p-5 space-y-3">
          <p className="tpl-eyebrow">Dados da família</p>
          <FormField label="Nome completo" htmlFor="nome" required>
            <input id="nome" className={tplInputClass} placeholder="Nome da família" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
          </FormField>
          <FormField label="CPF" htmlFor="cpf" required>
            <input id="cpf" className={tplInputClass} placeholder="000.000.000-00" value={form.cpf} maxLength={14} onChange={(e) => set('cpf', formatCPF(e.target.value))} />
          </FormField>
          <FormField label="Telefone" htmlFor="telefone">
            <input id="telefone" className={tplInputClass} placeholder="(19) 9 0000-0000" value={form.telefone} onChange={(e) => set('telefone', formatPhone(e.target.value))} />
          </FormField>
          <FormField label="Endereço" htmlFor="endereco">
            <input id="endereco" className={tplInputClass} placeholder="Rua, número" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />
          </FormField>
          <FormField label="Bairro" htmlFor="bairro">
            <input id="bairro" className={tplInputClass} placeholder="Bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} />
          </FormField>
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="tpl-eyebrow mb-3">Moradores por faixa etária</p>
          <div className="grid grid-cols-2 gap-3">
            {FAIXAS.map((f) => (
              <FormField key={f.key} label={f.label} htmlFor={f.key}>
                <input id={f.key} type="number" min={0} max={99} value={form[f.key]}
                  onChange={(e) => set(f.key, parseInt(e.target.value) || 0)}
                  className={tplInputClass + ' text-center'} />
              </FormField>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <ButtonLink href="/template-visual/admin/beneficiarios" variant="ghost" fullWidth>Cancelar</ButtonLink>
          <Button type="submit" fullWidth disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar cadastro'}</Button>
        </div>
      </form>
    </AdminShell>
  )
}
