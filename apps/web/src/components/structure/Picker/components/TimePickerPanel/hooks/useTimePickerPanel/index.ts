// External Libraries
import { useState } from "react"

// Utils
import {
  buildTimeValue,
  clampInputValue,
  normalizeDigitInput,
  parseTimeDraft,
} from "@/components/structure/Picker/utils"

// Types
import { PickerPeriod, TimeDraft } from "@/components/structure/Picker/types"

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

  function syncValue(nextDraft: TimeDraft) {
    const nextValue = buildTimeValue(nextDraft)

    if (nextValue) {
      onChange(nextValue)
      return
    }

    if (!nextDraft.hour && !nextDraft.minute) onChange("")
  }

  function handleHourChange(value: string) {
    const updated = { ...draft, hour: normalizeDigitInput(value) }

    setDraft(updated)
    syncValue(updated)
  }

  function handleMinuteChange(value: string) {
    const updated = { ...draft, minute: normalizeDigitInput(value) }

    setDraft(updated)
    syncValue(updated)
  }

  function handleHourBlur() {
    const updated = { ...draft, hour: clampInputValue(draft.hour, 1, 12) }

    setDraft(updated)
    syncValue(updated)
  }

  function handleMinuteBlur() {
    const updated = { ...draft, minute: clampInputValue(draft.minute, 0, 59) }

    setDraft(updated)
    syncValue(updated)
  }

  function handlePeriodChange(period: PickerPeriod) {
    const updated = { ...draft, period }

    setDraft(updated)
    syncValue(updated)
  }

  function handleClear() {
    setDraft({ hour: "", minute: "", period: "AM" })
    onChange("")
    onClose()
  }

  return {
    draft,
    handleClear,
    handlePeriodChange,
    handleHourBlur,
    handleMinuteBlur,
    handleMinuteChange,
    handleHourChange,
  }
}
