import { Card } from './Card'

export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-bold text-[var(--tpl-primary)] font-tpl-serif">{value}</p>
      <p className="text-xs text-[var(--tpl-text-muted)] uppercase tracking-wide mt-1">{label}</p>
    </Card>
  )
}
