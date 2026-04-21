import type { ReactNode } from "react"
import type { Holiday, HolidayForm } from "../../types"

export interface HolidaysContextValue {
  holidays: Holiday[]
  removeHoliday: (id: number) => void
  saveHoliday: (holiday: Holiday | null, form: HolidayForm) => void
}

export interface HolidaysProviderProps {
  children: ReactNode
}
