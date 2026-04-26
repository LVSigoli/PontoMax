// Components
import { Typography } from "@/components/structure/Typography"

// Utils
import { getBalanceClass } from "../../utils"
import type { EmployeeHourBalance } from "../../types"

interface Props {
  items: EmployeeHourBalance[]
}

export const HourBalanceList: React.FC<Props> = ({ items }) => {
  return (
    <section className="rounded-xl bg-surface-card px-5 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <Typography variant="h4" value="Saldo de horas por funcionario" />

      <div className="mt-7 grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-6 border-b border-border-subtle px-2 py-4 last:border-b-0"
          >
            <Typography variant="b2" value={item.name} />

            <Typography
              variant="b2"
              value={item.balance}
              className={getBalanceClass(item.status)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
