import { Typography } from "@/components/structure/Typography"

interface SummaryCardProps {
  label: string
  value: number
  subtitle: string
}

export function CalendarSummary({
  total,
  national,
  company,
  monthLabel,
  companyLabel,
}: {
  total: number
  national: number
  company: number
  monthLabel: string
  companyLabel: string
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Feriados do mÃªs"
        value={total}
        subtitle={`No perÃ­odo de ${monthLabel.toLowerCase()}`}
      />
      <SummaryCard
        label="Nacionais"
        value={national}
        subtitle="Aplicados para todas as empresas"
      />
      <SummaryCard
        label="Escopo da empresa"
        value={company}
        subtitle={companyLabel}
      />
    </section>
  )
}

function SummaryCard({ label, value, subtitle }: SummaryCardProps) {
  return (
    <article className="grid gap-2 rounded-2xl border border-border-subtle bg-surface-card p-4">
      <Typography
        variant="legal"
        value={label}
        className="text-content-muted"
      />
      <Typography variant="h4" value={String(value)} className="text-2xl" />
      <Typography
        variant="legal"
        value={subtitle}
        className="text-content-muted"
      />
    </article>
  )
}
