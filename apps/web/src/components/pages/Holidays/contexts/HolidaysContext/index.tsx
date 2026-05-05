// External Libraries
import { createContext, useContext, useEffect, useMemo } from "react"
import { useSWRConfig } from "swr"

// Contexts
import { useToastContext } from "@/contexts/ToastContext"

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
import { getErrorMessage } from "@/utils/getErrorMessage"

// Types
import type { Holiday, HolidayForm } from "../../types"
import type { HolidaysContextValue, HolidaysProviderProps } from "./types"

// Utils
import { mapHolidayApiToHoliday, mapHolidayTypeToApi } from "../../utils"

const HolidaysContext = createContext<HolidaysContextValue | null>(null)

export const HolidaysProvider: React.FC<HolidaysProviderProps> = ({
  children,
}) => {
  const { showToast } = useToastContext()
  const { mutate: mutateSWRCache } = useSWRConfig()
  const {
    data: holidayItems = [],
    error,
    isLoading,
  } = useHolidaysSWR()
  const holidays = useMemo(
    () => holidayItems.map(mapHolidayApiToHoliday),
    [holidayItems]
  )

  useEffect(() => {
    if (!error) return

    showToast({
      variant: "error",
      message: getErrorMessage(error, "Nao foi possivel carregar os feriados."),
    })
  }, [error, showToast])

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
      showToast({
        variant: "success",
        message: "Feriado removido com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(error, "Nao foi possivel remover o feriado."),
      })

      throw error
    }
  }

  async function saveHoliday(holiday: Holiday | null, form: HolidayForm) {
    try {
      const payload = {
        name: form.name,
        date: form.date,
        type: mapHolidayTypeToApi(form.type),
        companyIds: form.type === "Nacional" ? [] : form.companyIds,
      }

      if (holiday) {
        await updateHoliday(holiday.id, payload)
        await revalidateHolidayData()
        showToast({
          variant: "success",
          message: "Feriado atualizado com sucesso.",
        })
        return
      }

      await createHoliday(payload)
      await revalidateHolidayData()
      showToast({
        variant: "success",
        message: "Feriado criado com sucesso.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        message: getErrorMessage(error, "Nao foi possivel salvar o feriado."),
      })

      throw error
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
