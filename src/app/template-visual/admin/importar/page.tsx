'use client'
import { useRef, useState } from 'react'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Card } from '@/components/template-alternativa/Card'
import { Button } from '@/components/template-alternativa/Button'

type Status = 'idle' | 'processando' | 'concluido'

export default function TemplateImportarPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [arquivo, setArquivo] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function selecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArquivo(file.name)
    setStatus('processando')
    setTimeout(() => setStatus('concluido'), 1200)
    e.target.value = ''
  }

  return (
    <AdminShell title="Importar Excel" backHref="/template-visual/admin">
      <div className="space-y-5">
        <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed">
          Envie uma planilha (.xlsx) para atualizar a base de beneficiários em lote. Nenhum arquivo é processado de
          verdade neste protótipo — apenas o fluxo visual é simulado.
        </p>

        {status === 'idle' && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-[var(--tpl-border)] rounded-2xl p-10 flex flex-col items-center gap-2 hover:border-[var(--tpl-primary)] hover:bg-[var(--tpl-primary-soft)] transition-colors">
            <span className="text-4xl" aria-hidden="true">📥</span>
            <p className="font-semibold text-[var(--tpl-text-primary)] text-sm">Selecionar planilha</p>
            <p className="text-xs text-[var(--tpl-text-muted)]">Formato .xlsx, colunas conforme o modelo</p>
          </button>
        )}

        {status === 'processando' && (
          <Card className="p-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-[var(--tpl-primary-soft)] border-t-[var(--tpl-primary)] rounded-full animate-spin" aria-hidden="true" />
            <p className="text-sm text-[var(--tpl-text-secondary)]">Processando {arquivo}…</p>
          </Card>
        )}

        {status === 'concluido' && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[var(--tpl-success)]">
              <span className="text-xl" aria-hidden="true">✅</span>
              <p className="font-semibold text-sm">Importação concluída (exemplo)</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-lg font-bold text-[var(--tpl-primary)]">18</p><p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">Novos</p></div>
              <div><p className="text-lg font-bold text-[var(--tpl-primary)]">6</p><p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">Atualizados</p></div>
              <div><p className="text-lg font-bold text-[var(--tpl-danger)]">1</p><p className="text-[10px] text-[var(--tpl-text-muted)] uppercase">Com erro</p></div>
            </div>
            <Button variant="ghost" fullWidth onClick={() => { setStatus('idle'); setArquivo(null) }}>Importar outra planilha</Button>
          </Card>
        )}

        <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={selecionar} />
      </div>
    </AdminShell>
  )
}
