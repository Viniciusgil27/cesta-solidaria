'use client'
// src/app/consulta/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { formatCPF, formatDateTime } from '@/lib/utils'
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { FormField, tplInputClass } from '@/components/ui/FormField'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'

type Resultado =
  | { status: 'nao_encontrado' }
  | { status: 'pendente' }
  | { status: 'aprovado'; nome: string; cpfMascarado: string; aprovadoEm?: string }
  | { status: 'rejeitado'; cpfMascarado: string; motivoRejeicao?: string; rejeitadoEm?: string }

export default function ConsultaPage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)

  async function consultar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setResultado(null)

    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) { setErro('Informe um CPF válido.'); return }

    setLoading(true)
    try {
      const res = await fetch(`/api/consulta/${cpfLimpo}`)
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao consultar. Tente novamente.'); return }
      setResultado(data)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col">
      <Header />

      <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full">
        <Link href="/" className="text-sm text-[var(--tpl-primary)] font-semibold hover:underline">‹ Início</Link>
        <h1 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)] mt-2 mb-1">Consultar cadastro</h1>
        <p className="text-sm text-[var(--tpl-text-secondary)] mb-6 leading-relaxed">
          Digite o CPF utilizado no cadastro para ver a situação atual.
        </p>

        <form onSubmit={consultar} className="space-y-3">
          <FormField label="CPF" htmlFor="cpf-consulta">
            <input id="cpf-consulta" className={tplInputClass} placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
              value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} />
          </FormField>

          {erro && <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>}

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Consultando…' : 'Consultar'}
          </Button>
        </form>

        {loading && <LoadingState label="Consultando cadastro…" />}

        {!loading && resultado && (
          <div className="mt-5">
            {resultado.status === 'nao_encontrado' && (
              <Card className="p-5 text-center">
                <p className="text-3xl mb-2" aria-hidden="true">🔍</p>
                <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-text-primary)] mb-1">Cadastro não encontrado</p>
                <p className="text-sm text-[var(--tpl-text-secondary)] mb-4">Não encontramos nenhum cadastro para este CPF.</p>
                <ButtonLink href="/cadastro" fullWidth>Fazer cadastro</ButtonLink>
              </Card>
            )}

            {resultado.status === 'pendente' && (
              <div className="rounded-2xl p-5 text-center bg-[var(--tpl-warning-soft)] border border-amber-200">
                <p className="text-3xl mb-2" aria-hidden="true">⏳</p>
                <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-warning)] mb-1">Cadastro em análise</p>
                <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed">
                  Seu cadastro foi recebido e está em análise pela equipe responsável.
                </p>
              </div>
            )}

            {resultado.status === 'aprovado' && (
              <div className="rounded-2xl p-5 text-center bg-[var(--tpl-success-soft)] border border-emerald-200">
                <p className="text-3xl mb-2" aria-hidden="true">✅</p>
                <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-success)] mb-1">Cadastro aprovado</p>
                <p className="text-sm text-[var(--tpl-text-secondary)] mb-3">Seu cadastro foi aprovado.</p>
                <div className="bg-white rounded-xl p-3.5 text-left text-sm space-y-1.5">
                  <p><span className="text-[var(--tpl-text-muted)]">Nome: </span><span className="font-semibold text-[var(--tpl-text-primary)]">{resultado.nome}</span></p>
                  <p><span className="text-[var(--tpl-text-muted)]">CPF: </span><span className="font-semibold text-[var(--tpl-text-primary)]">{resultado.cpfMascarado}</span></p>
                  {resultado.aprovadoEm && (
                    <p><span className="text-[var(--tpl-text-muted)]">Aprovado em: </span><span className="font-semibold text-[var(--tpl-text-primary)]">{formatDateTime(resultado.aprovadoEm)}</span></p>
                  )}
                </div>
              </div>
            )}

            {resultado.status === 'rejeitado' && (
              <div className="rounded-2xl p-5 text-center bg-[var(--tpl-danger-soft)] border border-red-200">
                <p className="text-3xl mb-2" aria-hidden="true">❌</p>
                <p className="font-tpl-serif font-bold text-lg text-[var(--tpl-danger)] mb-1">Cadastro não aprovado</p>
                <p className="text-sm text-[var(--tpl-text-secondary)] mb-3">Seu cadastro não foi aprovado.</p>
                {resultado.motivoRejeicao && (
                  <div className="bg-white rounded-xl p-3.5 text-left">
                    <p className="text-xs font-semibold text-[var(--tpl-text-muted)] mb-1">Motivo</p>
                    <p className="text-sm text-[var(--tpl-text-primary)]">{resultado.motivoRejeicao}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
