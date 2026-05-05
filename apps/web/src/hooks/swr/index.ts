import useSWR, { type SWRConfiguration } from "swr"

import { getCurrentUser } from "@/services/auth"
import {
  getAdjustmentRequests,
  getAnalyticsDashboard,
  getCompanies,
  getHolidays,
  getJourneys,
  getTeamToday,
  getTimeRecordsSummary,
  getTodayTimeRecords,
  getUsers,
} from "@/services/domain"

import { swrKeys } from "./keys"

type SWROptions<Data> = SWRConfiguration<Data, Error> & {
  enabled?: boolean
}

function useCachedRequest<Data>(
  key: string,
  fetcher: () => Promise<Data>,
  options?: SWROptions<Data>
) {
  const { enabled = true, ...swrOptions } = options ?? {}

  return useSWR(enabled ? key : null, fetcher, swrOptions)
}

export function useCurrentUserSWR(
  options?: SWROptions<Awaited<ReturnType<typeof getCurrentUser>>>
) {
  return useCachedRequest(swrKeys.auth.currentUser(), getCurrentUser, options)
}

export function useCompaniesSWR(
  options?: SWROptions<Awaited<ReturnType<typeof getCompanies>>>
) {
  return useCachedRequest(swrKeys.companies.list(), getCompanies, options)
}

export function useJourneysSWR(
  params?: Parameters<typeof getJourneys>[0],
  options?: SWROptions<Awaited<ReturnType<typeof getJourneys>>>
) {
  return useCachedRequest(swrKeys.journeys.list(params), () => getJourneys(params), options)
}

export function useUsersSWR(
  params?: Parameters<typeof getUsers>[0],
  options?: SWROptions<Awaited<ReturnType<typeof getUsers>>>
) {
  return useCachedRequest(swrKeys.users.list(params), () => getUsers(params), options)
}

export function useHolidaysSWR(
  options?: SWROptions<Awaited<ReturnType<typeof getHolidays>>>
) {
  return useCachedRequest(swrKeys.holidays.list(), getHolidays, options)
}

export function useAdjustmentRequestsSWR(
  params?: Parameters<typeof getAdjustmentRequests>[0],
  options?: SWROptions<Awaited<ReturnType<typeof getAdjustmentRequests>>>
) {
  return useCachedRequest(
    swrKeys.adjustmentRequests.list(params),
    () => getAdjustmentRequests(params),
    options
  )
}

export function useAnalyticsDashboardSWR(
  params?: Parameters<typeof getAnalyticsDashboard>[0],
  options?: SWROptions<Awaited<ReturnType<typeof getAnalyticsDashboard>>>
) {
  return useCachedRequest(
    swrKeys.analytics.dashboard(params),
    () => getAnalyticsDashboard(params),
    options
  )
}

export function useTodayTimeRecordsSWR(
  options?: SWROptions<Awaited<ReturnType<typeof getTodayTimeRecords>>>
) {
  return useCachedRequest(swrKeys.timeRecords.today(), getTodayTimeRecords, options)
}

export function useTeamTodaySWR(
  options?: SWROptions<Awaited<ReturnType<typeof getTeamToday>>>
) {
  return useCachedRequest(swrKeys.timeRecords.teamToday(), getTeamToday, options)
}

export function useTimeRecordsSummarySWR(
  options?: SWROptions<Awaited<ReturnType<typeof getTimeRecordsSummary>>>
) {
  return useCachedRequest(
    swrKeys.timeRecords.summary(),
    getTimeRecordsSummary,
    options
  )
}

export * from "./config"
export * from "./keys"
