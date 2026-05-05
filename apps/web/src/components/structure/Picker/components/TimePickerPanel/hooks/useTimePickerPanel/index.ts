// External Libraries
import { useState } from "react"

// Utils
import {
  buildTimeValue,
  clampInputValue,
  normalizeDigitInput,
  parseTimeDraft,
} from "@/components/structure/Picker/utils"
import { TimeDraft } from "@/components/structure/Picker/types"

interface useTimePickerPanelParams {
  label?: string
  value: string | Date
  onChange: (value: string) => void
  onClose: () => void
}

export function useTimePickcerPanel({
  value,
  onChange,
  onClose,
}: useTimePickerPanelParams) {
  const [draft, setDraft] = useState<TimeDraft>(() => parseTimeDraft(value))

  function handleHourChange(value: string) {
    setDraft((currentValue) => ({
      ...currentValue,
      hour: normalizeDigitInput(value),
    }))
  }

  function handleMinuteChange(value: string) {
    setDraft((currentValue) => ({
      ...currentValue,
      minute: normalizeDigitInput(value),
    }))
  }

  function handleHourBlur() {
    setDraft((currentValue) => ({
      ...currentValue,
      hour: clampInputValue(currentValue.hour, 0, 23),
    }))
  }

  function handleMinuteBlur() {
    setDraft((currentValue) => ({
      ...currentValue,
      minute: clampInputValue(currentValue.minute, 0, 59),
    }))
  }

  function handleClear() {
    setDraft({ hour: "00", minute: "00" })
    onChange("")
    onClose()
  }

  function handleConfirm() {
    const sanitizedDraft = {
      hour: clampInputValue(draft.hour, 0, 23),
      minute: clampInputValue(draft.minute, 0, 59),
    }

    setDraft(sanitizedDraft)

    const nextValue = buildTimeValue(sanitizedDraft)
    if (!nextValue) return

    onChange(nextValue)
    onClose()
  }

  return {
    draft,
    handleClear,
    handleConfirm,
    handleHourBlur,
    handleMinuteBlur,
    handleMinuteChange,
    handleHourChange,
  }
}
