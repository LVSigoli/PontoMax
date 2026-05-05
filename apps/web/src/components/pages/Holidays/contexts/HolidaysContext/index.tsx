// External Libraries
import { createContext, useContext, useMemo } from "react"
import { useSWRConfig } from "swr"

// Services
import {
  createHoliday,
  deleteHoliday,
  updateHoliday,
} from "@/services/domain"
import {
  swrKeyStartsWith,
  swrKeys,
  useHolidaysSWR,
} from "@/hooks/swr"

// Types
import type { Holiday, HolidayForm } from "../../types"
import type { HolidaysContextValue, HolidaysProviderProps } from "./types"

// Utils
import { mapHolidayApiToHoliday, mapHolidayTypeToApi } from "../../utils"

const HolidaysContext = createContext<HolidaysContextValue | null>(null)

export const HolidaysProvider: React.FC<HolidaysProviderProps> = ({
  children,
}) => {
  const { mutate: mutateSWRCache } = useSWRConfig()
  const { data: holidayItems = [], isLoading } = useHolidaysSWR()
  const holidays = useMemo(
    () => holidayItems.map(mapHolidayApiToHoliday),
    [holidayItems]
  )

  async function revalidateHolidayData() {
    await Promise.all([
      mutateSWRCache(swrKeyStartsWith(swrKeys.holidays.list())),
      mutateSWRCache(swrKeyStartsWith(swrKeys.timeRecords.today())),
      mutateSWRCache(swrKeyStartsWith(swrKeys.timeRecords.summary())),
      mutateSWRCache(swrKeyStartsWith(swrKeys.analytics.dashboard())),
    ])
  }

  async function removeHoliday(id: number) {
    try {
      await deleteHoliday(id)
      await revalidateHolidayData()
    } catch (error) {
      console.log(error)
    }
  }

  async function saveHoliday(holiday: Holiday | null, form: HolidayForm) {
    try {
      const payload = {
        name: form.name,
        date: form.date,
        type: mapHolidayTypeToApi(form.type),
      }

      if (holiday) {
        await updateHoliday(holiday.id, payload)
        await revalidateHolidayData()
        return
      }

      await createHoliday(payload)
      await revalidateHolidayData()
    } catch (error) {
      console.log(error)
    }
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
