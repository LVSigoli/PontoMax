// External Libraries
import { createContext, useContext, useEffect, useState } from "react"

// Services
import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday,
} from "@/services/domain"

// Types
import type { Holiday, HolidayForm } from "../../types"
import type { HolidaysContextValue, HolidaysProviderProps } from "./types"

// Utils
import { mapHolidayApiToHoliday, mapHolidayTypeToApi } from "../../utils"

const HolidaysContext = createContext<HolidaysContextValue | null>(null)

export const HolidaysProvider: React.FC<HolidaysProviderProps> = ({
  children,
}) => {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void loadHolidays()
  }, [])

  async function loadHolidays() {
    try {
      setIsLoading(true)
      const items = await getHolidays()
      setHolidays(items.map(mapHolidayApiToHoliday))
    } finally {
      setIsLoading(false)
    }
  }

  async function removeHoliday(id: number) {
    await deleteHoliday(id)
    setHolidays((currentHolidays) =>
      currentHolidays.filter((holiday) => holiday.id !== id)
    )
  }

  async function saveHoliday(holiday: Holiday | null, form: HolidayForm) {
    const payload = {
      name: form.name,
      date: form.date,
      type: mapHolidayTypeToApi(form.type),
    }

    if (holiday) {
      const updatedHoliday = await updateHoliday(holiday.id, payload)
      setHolidays((currentHolidays) =>
        currentHolidays.map((currentHoliday) =>
          currentHoliday.id === holiday.id
            ? mapHolidayApiToHoliday(updatedHoliday)
            : currentHoliday
        )
      )
      return
    }

    const createdHoliday = await createHoliday(payload)
    setHolidays((currentHolidays) => [
      ...currentHolidays,
      mapHolidayApiToHoliday(createdHoliday),
    ])
  }

  const value: HolidaysContextValue = {
    isLoading,
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
