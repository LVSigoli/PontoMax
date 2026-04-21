// Components
import { Typography } from "@/components/structure/Typography"

// Constants
import { SOLICITATION_CHART_DATA } from "../../constants"

const MAX_VALUE = 25

export const SolicitationBarChart: React.FC = () => {
  return (
    <section className="rounded-xl bg-surface-card px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h4" value="Solicitacoes de ajuste de ponto" />

        <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary">
          <Legend color="bg-danger-600" label="Recusado" />
          <Legend color="bg-warning-500" label="Pendente" />
          <Legend color="bg-success-600" label="Aprovado" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[2rem_1fr] gap-3">
        <div className="grid h-44 grid-rows-5 text-right text-xs text-content-muted">
          {[25, 20, 15, 10, 5].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>

        <div className="relative h-44">
          <div className="absolute inset-0 grid grid-rows-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="border-t border-border-subtle first:border-t-border-default"
              />
            ))}
          </div>

          <div className="relative z-10 grid h-full grid-cols-6 items-end gap-5 px-3">
            {SOLICITATION_CHART_DATA.map((item) => (
              <div key={item.label} className="grid gap-3">
                <div className="flex h-36 items-end justify-center gap-2">
                  <Bar color="bg-danger-500" value={item.refused} />
                  <Bar color="bg-warning-500" value={item.pending} />
                  <Bar color="bg-success-500" value={item.approved} />
                </div>
                <span className="text-center text-xs text-content-muted">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Bar({ color, value }: { color: string; value: number }) {
  return (
    <span
      className={`w-4 rounded-t-sm ${color}`}
      style={{ height: `${(value / MAX_VALUE) * 100}%` }}
    />
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-4 rounded-sm ${color}`} />
      {label}
    </span>
  )
}
