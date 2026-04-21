// Components
import { Typography } from "@/components/structure/Typography"

// Constants
import { EMPLOYEE_HOUR_BALANCES } from "../../constants"

// Utils
import { getBalanceClass } from "../../utils"

export const HourBalanceList: React.FC = () => {
  return (
    <section className="rounded-xl bg-surface-card px-5 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <Typography variant="h4" value="Saldo de horas por funcionario" />

      <div className="mt-7 grid">
        {EMPLOYEE_HOUR_BALANCES.map((item) => (
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
