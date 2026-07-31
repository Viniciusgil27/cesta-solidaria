'use client'
// src/app/cadastro/page.tsx
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF, formatPhone } from '@/lib/utils'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { FormField, tplInputClass } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white border border-[var(--tpl-border)] rounded-xl p-3 flex flex-col items-center gap-2">
      <span className="text-xs text-[var(--tpl-text-secondary)] text-center leading-tight">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-lg border border-[var(--tpl-border)] flex items-center justify-center text-[var(--tpl-primary)] font-bold hover:bg-[var(--tpl-primary-soft)] transition-colors">−</button>
        <span className="text-base font-bold w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg border border-[var(--tpl-border)] flex items-center justify-center text-[var(--tpl-primary)] font-bold hover:bg-[var(--tpl-primary-soft)] transition-colors">+</button>
      </div>
    </div>
  )
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

export default function CadastroPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', bairro: '',
    criancas: 0, adolescentes: 0, adultos: 0, idosos: 0,
  })

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadErro, setUploadErro] = useState('')
  const [comprovanteUrl, setComprovanteUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setPreviewUrl(URL.createObjectURL(arquivo))
    setUploadStatus('uploading')
    setUploadErro('')
    setComprovanteUrl('')

    const formData = new FormData()
    formData.append('arquivo', arquivo)

    try {
      const res = await fetch('/api/upload/comprovante', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setUploadStatus('error')
        setUploadErro(data.error || 'Erro ao enviar imagem.')
        setPreviewUrl('')
        return
      }
      setComprovanteUrl(data.url)
      setUploadStatus('done')
    } catch {
      setUploadStatus('error')
      setUploadErro('Erro de conexão. Tente novamente.')
      setPreviewUrl('')
    }

    e.target.value = ''
  }

  function removerComprovante() {
    setComprovanteUrl('')
    setPreviewUrl('')
    setUploadStatus('idle')
    setUploadErro('')
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim()) { setErro('Informe seu nome completo.'); return }
    if (form.cpf.replace(/\D/g, '').length < 11) { setErro('Informe um CPF válido.'); return }
    if (!comprovanteUrl) { setErro('Envie o comprovante de residência para continuar.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/beneficiarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cpf: form.cpf.replace(/\D/g, ''),
          comprovanteUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao enviar cadastro.'); return }
      router.push('/cadastro/sucesso')
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
        <h1 className="font-tpl-serif font-bold text-2xl text-[var(--tpl-text-primary)] mt-2 mb-1">Fazer cadastro</h1>
        <p className="text-sm text-[var(--tpl-text-secondary)] mb-6 leading-relaxed">
          Preencha seus dados. A equipe da igreja confirmará seu cadastro antes da próxima entrega.
        </p>

        <form onSubmit={enviar} className="space-y-6">
          {erro && (
            <div className="bg-[var(--tpl-danger-soft)] border border-red-200 rounded-xl p-3 text-sm text-[var(--tpl-danger)] font-medium">{erro}</div>
          )}

          <Card className="p-4 sm:p-5 space-y-3">
            <p className="tpl-eyebrow">Seus dados</p>
            <FormField label="Nome completo" htmlFor="nome" required>
              <input id="nome" className={tplInputClass} placeholder="Seu nome completo" value={form.nome}
                onChange={e => set('nome', e.target.value)} autoComplete="name" />
            </FormField>
            <FormField label="CPF" htmlFor="cpf" required>
              <input id="cpf" className={tplInputClass} placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
                value={form.cpf} onChange={e => set('cpf', formatCPF(e.target.value))} />
            </FormField>
            <FormField label="WhatsApp" htmlFor="telefone">
              <input id="telefone" type="tel" className={tplInputClass} placeholder="(19) 9 0000-0000" value={form.telefone}
                onChange={e => set('telefone', formatPhone(e.target.value))} autoComplete="tel" />
            </FormField>
          </Card>

          <Card className="p-4 sm:p-5 space-y-3">
            <p className="tpl-eyebrow">Endereço</p>
            <FormField label="Rua e número" htmlFor="endereco">
              <input id="endereco" className={tplInputClass} placeholder="Rua, número" value={form.endereco}
                onChange={e => set('endereco', e.target.value)} autoComplete="street-address" />
            </FormField>
            <FormField label="Bairro" htmlFor="bairro">
              <input id="bairro" className={tplInputClass} placeholder="Bairro" value={form.bairro}
                onChange={e => set('bairro', e.target.value)} />
            </FormField>
          </Card>

          <Card className="p-4 sm:p-5">
            <p className="tpl-eyebrow mb-3">Pessoas na casa</p>
            <div className="grid grid-cols-2 gap-2.5">
              <Counter label="0 a 12 anos" value={form.criancas} onChange={v => set('criancas', v)} />
              <Counter label="13 a 17 anos" value={form.adolescentes} onChange={v => set('adolescentes', v)} />
              <Counter label="18 a 59 anos" value={form.adultos} onChange={v => set('adultos', v)} />
              <Counter label="60 ou mais" value={form.idosos} onChange={v => set('idosos', v)} />
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <p className="tpl-eyebrow mb-1">Comprovante de residência <span className="text-[var(--tpl-danger)]">*</span></p>
            <p className="text-xs text-[var(--tpl-text-muted)] mb-3">Conta de luz, água, gás ou correspondência com seu endereço.</p>

            {uploadStatus === 'idle' && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[var(--tpl-border)] rounded-xl p-7 flex flex-col items-center gap-2 hover:border-[var(--tpl-primary)] hover:bg-[var(--tpl-primary-soft)] transition-colors">
                <span className="text-4xl" aria-hidden="true">📄</span>
                <p className="font-semibold text-[var(--tpl-text-primary)] text-sm">Tirar foto ou escolher arquivo</p>
                <p className="text-xs text-[var(--tpl-text-muted)] text-center leading-relaxed">
                  No celular: tire uma foto do documento agora<br />ou selecione uma já salva na galeria
                </p>
              </button>
            )}

            {uploadStatus === 'uploading' && (
              <div className="border-2 border-[var(--tpl-primary-soft)] bg-[var(--tpl-primary-soft)] rounded-xl p-7 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-white border-t-[var(--tpl-primary)] rounded-full animate-spin" aria-hidden="true" />
                <p className="text-sm text-[var(--tpl-primary)] font-medium">Enviando imagem…</p>
              </div>
            )}

            {uploadStatus === 'done' && previewUrl && (
              <div className="border-2 border-emerald-200 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Pré-visualização do comprovante enviado" className="w-full h-52 object-cover" />
                <div className="px-4 py-3 bg-[var(--tpl-success-soft)] flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--tpl-success)]">✅ Comprovante enviado</p>
                  <button type="button" onClick={removerComprovante} className="text-xs text-[var(--tpl-text-muted)] hover:text-[var(--tpl-danger)] underline transition-colors">
                    Trocar
                  </button>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="border-2 border-red-200 bg-[var(--tpl-danger-soft)] rounded-xl p-4 space-y-3">
                <p className="text-sm text-[var(--tpl-danger)] font-medium">⚠️ {uploadErro}</p>
                <button type="button" onClick={() => { setUploadStatus('idle'); setUploadErro('') }}
                  className="text-sm font-semibold underline text-[var(--tpl-danger)]">
                  Tentar novamente
                </button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" className="hidden" onChange={handleArquivo} />
          </Card>

          <Button type="submit" fullWidth size="lg" disabled={loading || uploadStatus === 'uploading'}>
            {loading ? 'Enviando…' : 'Enviar cadastro'}
          </Button>
        </form>
      </div>
    </main>
  )
}
