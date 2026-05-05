import type { ReactNode, RefObject } from "react"

import type { IconName } from "../Icon"

export type PickerType = "date" | "time" | "interval" | "dateTime"
export type PickerVariant = "default" | "table"

export interface Props {
  type: PickerType
  value: string | Date
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  fieldClassName?: string
  panelClassName?: string
  disabled?: boolean
  variant?: PickerVariant
}

export interface PickerPanelPosition {
  left: number
  top: number
  width: number
}

export interface CalendarDay {
  key: string
  date: Date
  isCurrentMonth: boolean
}

export interface TimeDraft {
  hour: string
  minute: string
}

export interface DurationDraft {
  hour: string
  minute: string
}

export interface PickerFieldProps {
  disabled?: boolean
  iconName: IconName
  isOpen: boolean
  label?: string
  placeholder: string
  value: string
  variant: PickerVariant
  className?: string
  onClick: () => void
}

export interface PickerPanelProps {
  children: ReactNode
  className?: string
  panelRef: RefObject<HTMLDivElement | null>
  position: PickerPanelPosition
}
