import { useMemo, useState } from "react"

import type { SelectionOption } from "@/components/structure/Select/types"
import {
  DATE_RANGE_PRESET_OPTIONS,
  DEFAULT_DATE_RANGE_PRESET,
  type DateRangePreset,
  formatDateRangeSummary,
  resolveDateRangePreset,
} from "@/utils/dateRangeFilter"

interface Params {
  defaultPreset?: DateRangePreset
  referenceDate?: Date
  maxDate?: string
}

export function useDateRangeFilter(params?: Params) {
  const {
    defaultPreset = DEFAULT_DATE_RANGE_PRESET,
    referenceDate,
    maxDate,
  } = params ?? {}
  const initialRange = resolveDateRangePreset(defaultPreset, referenceDate)

  const [selectedPeriod, setSelectedPeriod] =
    useState<DateRangePreset>(defaultPreset)
  const [customFrom, setCustomFrom] = useState(initialRange.from)
  const [customTo, setCustomTo] = useState(initialRange.to)

  const activeRange = useMemo(() => {
    if (selectedPeriod === "custom") {
      return {
        from: customFrom,
        to: customTo,
      }
    }

    return resolveDateRangePreset(selectedPeriod, referenceDate)
  }, [customFrom, customTo, referenceDate, selectedPeriod])

  const selectedPeriodOption = useMemo(() => {
    return DATE_RANGE_PRESET_OPTIONS.filter(
      (option) => option.value === selectedPeriod
    )
  }, [selectedPeriod])

  const periodSummary = useMemo(
    () => formatDateRangeSummary(selectedPeriod, activeRange),
    [activeRange, selectedPeriod]
  )

  function clampDate(value: string) {
    if (!maxDate || !value) return value

    return value > maxDate ? maxDate : value
  }

  function handlePeriodChange(selection: SelectionOption[]) {
    const nextPeriod = selection[0]?.value as DateRangePreset | undefined

    if (!nextPeriod) return

    if (nextPeriod !== "custom") {
      const nextRange = resolveDateRangePreset(nextPeriod, referenceDate)
      setCustomFrom(nextRange.from)
      setCustomTo(nextRange.to)
    }

    setSelectedPeriod(nextPeriod)
  }

  function handleCustomFromChange(value: string) {
    if (!value) return

    const nextValue = clampDate(value)

    setCustomFrom(nextValue)

    if (customTo && nextValue > customTo) {
      setCustomTo(nextValue)
    }
  }

  function handleCustomToChange(value: string) {
    if (!value) return

    const nextValue = clampDate(value)

    setCustomTo(nextValue)

    if (customFrom && nextValue < customFrom) {
      setCustomFrom(nextValue)
    }
  }

  return {
    activeRange,
    customFrom,
    customTo,
    isCustomPeriod: selectedPeriod === "custom",
    periodOptions: DATE_RANGE_PRESET_OPTIONS,
    periodSummary,
    selectedPeriod,
    selectedPeriodOption,
    handleCustomFromChange,
    handleCustomToChange,
    handlePeriodChange,
  }
}
