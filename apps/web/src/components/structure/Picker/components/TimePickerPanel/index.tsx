// External Libraries

// Components
import { Typography } from "@/components/structure/Typography"
import { TimeFields } from "../TimeFields"

// Hooks
import { useTimePickcerPanel } from "./hooks/useTimePickerPanel"

interface Props {
  label?: string
  value: string | Date
  onChange: (value: string) => void
  onClose: () => void
}

export const TimePickerPanel: React.FC<Props> = (props) => {
  // Hooks
  const {
    draft,
    handleClear,
    handleHourBlur,
    handleHourChange,
    handleMinuteBlur,
    handleMinuteChange,
    handlePeriodChange,
  } = useTimePickcerPanel(props)

  return (
    <div className="grid gap-3 bg-surface-overlay px-4 py-4 w-full">
      <Typography variant="b2" value={props.label ?? "Escolha a hora"} />

      <TimeFields
        hour={draft.hour}
        minute={draft.minute}
        period={draft.period}
        showPeriod
        onHourBlur={handleHourBlur}
        onHourChange={handleHourChange}
        onMinuteBlur={handleMinuteBlur}
        onMinuteChange={handleMinuteChange}
        onPeriodChange={handlePeriodChange}
      />

      <button
        type="button"
        className="justify-self-start text-sm font-medium text-content-secondary transition hover:text-brand-600"
        onClick={handleClear}
      >
        Limpar
      </button>
    </div>
  )
}
