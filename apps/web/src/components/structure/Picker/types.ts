export type PickerType = "date" | "time" | "interval" | "dateTime"

export interface Props {
  type: PickerType
  value: string | Date
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}
