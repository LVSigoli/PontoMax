// External Libraries
import React from "react"

// Components
import { Button } from "@/components/structure/Button"
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
    handleConfirm,
    handleHourBlur,
    handleHourChange,
    handleMinuteBlur,
    handleMinuteChange,
  } = useTimePickcerPanel(props)

  return (
    <div className="grid gap-3 bg-surface-overlay px-4 py-4 w-full">
      <Typography variant="b2" value={props.label ?? "Escolha a hora"} />

      <TimeFields
        hour={draft.hour}
        minute={draft.minute}
        onHourBlur={handleHourBlur}
        onHourChange={handleHourChange}
        onMinuteBlur={handleMinuteBlur}
        onMinuteChange={handleMinuteChange}
      />

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="text"
          value="Limpar"
          className="text-content-secondary"
          onClick={handleClear}
        />

        <Button variant="text" value="Confirmar" onClick={handleConfirm} />
      </div>
    </div>
  )
}
