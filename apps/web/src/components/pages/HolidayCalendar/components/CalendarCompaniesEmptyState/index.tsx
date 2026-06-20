import { Typography } from "@/components/structure/Typography"

export function CalendarCompaniesEmptyState() {
  return (
    <div className="grid gap-2 rounded-2xl border border-dashed border-border-subtle bg-surface-page px-4 py-5 text-center">
      <Typography
        variant="b2"
        value="Nenhuma empresa disponÃ­vel"
        className="font-semibold"
      />
      <Typography
        variant="legal"
        value="NÃ£o encontramos empresas para montar o calendÃ¡rio."
        className="text-content-muted"
      />
    </div>
  )
}
