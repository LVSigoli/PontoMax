import { useState } from "react"

import { Typography } from "@/components/structure/Typography"

import { TimeFields } from "../TimeFields"
import {
  buildDurationValue,
  clampInputValue,
  normalizeDigitInput,
  parseDurationDraft,
} from "../../utils"
import type { DurationDraft } from "../../types"

interface Props {
  value: string | Date
  onChange: (value: string) => void
  onClose: () => void
}

export const IntervalPickerPanel: React.FC<Props> = ({
  value,
  onChange,
  onClose,
}) => {
  const [draft, setDraft] = useState<DurationDraft>(() => parseDurationDraft(value))

  function syncValue(nextDraft: DurationDraft) {
    const nextValue = buildDurationValue(nextDraft)

    if (nextValue) {
      onChange(nextValue)
      return
    }

    if (!nextDraft.hour && !nextDraft.minute) onChange("")
  }

  function handleHourChange(value: string) {
    const nextDraft = {
      ...draft,
      hour: normalizeDigitInput(value),
    }

    setDraft((currentValue) => ({
      ...currentValue,
      hour: normalizeDigitInput(value),
    }))
    syncValue(nextDraft)
  }

  function handleMinuteChange(value: string) {
    const nextDraft = {
      ...draft,
      minute: normalizeDigitInput(value),
    }

    setDraft((currentValue) => ({
      ...currentValue,
      minute: normalizeDigitInput(value),
    }))
    syncValue(nextDraft)
  }

  function handleHourBlur() {
    const nextDraft = {
      ...draft,
      hour: clampInputValue(draft.hour, 0, 23),
    }

    setDraft(nextDraft)
    syncValue(nextDraft)
  }

  function handleMinuteBlur() {
    const nextDraft = {
      ...draft,
      minute: clampInputValue(draft.minute, 0, 59),
    }

    setDraft(nextDraft)
    syncValue(nextDraft)
  }

  function handleClear() {
    setDraft({
      hour: "",
      minute: "",
    })
    onChange("")
    onClose()
  }

  return (
    <div className="grid gap-3 bg-surface-overlay px-4 py-4">
      <Typography variant="b2" value="Informe a duração" />

      <TimeFields
        hour={draft.hour}
        minute={draft.minute}
        onHourBlur={handleHourBlur}
        onHourChange={handleHourChange}
        onMinuteBlur={handleMinuteBlur}
        onMinuteChange={handleMinuteChange}
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
