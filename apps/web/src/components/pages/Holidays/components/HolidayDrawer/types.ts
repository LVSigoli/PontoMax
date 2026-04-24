import type { Holiday } from "../../types"

export interface HolidayDrawerMethods {
  close: () => void
  open: () => void
  toggle: () => void
}

export interface Props {
  element: Holiday | null
}
