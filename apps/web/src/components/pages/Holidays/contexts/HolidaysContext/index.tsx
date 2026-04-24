// External Libraries
import { createContext, useContext, useState } from "react"

// Constants
import { INITIAL_HOLIDAYS } from "../../constants"

// Types
import type { Holiday, HolidayForm } from "../../types"
import type { HolidaysContextValue, HolidaysProviderProps } from "./types"

const HolidaysContext = createContext<HolidaysContextValue | null>(null)

export const HolidaysProvider: React.FC<HolidaysProviderProps> = ({
  children,
}) => {
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS)

  function removeHoliday(id: number) {
    setHolidays((currentHolidays) =>
      currentHolidays.filter((holiday) => holiday.id !== id)
    )
  }

  function saveHoliday(holiday: Holiday | null, form: HolidayForm) {
    if (holiday) {
      setHolidays((currentHolidays) =>
        currentHolidays.map((currentHoliday) =>
          currentHoliday.id === holiday.id
            ? { ...currentHoliday, ...form }
            : currentHoliday
        )
      )
      return
    }

    setHolidays((currentHolidays) => [
      ...currentHolidays,
      {
        id: Date.now(),
        status: "Ativo",
        ...form,
      },
    ])
  }

  const value: HolidaysContextValue = {
    holidays,
    removeHoliday,
    saveHoliday,
  }

  return (
    <HolidaysContext.Provider value={value}>
      {children}
    </HolidaysContext.Provider>
  )
}

export function useHolidaysContext() {
  const context = useContext(HolidaysContext)

  if (!context) {
    throw new Error("useHolidaysContext must be used inside HolidaysProvider")
  }

  return context
}
