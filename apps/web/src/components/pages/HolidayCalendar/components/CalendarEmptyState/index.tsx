import { Typography } from "@/components/structure/Typography"

export function CalendarEmptyState() {
  return (
    <div className="grid gap-2 rounded-2xl border border-dashed border-border-subtle bg-surface-page px-4 py-5 text-center">
      <Typography
        variant="b2"
        value="Nenhum feriado encontrado"
        className="font-semibold"
      />
      <Typography
        variant="legal"
        value="A combinaÃ§Ã£o atual de empresa e perÃ­odo nÃ£o possui feriados ativos."
        className="text-content-muted"
      />
    </div>
  )
}
