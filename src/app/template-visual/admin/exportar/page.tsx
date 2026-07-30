'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/template-alternativa/AdminShell'
import { Card } from '@/components/template-alternativa/Card'
import { Button } from '@/components/template-alternativa/Button'
import { Toast } from '@/components/template-alternativa/Toast'

const RELATORIOS = [
  { id: 'beneficiarios', icon: '👥', label: 'Beneficiários', desc: 'Lista completa com status de cadastro' },
  { id: 'entregas', icon: '🧺', label: 'Entregas', desc: 'Histórico de entregas e retiradas' },
  { id: 'voluntarios', icon: '🙋', label: 'Voluntários', desc: 'Lista de voluntários ativos e inativos' },
]

export default function TemplateExportarPage() {
  const [gerando, setGerando] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function gerar(id: string, label: string) {
    setGerando(id)
    setTimeout(() => {
      setGerando(null)
      setToast(`Relatório "${label}" gerado (exemplo, nenhum arquivo real foi criado).`)
    }, 900)
  }

  return (
    <AdminShell title="Exportar dados" backHref="/template-visual/admin">
      <div className="space-y-4">
        <p className="text-sm text-[var(--tpl-text-secondary)] leading-relaxed">
          Gere planilhas Excel com os dados do sistema. Neste protótipo, o botão apenas simula a geração.
        </p>

        <div className="space-y-2.5">
          {RELATORIOS.map((r) => (
            <Card key={r.id} className="p-4 flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--tpl-text-primary)]">{r.label}</p>
                <p className="text-xs text-[var(--tpl-text-muted)]">{r.desc}</p>
              </div>
              <Button size="md" disabled={gerando === r.id} onClick={() => gerar(r.id, r.label)} className="!px-3 flex-shrink-0">
                {gerando === r.id ? '…' : 'Exportar'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast} tone="success" onClose={() => setToast(null)} />}
    </AdminShell>
  )
}
