// Assets
import ClockIcon from "@/assets/icons/clock.svg"

// Components
import { Button } from "@/components/structure/Button"
import { Icon } from "@/components/structure/Icon"
import { Typography } from "@/components/structure/Typography"

// Types
import { Props } from "./types"

export const PointCard: React.FC<Props> = ({
  currentDate,
  currentTime,
  workedHours,
  balanceLabel,
  onRegisterPoint,
}) => {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col justify-between gap-8 p-0">
        <div className="flex flex-col justify-start gap-1">
          <Typography variant="h4" value="Registro de ponto" />
          <Typography variant="b2" className="mt-1" value={currentDate} />
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <div className="flex flex-row items-center gap-2 rounded-xl bg-surface-muted px-4 py-3">
            <div className="relative flex size-10 items-center justify-center rounded-lg bg-brand-600 text-content-inverse">
              <Icon src={ClockIcon} size="1.1rem" />
            </div>

            <Typography
              variant="h4"
              fontWeight={700}
              lineHeight="1"
              value={currentTime}
            />
          </div>
        </div>

        <Button fitWidth value="Registrar ponto" onClick={onRegisterPoint} />
      </div>
    </section>
  )
}
