import type { PickerType } from "./types"

const INPUT_TYPE_BY_PICKER: Record<PickerType, string> = {
  date: "date",
  dateTime: "datetime-local",
  interval: "time",
  time: "time",
}

export function getPickerInputType(type: PickerType) {
  return INPUT_TYPE_BY_PICKER[type]
}

export function formatPickerValue(value: string | Date) {
  if (value instanceof Date) return value.toISOString().slice(0, 16)

  return value
}
