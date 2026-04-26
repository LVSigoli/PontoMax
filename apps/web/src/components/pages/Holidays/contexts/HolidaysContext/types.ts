import type { ReactNode } from "react"
import type { Holiday, HolidayForm } from "../../types"

export interface HolidaysContextValue {
  isLoading: boolean
  holidays: Holiday[]
  removeHoliday: (id: number) => Promise<void>
  saveHoliday: (holiday: Holiday | null, form: HolidayForm) => Promise<void>
}

export interface HolidaysProviderProps {
  children: ReactNode
}
