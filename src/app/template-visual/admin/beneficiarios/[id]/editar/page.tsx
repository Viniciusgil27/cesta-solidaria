'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Card } from '@/components/template-alternativa/Card'
import { Button, ButtonLink } from '@/components/template-alternativa/Button'
import { FormField, tplInputClass } from '@/components/template-alternativa/FormField'
import { formatCPF, formatPhone } from '@/lib/template-alternativa/format'
import { mockBeneficiarios } from '@/lib/template-alternativa/mock-data'

export default function TemplateBeneficiarioEditarPage({ params }: { params: { id: string } }) {
  const original = mockBeneficiarios.find((b) => b.id === params.id) ?? mockBeneficiarios[0]
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const detalheHref = `/template-visual/admin/beneficiarios/${params.id}`

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setTimeout(() => {
      setSalvando(false)
      setSalvo(true)
    }, 500)
  }

  return (
    <AdminShell title="Editar beneficiário" backHref={detalheHref}>
      {salvo && (
        <div className="mb-4 rounded-xl p-3 bg-[var(--tpl-success-soft)] border border-emerald-200 text-sm text-[var(--tpl-success)] font-medium">
          Alterações salvas com sucesso (protótipo — nada foi persistido).
        </div>
      )}
      <form onSubmit={salvar} className="space-y-6">
        <Card className="p-4 sm:p-5 space-y-3">
          <FormField label="Nome completo" htmlFor="nome" required>
            <input id="nome" defaultValue={original.nome} className={tplInputClass} />
          </FormField>
          <FormField label="CPF" htmlFor="cpf" required>
            <input id="cpf" defaultValue={formatCPF(original.cpf)} className={tplInputClass} />
          </FormField>
          <FormField label="Telefone" htmlFor="telefone">
            <input id="telefone" defaultValue={formatPhone(original.telefone)} className={tplInputClass} />
          </FormField>
          <FormField label="Endereço" htmlFor="endereco">
            <input id="endereco" defaultValue={original.endereco} className={tplInputClass} />
          </FormField>
          <FormField label="Bairro" htmlFor="bairro">
            <input id="bairro" defaultValue={original.bairro} className={tplInputClass} />
          </FormField>
        </Card>

        <div className="flex gap-3">
          <ButtonLink href={detalheHref} variant="ghost" fullWidth>Cancelar</ButtonLink>
          <Button type="submit" fullWidth disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar alterações'}</Button>
        </div>
      </form>
    </AdminShell>
  )
}
